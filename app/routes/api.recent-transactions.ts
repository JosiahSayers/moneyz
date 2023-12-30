import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db } from "~/utils/database.server";

const supportedDataTypes = [
  'earnings',
  'payouts'
];

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const dataType = params.get('dataType');
  const take = parseInt(params.get('limit') ?? '5');
  if (!dataType || !supportedDataTypes.includes(dataType)) {
    return json({ transactions: [] });
  }

  let rawData: Array<{
    id: number;
    description: string;
    amountInCents: number;
    createdAt: Date;
    benefactor: {
      id: number;
      name: string;
    }
  }> = [];

  if (dataType === 'earnings') {
    rawData = await db.earning.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take,
      select: {
        id: true,
        description: true,
        amountInCents: true,
        createdAt: true,
        benefactor: {
          select: {
            name: true,
            id: true,
          }
        }
      }
    });
  } else if (dataType === 'payouts') {
    rawData = (await db.payout.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take,
      select: {
        id: true,
        amountInCents: true,
        createdAt: true,
        type: true,
        benefactor: {
          select: {
            name: true,
            id: true,
          }
        }
      }
    })).map(row => ({
      ...row,
      description: row.type,
    }));
  }

  return json({ transactions: rawData });
}
