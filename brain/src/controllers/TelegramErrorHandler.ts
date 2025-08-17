class TelegramErrorHandler {
    private static telegramErrors = {
        // Authentication errors
        'AUTH_KEY_INVALID': {
            code: 401,
            message: 'Authentication key invalid - please re-login',
            action: 'relogin'
        },
        'AUTH_KEY_PERM_EMPTY': {
            code: 401,
            message: 'Temporary auth key expired',
            action: 'relogin'
        },
        'AUTH_KEY_UNREGISTERED': {
            code: 401,
            message: 'Auth key not registered - please re-login',
            action: 'relogin'
        },
        'SESSION_PASSWORD_NEEDED': {
            code: 402,
            message: 'Two-factor authentication required',
            action: 'request_2fa'
        },
        'SESSION_REVOKED': {
            code: 401,
            message: 'Session revoked - please re-login',
            action: 'relogin'
        },
        'USER_DEACTIVATED': {
            code: 403,
            message: 'User account deactivated',
            action: 'contact_support'
        },
        'USER_DEACTIVATED_BAN': {
            code: 403,
            message: 'User banned',
            action: 'contact_support'
        },

        // Flood/rate limiting errors
        'FLOOD_WAIT': {
            code: 429,
            message: 'Too many requests - please wait',
            action: 'retry_after_wait'
        },
        'FLOOD_TEST_PHONE_WAIT': {
            code: 429,
            message: 'Too many phone verification attempts',
            action: 'retry_after_wait'
        },
        'FLOOD_PREMIUM_WAIT': {
            code: 429,
            message: 'Premium account flood wait',
            action: 'retry_after_wait'
        },

        // Phone number errors
        'PHONE_NUMBER_INVALID': {
            code: 400,
            message: 'Invalid phone number format',
            action: 'correct_input'
        },
        'PHONE_NUMBER_BANNED': {
            code: 403,
            message: 'Phone number banned',
            action: 'contact_support'
        },
        'PHONE_NUMBER_FLOOD': {
            code: 429,
            message: 'Too many requests with this phone',
            action: 'retry_after_wait'
        },
        'PHONE_NUMBER_OCCUPIED': {
            code: 400,
            message: 'Phone number already in use',
            action: 'use_different_number'
        },
        'PHONE_CODE_INVALID': {
            code: 400,
            message: 'Invalid verification code',
            action: 'retry_with_correct_code'
        },
        'PHONE_CODE_EXPIRED': {
            code: 400,
            message: 'Verification code expired',
            action: 'request_new_code'
        },

        // API/Server errors
        'API_ID_INVALID': {
            code: 400,
            message: 'Invalid API ID',
            action: 'check_credentials'
        },
        'API_ID_PUBLISHED_FLOOD': {
            code: 400,
            message: 'API ID published flood',
            action: 'contact_support'
        },
        'PHONE_MIGRATE': {
            code: 303,
            message: 'Phone number migrated to another data center',
            action: 'auto_migrate'
        },
        'NETWORK_MIGRATE': {
            code: 303,
            message: 'Network migrated to another data center',
            action: 'auto_migrate'
        },
        'USER_MIGRATE': {
            code: 303,
            message: 'User migrated to another data center',
            action: 'auto_migrate'
        },
        'FILE_REFERENCE_EXPIRED': {
            code: 400,
            message: 'File reference expired',
            action: 'refresh_content'
        },
        'INPUT_REQUEST_TOO_LONG': {
            code: 400,
            message: 'Input request too long',
            action: 'reduce_request_size'
        },
        'MSG_WAIT_FAILED': {
            code: 400,
            message: 'Message wait failed',
            action: 'retry'
        },
    

        // General errors
        'INTERNAL_SERVER_ERROR': {
            code: 500,
            message: 'Telegram server error',
            action: 'retry_later'
        },
        'RPC_CALL_FAIL': {
            code: 500,
            message: 'Remote procedure call failed',
            action: 'retry'
        },
        'TIMEOUT': {
            code: 504,
            message: 'Request timeout',
            action: 'retry'
        }
    };

    // Handle FLOOD_WAIT with dynamic wait time extraction
    private static handleFloodWait(errorMessage: string) {
        const waitMatch = errorMessage.match(/FLOOD_WAIT_(\d+)/);
        const waitTime = waitMatch ? parseInt(waitMatch[1]) : 30;

        return {
            ...this.telegramErrors['FLOOD_WAIT'],
            waitTime,
            message: `Too many requests. Please wait ${waitTime} seconds before trying again.`
        };
    }

    // Main error classification function
    static handleError(error: any): {
        code: number,
        message: string,
        action: string,
        originalError?: string,
        waitTime?: number
    } {
        // Handle Error instances
        if (error instanceof Error) {
            return {
                code: 500,
                message: error.message,
                action: 'check_logs',
                originalError: error.stack
            };
        }

        // Handle Telegram API errors
        const errorMessage = error?.error_message || error?.message || 'UNKNOWN_ERROR';

        // Special handling for FLOOD_WAIT with dynamic time
        if (errorMessage.includes('FLOOD_WAIT')) {
            return this.handleFloodWait(errorMessage);
        }

        // Check if we have a defined error
        for (const [pattern, handler] of Object.entries(this.telegramErrors)) {
            if (errorMessage.includes(pattern)) {
                return {
                    ...handler,
                    originalError: errorMessage
                };
            }
        }

        // Default unknown error handler
        return {
            code: 500,
            message: 'Unknown Telegram API error',
            action: 'contact_support',
            originalError: errorMessage
        };
    }

    // Format error for display/logging
    static formatError(error: any): string {
        const handled = this.handleError(error);
        return `[${handled.code}] ${handled.message} | Action: ${handled.action}` +
            (handled.originalError ? ` | Original: ${handled.originalError}` : '');
    }

    // Display error to user (could be connected to UI)
    static displayError(error: any, io?: any): void {
        const handled = this.handleError(error);

        const errorData = {
            code: handled.code,
            message: handled.message,
            action: handled.action,
            ...(handled.waitTime && { waitTime: handled.waitTime }),
            timestamp: new Date().toISOString()
        };

        // Log to console
        console.error('Telegram API Error:', errorData);

        // Emit via Socket.IO if available
        if (io) {
            io.emit('display-error', errorData);
        }

        // TODO: Connect to your UI notification system
        // Example: showToast(handled.message, 'error');
    }
}

// Usage examples:
/*
try {
  // Your Telegram API call
} catch (error) {
  // Basic usage
  TelegramErrorHandler.displayError(error);
  
  // Or get the structured error
  const handledError = TelegramErrorHandler.handleError(error);
  console.log(handledError);
  
  // Or get formatted string
  console.error(TelegramErrorHandler.formatError(error));
}
*/

export default TelegramErrorHandler;