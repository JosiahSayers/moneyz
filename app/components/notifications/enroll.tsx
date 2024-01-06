import { Alert, Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFetcher } from "@remix-run/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { action } from "~/routes/notifications";
import { usePushPermissionState, useServiceWorkerRegistration } from "~/utils/service-worker";

interface Props {
  vapidPublicKey: string;
}

export default function NotificationEnroll({ vapidPublicKey }: Props) {
  const sw = useServiceWorkerRegistration();
  const pushPermissionState = usePushPermissionState();
  const fetcher = useFetcher<typeof action>();

  const registerPush = () => {
    sw?.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    }).then(subscription => {
      const subJson = subscription.toJSON();
      fetcher.submit(
        {
          endpoint: subscription.endpoint,
          p256dhKey: subJson.keys?.p256dh ?? '',
          authKey: subJson.keys?.auth ?? ''
        },
        { method: 'POST' }
      );
    });
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success) {
        notifications.show({
          title: 'Notifications Enabled',
          message: 'You will now receive notifications on this device.',
          color: 'green',
          autoClose: 15000
        });
      } else {
        notifications.show({
          title: 'Something went wrong',
          message: 'We were not able to setup notifications at this time. Try again later.',
          color: 'red',
          autoClose: 15000
        });
      }
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <>
      {pushPermissionState === 'granted' && (
        <Alert title="You have already enabled push notifications on this device" icon={<IconInfoCircle />}>
          If something is not working please try using the "Enable Push Notifications" button below to setup notifications again.
        </Alert>
      )}

      <Group>
        <Text>Push Notifications</Text>
        <Button onClick={registerPush}>Enable Push Notifications</Button>
      </Group>
    </>
  )
}
