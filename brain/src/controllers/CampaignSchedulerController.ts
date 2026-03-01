import { Request, Response } from "express";
import { Server } from "socket.io";
import cron, { ScheduledTask } from "node-cron";
import TelegramController from "./TelegramController";

interface ScheduledCampaign {
  id: string;
  name: string;
  accountId: string;
  groups: any[];
  message: string;
  file?: any;
  config: any;
  schedule: {
    type: 'once' | 'recurring';
    cronExpression?: string;
    repeatEvery?: number; // hours
    startTime?: Date;
    endTime?: Date;
    maxRepeats?: number;
  };
  status: 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
  repeatCount: number;
  maxRepeats?: number;
  results: CampaignRepeatResult[];
  currentJob?: ScheduledTask;
}

interface CampaignRepeatResult {
  repeatNumber: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  sent: number;
  failed: number;
  total: number;
  error?: string;
}

class CampaignSchedulerController {
  private static campaigns: Map<string, ScheduledCampaign> = new Map();
  private static activeOperations = new Map<string, AbortController>();

  static async createScheduledCampaign(req: Request, io: Server): Promise<ScheduledCampaign> {
    const { name, accountId, groups, message, config, schedule, file } = req.body;

    if (!name || !accountId || !groups || !message || !schedule) {
      throw new Error("Missing required parameters: name, accountId, groups, message, schedule");
    }

    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const campaign: ScheduledCampaign = {
      id: campaignId,
      name,
      accountId,
      groups,
      message,
      file,
      config,
      schedule,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      repeatCount: 0,
      results: [],
      maxRepeats: schedule.maxRepeats || schedule.repeatEvery ? undefined : 1
    };

    // Calculate next run time
    this.updateNextRunTime(campaign);
    
    this.campaigns.set(campaignId, campaign);
    
    // Schedule the campaign
    if (campaign.schedule.type === 'recurring' && campaign.schedule.repeatEvery) {
      this.scheduleRecurringCampaign(campaign, io);
    } else if (campaign.schedule.type === 'once' && campaign.schedule.startTime) {
      this.scheduleOneTimeCampaign(campaign, io);
    }

    io.emit("campaign-scheduled", {
      campaignId,
      name,
      schedule: campaign.schedule,
      nextRun: campaign.nextRun,
      message: `Campaign "${name}" scheduled successfully`
    });

    return campaign;
  }

  static async getScheduledCampaigns(): Promise<ScheduledCampaign[]> {
    return Array.from(this.campaigns.values());
  }

  static async getCampaignById(campaignId: string): Promise<ScheduledCampaign | undefined> {
    return this.campaigns.get(campaignId);
  }

