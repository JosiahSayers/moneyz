import { parseForm } from "@formdata-helper/remix";
import { Alert, Button, Card, Group, Notification, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { requireUser } from "~/utils/auth/guards.server";
import { db } from "~/utils/database.server";
import { usePushPermissionState, useServiceWorkerRegistration } from "~/utils/service-worker";

interface RecordSubscription {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const recentNotifications = await db.notifications.findMany({
    where: {
      sentTo: {
        userId: user.id
      }
    },
    take: 5,
    select: {
      payload: true,
      responseStatusCode: true,
      id: true,
    }
  });

  return json({
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY!,
    recentNotifications,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  try {
    const data = await parseForm<RecordSubscription>(request);
    await db.notificationSubscription.create({
      data: {
        endpoint: data.endpoint,
        p256dhKey: data.p256dhKey,
        authKey: data.authKey,
        userId: user.id,
      }
    });
    return json({ success: true });
  } catch (e) {
    console.error(`Failed to setup push notifications for user ID: ${user.id}`, e);
    return json({ success: false });
  }
}

export default function Notifications() {
  const { vapidPublicKey, recentNotifications } = useLoaderData<typeof loader>();
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
      <Title>Notifications</Title>

      <Stack my="xl">
        {pushPermissionState === 'granted' && (
          <Alert title="You have already enabled push notifications on this device" icon={<IconInfoCircle/>}>
            If something is not working please try using the "Enable Push Notifications" button below to setup notifications again.
          </Alert>
        )}

        <Group>
          <Text>Push Notifications</Text>
          <Button onClick={registerPush}>Enable Push Notifications</Button>
        </Group>

        <Text size="xl" fw="bold" mt="3rem" mb={0} pb={0}>Recent Notifications</Text>
        <Text size="xs">* Green: Delivered Successfully</Text>
        {recentNotifications.map(notification => {
          const payload = JSON.parse(notification.payload);
          return <Notification
            key={notification.id}
            color={notification.responseStatusCode === 201 ? 'green' : 'red'}
            title={payload.title}
            withCloseButton={false}
          >
            {payload.message}
          </Notification>
        })}
      </Stack>
    </>
  )
}
