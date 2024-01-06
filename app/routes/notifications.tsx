import { parseForm } from "@formdata-helper/remix";
import { Stack, Title } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import NotificationEnroll from "~/components/notifications/enroll";
import RecentNotifications from "~/components/notifications/recent-notifications";
import TestNotifications from "~/components/notifications/test-notifications";
import { requireUser } from "~/utils/auth/guards.server";
import { db } from "~/utils/database.server";

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
  const { vapidPublicKey } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Notification Settings</Title>

      <Stack my="xl">
        <NotificationEnroll vapidPublicKey={vapidPublicKey} />

        <TestNotifications />

        <RecentNotifications />
      </Stack>
    </>
  )
}
