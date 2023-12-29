import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { db } from '~/utils/database.server';
import { Role } from '@prisma/client';

function params() {
  const clientId = process.env.AUTHELIA_CLIENT_ID;
  const clientSecret = process.env.AUTHELIA_CLIENT_SECRET;
  const baseAuthUrl = process.env.AUTHELIA_BASE_URL;
  const baseAppUrl = process.env.URL_BASE;

  if (!clientId || !clientSecret || !baseAuthUrl || !baseAppUrl) {
    throw new Error('Missing required environment variables');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const callbackUrl = `${baseAppUrl}/oauth2/callback`;

  return { clientId, clientSecret, baseAuthUrl, callbackUrl, basicAuth };
}

export function authRedirectUrl() {
  const { baseAuthUrl, clientId, callbackUrl } = params();
  const url = new URL(`${baseAuthUrl}/api/oidc/authorization`);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', callbackUrl);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid profile email groups');
  url.searchParams.append('state', uuid());
  url.searchParams.append('nonce', uuid());
  return url.toString();
}

export async function processAuthCallback(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  if (!code) {
    throw new Error('Code not present in auth callback');
  }
  const { accessToken, idToken } = await getAccessToken(code);
  const id = jwt.decode(idToken) as jwt.JwtPayload;
  const isAdmin = id.groups.includes('admin');
  const role = isAdmin ? Role.admin : Role.user;
  const user = await db.user.upsert({
    where: {
      username: id.preferred_username,
    },
    create: {
      username: id.preferred_username,
      email: id.email,
      name: id.name,
      role,
    },
    update: {
      name: id.name,
      role,
    }
  });
  return { accessToken, user };
}

async function getAccessToken(authCode: string) {
  const { baseAuthUrl, basicAuth, callbackUrl } = params();
  const body = new URLSearchParams();
  body.append('code', authCode);
  body.append('redirect_uri', callbackUrl);
  body.append('grant_type', 'authorization_code');

  const res = await fetch(`${baseAuthUrl}/api/oidc/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    body,
  });

  if (!res.ok) {
    console.log(res);
    console.log(await res.text());
    throw new Error('Failed to retrieve access token');
  }

  const data = await res.json();
  return { accessToken: data.access_token, idToken: data.id_token };
}

export async function introspectAccessToken(token: string) {
  const { baseAuthUrl, basicAuth } = params();
  const body = new URLSearchParams();
  body.append('token', token);
  body.append('token_type_hint', 'access_token');

  const res = await fetch(`${baseAuthUrl}/api/oidc/introspection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    body,
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data;
}
