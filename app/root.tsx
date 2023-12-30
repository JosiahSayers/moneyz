import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { NavigationProgress, nprogress } from '@mantine/nprogress';
import { useEffect } from "react";
import Shell from '~/components/app-shell';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'idle') {
      nprogress.complete();
      nprogress.reset();
    } else {
      nprogress.start();
    }
  }, [navigation.state]);
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Shell>
          <NavigationProgress />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          </Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
