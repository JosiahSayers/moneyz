import { Text, Notification } from '@mantine/core';
import { useDebounceCallback } from '@mantine/hooks';
import { useLoaderData } from '@remix-run/react';
import { useRevalidator } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { loader } from '~/routes/notifications';

function getColor(statusCode: number | null) {
  if (!statusCode) {
    return 'yellow';
  } else if (statusCode === 201) {
    return 'green';
  } else {
    return 'red';
  }
}

export default function RecentNotifications() {
  const { recentNotifications } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const revalidate = useDebounceCallback(() => revalidator.revalidate(), 500);

  useEffect(() => {
    if (recentNotifications.some(n => !n.responseStatusCode)) {
      revalidate();
    }
  }, [recentNotifications]);

  return (
    <>
      <Text size="xl" fw="bold" mt="3rem" mb={0} pb={0}>Your Recent Notifications</Text>
      <Text size="xs">
        * <Text component="span" c="green">Green</Text>: Delivered
        , <Text component="span" c="yellow">Yellow</Text>: Pending
        , <Text component="span" c="red">Red</Text>: Failed
      </Text>

      {recentNotifications.map(notification => {
        const payload = JSON.parse(notification.payload);
        return <Notification
          key={notification.id}
          color={getColor(notification.responseStatusCode)}
          title={payload.title}
          withCloseButton={false}
        >
          {payload.message}
        </Notification>
      })}
    </>
  )
}
