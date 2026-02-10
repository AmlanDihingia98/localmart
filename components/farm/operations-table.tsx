import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface OperationLog {
    id: string
    date: string
    type: string
    quantity: number
    unit: string
    notes: string
}

interface OperationsTableProps {
    logs: OperationLog[]
}

export function OperationsTable({ logs }: OperationsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Log Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>{log.date}</TableCell>
                        <TableCell className="font-medium capitalize">{log.type.replace('_', ' ')}</TableCell>
                        <TableCell>{log.quantity} {log.unit}</TableCell>
                        <TableCell>{log.notes}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
