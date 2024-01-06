import { parseForm } from "@formdata-helper/remix";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { requireUser } from "~/utils/auth/guards.server";
import { sendNotification, sendNotificationToUser } from "~/utils/notification.server";

export type NotificationTestType = 'myself' | 'all-other-users';

interface Form {
  notificationType: NotificationTestType;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const form = await parseForm<Form>(request);

  try {
    if (form.notificationType === 'myself') {
      sendNotificationToUser(user.id, 'Test Notification', `This is a test notification sent by ${user.name}`);
    } else if (form.notificationType === 'all-other-users') {
      sendNotification(user.id, 'Test Notification', `This is a test notification send by ${user.name}`);
    }

    return json({ success: true });
  } catch (e) {
    console.error('Failed to send test notification', e, { userId: user.id, notificationType: form.notificationType });
    return json({ success: false });
  }
}
