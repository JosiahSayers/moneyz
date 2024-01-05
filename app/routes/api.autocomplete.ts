import { LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUser } from "~/utils/auth/guards.server";
import { db } from "~/utils/database.server";

const validSearchTypes = [
  'earning',
  'payout'
] as const;
type SearchType = typeof validSearchTypes[number];

function isValidType(type: unknown): type is SearchType {
  return validSearchTypes.includes(type as any);
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get('type');
  const query = searchParams.get('query') ?? '';
  if (!isValidType(type)) {
    return json({ results: [] });
  }

  if (type === 'earning') {
    const results = await db.earning.groupBy({
      by: ['description'],
      where: {
        description: {
          contains: query,
          mode: 'insensitive',
        }
      },
      take: 10,
      _count: {
        description: true
      },
      orderBy: {
        _count: {
          description: 'desc'
        }
      }
    });
    return json({ results: results.map(r => r.description ) });
  } else if (type === 'payout') {
    const results = await db.payout.groupBy({
      by: ['type'],
      where: {
        type: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 10,
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    });
    return json({ results: results.map(p => p.type) });
  }
}
