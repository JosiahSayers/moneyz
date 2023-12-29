import { Accordion } from "@mantine/core";
import AccordionItem from "~/components/recent-transactions/accordion-item";

export default function RecentTransactions() {
  return (
    <div>
      <Accordion multiple>
        <AccordionItem title="Recent Earnings" dataType="earnings" />
        <AccordionItem title="Recent Payouts" dataType="payouts" />
      </Accordion>
    </div>
  );
}
