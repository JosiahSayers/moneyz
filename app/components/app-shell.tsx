import { AppShell, Burger, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@remix-run/react';
import { PropsWithChildren } from 'react';

export default function Shell({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        
        <Anchor component={Link} to="/logout">Logout</Anchor>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
