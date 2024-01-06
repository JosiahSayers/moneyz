import webpush from 'web-push';
import { db } from "~/utils/database.server";

const pushOptions: webpush.RequestOptions = {
  vapidDetails: {
    subject: process.env.VAPID_SUBJECT!,
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
  }
}

export async function sendNotification(userId: number, message: string) {
  try {
    const subscriptions = await db.notificationSubscription.findMany({ where: { userId } });
    for (const subscription of subscriptions) {
      const notificationRecord = await db.notifications.create({
        data: {
          sentToId: subscription.id
        }
      });

      const result = await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dhKey,
            auth: subscription.authKey
          }
        },
        message,
        pushOptions
      );

      await db.notifications.update({
        where: {
          id: notificationRecord.id
        },
        data: {
          responseStatusCode: result.statusCode,
          responseHeaders: JSON.stringify(result.headers),
          responseBody: result.body,
        }
      });
    }
  } catch (e) {
    console.error(`Error sending notification to user ID: ${userId}`, e);
  }
}
