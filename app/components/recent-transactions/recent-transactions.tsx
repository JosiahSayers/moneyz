import { Accordion } from "@mantine/core";
import { useState } from "react";
import AccordionItem from "~/components/recent-transactions/accordion-item";

export default function RecentTransactions() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div>
      <Accordion multiple value={value} onChange={setValue}>
        <AccordionItem title="Recent Earnings" dataType="earnings" open={value.includes('earnings')} />
        <AccordionItem title="Recent Payouts" dataType="payouts" open={value.includes('payouts')} />
      </Accordion>
    </div>
  );
}