  static async cancelCampaign(campaignId: string, io: Server): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return false;
    }

    // Cancel the cron job
    if (campaign.currentJob) {
      campaign.currentJob.stop();
      campaign.currentJob = undefined;
    }

    // Cancel any active operation
    const abortController = this.activeOperations.get(campaignId);
    if (abortController) {
      abortController.abort();
      this.activeOperations.delete(campaignId);
    }

    campaign.status = 'cancelled';
    campaign.updatedAt = new Date();

    io.emit("campaign-cancelled", {
      campaignId,
      name: campaign.name,
      message: `Campaign "${campaign.name}" cancelled successfully`
    });

    return true;
  }

  static async pauseCampaign(campaignId: string, io: Server): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== 'scheduled') {
      return false;
    }

    if (campaign.currentJob) {
      campaign.currentJob.stop();
      campaign.currentJob = undefined;
    }

    campaign.status = 'paused';
    campaign.updatedAt = new Date();

    io.emit("campaign-paused", {
      campaignId,
      name: campaign.name,
      message: `Campaign "${campaign.name}" paused successfully`
    });

    return true;
  }

  static async resumeCampaign(campaignId: string, io: Server): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== 'paused') {
      return false;
    }

    campaign.status = 'scheduled';
    this.updateNextRunTime(campaign);
    
    if (campaign.schedule.type === 'recurring' && campaign.schedule.repeatEvery) {
      this.scheduleRecurringCampaign(campaign, io);
    }

    campaign.updatedAt = new Date();

    io.emit("campaign-resumed", {
      campaignId,
      name: campaign.name,
      nextRun: campaign.nextRun,
      message: `Campaign "${campaign.name}" resumed successfully`
    });

    return true;
  }

  private static updateNextRunTime(campaign: ScheduledCampaign): void {
    const now = new Date();
    
    if (campaign.schedule.type === 'once') {
      if (campaign.schedule.startTime && campaign.schedule.startTime > now) {
        campaign.nextRun = campaign.schedule.startTime;
      } else {
        campaign.nextRun = now;
      }
    } else if (campaign.schedule.type === 'recurring' && campaign.schedule.repeatEvery) {
      if (campaign.lastRun) {
        campaign.nextRun = new Date(campaign.lastRun.getTime() + campaign.schedule.repeatEvery * 60 * 60 * 1000);
      } else {
        campaign.nextRun = now;
      }
    }

    // Check if we've reached max repeats
    if (campaign.maxRepeats && campaign.repeatCount >= campaign.maxRepeats) {
      campaign.nextRun = undefined;
      campaign.status = 'completed';
    }

    // Check end time
    if (campaign.schedule.endTime && campaign.nextRun && campaign.nextRun > campaign.schedule.endTime) {
      campaign.nextRun = undefined;
      campaign.status = 'completed';
    }
  }

  private static scheduleRecurringCampaign(campaign: ScheduledCampaign, io: Server): void {
    if (campaign.currentJob) {
      campaign.currentJob.stop();
    }

    // Convert repeatEvery (hours) to cron expression
    const hours = campaign.schedule.repeatEvery || 1;
    const cronExpression = `0 */${hours} * * *`; // Every X hours

    campaign.currentJob = cron.schedule(
      cronExpression,
      async () => {
        await this.executeCampaign(campaign, io);
      },
      {
        timezone: 'UTC'
      }
    );
  }

  private static scheduleOneTimeCampaign(campaign: ScheduledCampaign, io: Server): void {
    if (campaign.currentJob) {
      campaign.currentJob.stop();
    }

    const executeTime = campaign.schedule.startTime || new Date();
    const delay = executeTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(async () => {
        await this.executeCampaign(campaign, io);
      }, delay);
    } else {
      // Execute immediately
      this.executeCampaign(campaign, io);
    }
  }

  private static async executeCampaign(campaign: ScheduledCampaign, io: Server): Promise<void> {
    if (campaign.status === 'cancelled' || campaign.status === 'completed') {
      return;
    }

    campaign.status = 'running';
    campaign.lastRun = new Date();
    campaign.repeatCount++;
    campaign.updatedAt = new Date();

    const repeatResult: CampaignRepeatResult = {
      repeatNumber: campaign.repeatCount,
      startTime: new Date(),
      status: 'running',
      sent: 0,
      failed: 0,
      total: campaign.groups.length
    };

    campaign.results.push(repeatResult);

    io.emit("campaign-repeat-start", {
      campaignId: campaign.id,
      repeatNumber: campaign.repeatCount,
      maxRepeats: campaign.maxRepeats,
      total: campaign.groups.length,
      message: `Campaign "${campaign.name}" - Repeat ${campaign.repeatCount} started`
    });

    try {
      // Create abort controller for this execution
      const abortController = new AbortController();
      this.activeOperations.set(campaign.id, abortController);

      // Execute the campaign using TelegramController
      const result = await TelegramController.executeScheduledCampaign(
        campaign.accountId,
        campaign.groups,
        campaign.message,
        campaign.file,
        campaign.config,
        io,
        `${campaign.id}-repeat-${campaign.repeatCount}`,
        abortController.signal
      );

      // Update repeat result
      repeatResult.endTime = new Date();
      repeatResult.status = 'completed';
      repeatResult.sent = result.sent?.length || 0;
      repeatResult.failed = result.failed?.length || 0;

      io.emit("campaign-repeat-complete", {
        campaignId: campaign.id,
        repeatNumber: campaign.repeatCount,
        result: {
          sent: repeatResult.sent,
          failed: repeatResult.failed,
          total: repeatResult.total
        },
        message: `Campaign "${campaign.name}" - Repeat ${campaign.repeatCount} completed`
      });

      // Clean up abort controller
      this.activeOperations.delete(campaign.id);

      // Update campaign status
      if (campaign.schedule.type === 'once') {
        campaign.status = 'completed';
      } else {
        campaign.status = 'scheduled';
        this.updateNextRunTime(campaign);
        
        // Reschedule if needed
        if (campaign.nextRun && campaign.schedule.type === 'recurring') {
          this.scheduleRecurringCampaign(campaign, io);
        }
      }

    } catch (error: any) {
      repeatResult.endTime = new Date();
      repeatResult.status = 'failed';
      repeatResult.error = error.message;

      io.emit("campaign-repeat-error", {
        campaignId: campaign.id,
        repeatNumber: campaign.repeatCount,
        error: error.message,
        message: `Campaign "${campaign.name}" - Repeat ${campaign.repeatCount} failed`
      });

      // Clean up abort controller
      this.activeOperations.delete(campaign.id);

      campaign.status = 'scheduled';
      this.updateNextRunTime(campaign);
    }

    campaign.updatedAt = new Date();
  }

  static async getCampaignStatistics(campaignId: string): Promise<any> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const totalSent = campaign.results.reduce((sum, result) => sum + result.sent, 0);
    const totalFailed = campaign.results.reduce((sum, result) => sum + result.failed, 0);
    const totalProcessed = totalSent + totalFailed;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      lastRun: campaign.lastRun,
      nextRun: campaign.nextRun,
      repeatCount: campaign.repeatCount,
      maxRepeats: campaign.maxRepeats,
      schedule: campaign.schedule,
      statistics: {
        totalSent,
        totalFailed,
        totalProcessed,
        successRate: totalProcessed > 0 ? (totalSent / totalProcessed) * 100 : 0,
        repeats: campaign.results.length
      },
      results: campaign.results.map(result => ({
        repeatNumber: result.repeatNumber,
        startTime: result.startTime,
        endTime: result.endTime,
        status: result.status,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        error: result.error
      }))
    };
  }
}

export default CampaignSchedulerController;
