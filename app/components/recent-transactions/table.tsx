import { Table } from "@mantine/core";
import { usDollar } from "~/utils/formatters";

interface Props {
  data: Array<{
    id: number;
    benefactor: {
      name: string;
      id: number;
    };
    description: string;
    amountInCents: number;
    createdAt: string;
  }>
  subject: string;
}

export default function RecentTransactionsTable({ data, subject }: Props) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{subject}</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Date</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map(row => (
          <Table.Tr key={row.id}>
            <Table.Td>{row.benefactor.name}</Table.Td>
            <Table.Td>{row.description}</Table.Td>
            <Table.Td>{usDollar(row.amountInCents / 100)}</Table.Td>
            <Table.Td>{new Date(row.createdAt).toLocaleDateString()}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
