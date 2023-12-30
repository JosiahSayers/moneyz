import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { requireUser } from "~/utils/auth/guards.server";
import { json, useLoaderData } from "@remix-run/react";
import { Box, Title } from "@mantine/core";
import { db } from "~/utils/database.server";
import { centToDollar } from "~/utils/formatters";
import RecentTransactions from "~/components/recent-transactions/recent-transactions";
import EarningsSummary from "~/components/earnings-summary/earnings-summary";

export const meta: MetaFunction = () => {
  return [
    { title: "Money Pleeeeeease" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
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
      earned: centToDollar(earned),
      paid: centToDollar(paid),
      awaitingPayout: centToDollar(earned - paid),
      name: benefactor.name,
      id: benefactor.id
    }
  });
  return json({ benefactorTotals });
}

export default function Index() {
  const { benefactorTotals } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Earnings Summary</Title>
      <Box my="xl">
        {benefactorTotals.map(bf => (
          <EarningsSummary
            key={bf.id}
            earned={bf.earned}
            paid={bf.paid}
            awaitingPayout={bf.awaitingPayout}
            name={bf.name}
          />
        ))}
      </Box>

      <RecentTransactions />
    </>
  )
}
