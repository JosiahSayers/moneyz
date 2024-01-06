import { AppShell, Burger, Anchor, Text, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@remix-run/react';
import { PropsWithChildren } from 'react';

export default function Shell({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            px={0}
          />
          <Text fw="bold">Money Pleeeeeease</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Anchor component={Link} to="/" onClick={toggle}>Home</Anchor>
        <Anchor component={Link} to="/new" onClick={toggle}>Record Transaction</Anchor>
        <Anchor component={Link} to="/notifications" onClick={toggle}>Notifications</Anchor>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
