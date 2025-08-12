import { useEffect } from 'react';
import { Modal, Progress, Typography, Space, Button } from 'antd'; // Using Ant Design for example

const { Text } = Typography;

const CountdownModal = ({ message, countdown, visible, setCountdown, setVisible, socket }) => {



  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, visible]);


  const progressPercent = (countdown / 60) * 100; // Assuming max 60s wait

  return (
    <Modal
      title="Process Paused"
      visible={visible}
      footer={null}
      closable={false}
      centered
      width={400}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text>{message}</Text>

        <Progress
          type="circle"
          percent={progressPercent}
          format={() => `${countdown}s`}
          status="active"
          width={80}
        />

        <Text type="secondary">
          Verification will automatically resume...
        </Text>

        <Button
          type="primary"
          danger
          onClick={() => {
            // Optional: Add manual cancellation logic
            socket.emit('cancel-operation');
            setVisible(false);
          }}
        >
          Cancel Process
        </Button>
      </Space>
    </Modal>
  );
};

export default CountdownModal