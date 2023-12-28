import { LoaderFunctionArgs, json } from "@remix-run/node";
import { processAuthCallback } from "~/utils/auth/authelia.server";
import { commitSession, getSession } from "~/utils/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { accessToken, user } = await processAuthCallback(request);
  const session = await getSession(request.headers.get('cookie'));
  session.set('accessToken', accessToken);
  session.set('id', user.id.toString());

  return json(user, {
    headers: {
      'Set-Cookie': await commitSession(session),
    }
  });
}
