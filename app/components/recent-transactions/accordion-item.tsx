import { Accordion, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import MoneyBadge from "~/components/money-badge";
import { loader } from "~/routes/api.recent-transactions";
import { centToDollar } from "~/utils/formatters";

interface Props {
  dataType: string;
  title: string;
  open: boolean;
}

export default function AccordionItem({ dataType, title, open }: Props) {
  const fetcher = useFetcher<typeof loader>();

  const getData = () => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/recent-transactions?dataType=${dataType}`);
    }
  };

  useEffect(() => {
    if (!open) {
      fetcher.data = undefined;
    } else {
      getData();
    }
  }, [open])

  return (
    <Accordion.Item value={dataType} onMouseOver={getData}>
      <Accordion.Control>{title}</Accordion.Control>
      <Accordion.Panel>
        {fetcher.data?.transactions ?
        (
          <Stack>
            {fetcher.data.transactions.map(transaction => (
              <Card key={transaction.id}>
                <Group justify="space-between">
                  <Text fw={500}>{transaction.benefactor.name}</Text>
                  <MoneyBadge isPayout={dataType === 'payouts'}>{centToDollar(transaction.amountInCents)}</MoneyBadge>
                </Group>
                <Text size="xs" mb="md">Added by {transaction.user.name} on {new Date(transaction.createdAt).toLocaleDateString()}</Text>

                <Text size="sm" c="dimmed">
                  {transaction.description}
                </Text>
              </Card>
            ))}
          </Stack>
        ) : (
          "Loading..."
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
