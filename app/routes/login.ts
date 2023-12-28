import { redirectDocument } from "@remix-run/node";
import { authRedirectUrl } from "~/utils/auth/authelia.server";

export async function loader() {
  const redirectUrl = authRedirectUrl();
  return redirectDocument(redirectUrl);
}
