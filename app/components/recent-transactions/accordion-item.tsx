import { Accordion, Table } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import RecentTransactionsTable from "~/components/recent-transactions/table";
import { loader } from "~/routes/api.recent-transactions";

interface Props {
  dataType: string;
  title: string;
}

export default function AccordionItem({ dataType, title }: Props) {
  const fetcher = useFetcher<typeof loader>();
  
  const getData = () => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/recent-transactions?dataType=${dataType}`);
    }
  };

  return (
    <Accordion.Item value={dataType} onMouseOver={getData}>
      <Accordion.Control>{title}</Accordion.Control>
      <Accordion.Panel>
        {fetcher.data?.transactions ?
        (
          <RecentTransactionsTable data={fetcher.data.transactions} subject="Benefactor"  />
        ) : (
          "Loading..."
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
