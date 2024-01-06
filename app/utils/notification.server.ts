import webpush from 'web-push';
import { db } from "~/utils/database.server";

const pushOptions: webpush.RequestOptions = {
  vapidDetails: {
    subject: process.env.VAPID_SUBJECT!,
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
  }
}

export async function sendNotification(userId: number, title: string, message: string) {
  try {
    const usersToSendTo = await db.user.findMany({
      where: {
        id: {
          not: userId,
        }
      }
    });

    for (const user of usersToSendTo) {
      await sendNotificationToUser(user.id, title, message);
    }
  } catch (e) {
    console.error('Failed to send notification', e, { userId, title, message });
  }
}

export async function sendNotificationToUser(userId: number, title: string, message: string) {
  try {
    const subscriptions = await db.notificationSubscription.findMany({ where: { userId } });
    const payload = JSON.stringify({ title, message });

    for (const subscription of subscriptions) {
      const notificationRecord = await db.notifications.create({
        data: {
          sentToId: subscription.id,
          payload
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
        payload,
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
