import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { requireUser } from "~/utils/auth/guards.server";
import { json, useLoaderData } from "@remix-run/react";
import { Accordion, Box, Card, Text, Title } from "@mantine/core";
import { db } from "~/utils/database.server";
import { usDollar } from "~/utils/formatters";
import RecentTransactions from "~/components/recent-transactions/recent-transactions";

export const meta: MetaFunction = () => {
  return [
    { title: "Money Pleeeeeease" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const earningsByBenefactor = await db.earning.groupBy({
    by: 'benefactorId',
    _sum: {
      amountInCents: true,
    },
  });
  const payoutsByBenefactor = await db.payout.groupBy({
    by: 'benefactorId',
    _sum: {
      amountInCents: true,
    }
  });
  const benefactors = await db.benefactor.findMany({
    select: {
      name: true,
      id: true,
    },
    where: {
      id: {
        in: [
          ...earningsByBenefactor.map(earning => earning.benefactorId),
          ...payoutsByBenefactor.map(payout => payout.benefactorId)
        ]
      }
    }
  });
  const benefactorTotals = benefactors.map(benefactor => {
    const earnings = earningsByBenefactor.find(earning => earning.benefactorId === benefactor.id);
    const payouts = payoutsByBenefactor.find(payout => payout.benefactorId === benefactor.id);
    const earned = earnings?._sum.amountInCents ?? 0;
    const paid = payouts?._sum.amountInCents ?? 0;
    return {
      earned: usDollar(earned / 100),
      paid: usDollar(paid / 100),
      awaitingPayout: usDollar((earned - paid) / 100),
      name: benefactor.name,
      id: benefactor.id
    }
  });
  return json({ name: user.name, benefactorTotals });
}

export default function Index() {
  const { name, benefactorTotals } = useLoaderData<typeof loader>();
  return (
    <>
      <Title mb="xl">Earnings Summary</Title>
      <Box mb="xl">
        {benefactorTotals.map(bf => (
          <Card key={bf.id}>
            <Text size="lg" fw="bold" mb="sm">{bf.name}</Text>
            <Text>Earned: {bf.earned}</Text>
            <Text>Paid: {bf.paid}</Text>
            <Text mt="xs">Awaiting Payout: {bf.awaitingPayout}</Text>
          </Card>
        ))}
      </Box>

      <RecentTransactions />
    </>
  )
}
