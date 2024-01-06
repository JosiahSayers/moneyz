import { Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { NotificationTestType, action } from "~/routes/api.test-notifications";

export default function TestNotifications() {
  const fetcher = useFetcher<typeof action>();

  const sendTest = (type: NotificationTestType) => {
    fetcher.submit({
      notificationType: type
    }, {
      method: 'POST',
      action: '/api/test-notifications'
    });
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) {
      return;
    }

    if (fetcher.data.success) {
      notifications.show({
        title: 'Notification Sent',
        message: 'Test notification will be delivered shortly',
        color: 'green',
        autoClose: 15000
      });
    } else {
      notifications.show({
        title: 'Something went wrong',
        message: 'Try again or check with the site admin for details.',
        color: 'red',
        autoClose: 15000
      });
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <Group mt="lg">
      <Text>Test Notifications</Text>
      <Button onClick={() => sendTest('myself')}>Send Notification To Myself</Button>
      <Button onClick={() => sendTest('all-other-users')}>Send Notification To Others</Button>
    </Group>
    
  )
}
