import { Autocomplete, Button, Group, NumberInput, Radio, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { useState } from "react";
import { getFormCopy } from "~/components/new/form-copy";
import { requireUser } from "~/utils/auth/guards.server";
import { db } from "~/utils/database.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const names = (await db.benefactor.findMany({
    distinct: ['name'],
    select: {
      name: true
    }
  })).map(benefactor => benefactor.name);

  return json({ names });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  console.log(formData.get('date'));
  return null;
}

export default function New() {
  const { names } = useLoaderData<typeof loader>();
  const [formType, setFormType] = useState<string>('earning');
  const [date, setDate] = useState<Date | null>(new Date());
  const formCopy = getFormCopy(formType);

  return (
    <Form method="post">
      <Stack>
        <Radio.Group
          name="formType"
          label="Type of record"
          mb="md"
          value={formType}
          onChange={setFormType}
        >
          <Group mt="xs">
            <Radio value="earning" label="Earning" />
            <Radio value="payout" label="Payout" />
          </Group>
        </Radio.Group>

        <Autocomplete
          label={formCopy.benefactor.label}
          description={formCopy.benefactor.description}
          data={names}
          defaultValue={names[0]}
          name={formCopy.benefactor.name}
          />

        <NumberInput
          label={formCopy.amount.label}
          description={formCopy.amount.description}
          decimalScale={2}
          min={1}
          defaultValue={1}
          hideControls
          leftSection={<IconCurrencyDollar />}
          name={formCopy.amount.name}
          />

        <TextInput
          label={formCopy.description.label}
          description={formCopy.description.description}
          name={formCopy.description.name}
        />

        <DateInput
          label={formCopy.date.label}
          description={formCopy.date.description}
          name={formCopy.date.name}
          value={date}
          onChange={setDate}
        />

        <Button variant="filled" type="submit">Save</Button>
      </Stack>
    </Form>
  )
}
