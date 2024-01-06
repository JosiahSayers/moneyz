import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth/guards.server";
import { sendNotification } from "~/utils/notification.server";
import { usePushPermissionState, useServiceWorkerRegistration } from "~/utils/service-worker";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return json({
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY!
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  await sendNotification(user.id, 'Josiah added $1 to Joy\'s account for Daily Checklist');
  return null;
}

export default function Notifications() {
  const { vapidPublicKey } = useLoaderData<typeof loader>();
  const sw = useServiceWorkerRegistration();
  const pushPermissionState = usePushPermissionState();

  const registerPush = () => {
    sw?.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    }).then(subscription => {
      console.log(subscription);
      console.log(JSON.stringify(subscription));
    });
  }

  return (
    <>
      <Title>Notifications</Title>

      <Stack my="xl">
        <Group>
          <Text>Push Notifications</Text>
          <Button onClick={registerPush}>{pushPermissionState === 'granted' ? 'Disable' : 'Enable'} Push Notifications</Button>
        </Group>

        <Form method="post">
          <Button type="submit">Send Test Notification</Button>
        </Form>
      </Stack>
    </>
  )
}
