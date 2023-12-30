import { Box, Card, CardProps, Group, Stack, Text } from "@mantine/core";
import MoneyBadge from "~/components/money-badge";

interface Props extends CardProps {
  earned: string;
  paid: string;
  awaitingPayout: string;
  name: string;
}

export default function EarningsSummary({ earned, paid, awaitingPayout, name, ...props }: Props) {
  return (
    <Card {...props}>
      <Text size="xl" fw="bold" mb="sm">{name}</Text>
      <Stack>
        <Box w="75%">
          <Group justify="space-between">
            <Text>Earned:</Text>
            <MoneyBadge>{earned}</MoneyBadge>
          </Group>
          <Group justify="space-between">
            <Text>Paid:</Text>
            <MoneyBadge isPayout>{paid}</MoneyBadge>
          </Group>
          <Group justify="space-between" mt="xs">
            <Text>Awaiting Payout:</Text>
            <MoneyBadge color="pink">{awaitingPayout}</MoneyBadge>
          </Group>
        </Box>
      </Stack>
    </Card>
  );
}
