import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { requireUser } from "~/utils/auth/authelia.server";
import { json, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Money Pleeeeeease" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return json({ name: user.name });
}

export default function Index() {
  const user = useLoaderData<typeof loader>();
  return <h1>{user.name}</h1>
}
