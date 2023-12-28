import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth/authelia.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return json({ name: user.name });
}

export default function Dashboard() {
  const user = useLoaderData<typeof loader>();
  return <h1>{user.name}</h1>
}
