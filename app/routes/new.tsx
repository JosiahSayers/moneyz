import { parseForm } from "@formdata-helper/remix";
import { Autocomplete, Button, Group, NumberInput, Radio, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getFormCopy } from "~/components/new/form-copy";
import { requireUser } from "~/utils/auth/guards.server";
import { db } from "~/utils/database.server";
import type { loader as AutocompleteLoader } from '~/routes/api.autocomplete';
import { useDebounceCallback, useDebouncedState, useDebouncedValue } from "@mantine/hooks";
import AsyncAutocomplete from "~/components/new/async-autocomplete";
import { sendNotification } from "~/utils/notification.server";

interface Form {
  formType: string;
  benefactor: string;
  amount: string;
  description: string;
  date: string;
}

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
  const form = await parseForm<Form>(request);

  try {
    let benefactor = await db.benefactor.upsert({
      where: {
        name: form.benefactor
      },
      create: {
        name: form.benefactor
      },
      update: {}
    }); 

    if (form.formType === 'earning') {
      await db.earning.create({
        data: {
          benefactorId: benefactor!.id,
          createdAt: new Date(form.date),
          addedById: user.id,
          description: form.description,    
          amountInCents: parseFloat(form.amount) * 100,
        }
      });
      sendNotification(
        user.id,
        `${benefactor.name} earned $${form.amount}`,
        `${user.name} gave ${benefactor.name} $${form.amount} for ${form.description}`
      );
    } else if (form.formType === 'payout') {
      await db.payout.create({
        data: {
          benefactorId: benefactor!.id,
          createdAt: new Date(form.date),
          paidById: user.id,
          type: form.description,
          amountInCents: parseFloat(form.amount) * 100
        }
      });
      sendNotification(
        user.id,
        `${benefactor.name} was paid $${form.amount}`,
        `${user.name} paid ${benefactor.name} $${form.amount} with ${form.description}`
      );
    }
  } catch (e) {
    console.error(e);
    return json({ success: false });
  }

  return redirect('/');
}

export default function New() {
  const { names } = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const [formType, setFormType] = useState<string>('earning');
  const [date, setDate] = useState<Date | null>(new Date());
  const formCopy = getFormCopy(formType);
  const submitting = state === 'submitting';

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

        <AsyncAutocomplete
          label={formCopy.description.label}
          description={formCopy.description.description}
          name={formCopy.description.name}
          formType={formType}
        />

        <DateInput
          label={formCopy.date.label}
          description={formCopy.date.description}
          name={formCopy.date.name}
          value={date}
          onChange={setDate}
        />

        <Button
          variant="filled"
          type="submit"
          disabled={submitting}
          loading={submitting}
        >
          Save
        </Button>
      </Stack>
    </Form>
  )
}
