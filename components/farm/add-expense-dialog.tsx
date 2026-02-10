"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, DollarSign } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { addExpense } from "@/lib/actions"
import { expenseSchema, type ExpenseFormValues } from "@/lib/schemas"

// ...imports

interface AddExpenseDialogProps {
    farmId?: string
    farms?: { id: string; name: string }[]
}

export function AddExpenseDialog({ farmId, farms }: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const defaultFarmId = farmId || farms?.[0]?.id || ''

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            farm_id: defaultFarmId,
            category: "maintenance",
            amount: 0,
            description: "",
            expense_date: new Date().toISOString().split('T')[0],
        },
    })

    async function onSubmit(data: ExpenseFormValues) {
        const result = await addExpense(data)

        if (result.success) {
            setOpen(false)
            form.reset({
                ...data,
                amount: 0,
                description: "",
            })
            toast.success("Expense added successfully!")
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    const showFarmSelect = !farmId && farms && farms.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Expense</DialogTitle>
                    <DialogDescription>
                        Log a new expense for this farm.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {showFarmSelect && (
                            <FormField
                                control={form.control}
                                name="farm_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Farm</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select farm" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {farms?.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="expense_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="seeds">Seeds</SelectItem>
                                            <SelectItem value="feed">Feed</SelectItem>
                                            <SelectItem value="labor">Labor</SelectItem>
                                            <SelectItem value="transport">Transport</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="irrigation">Irrigation</SelectItem>
                                            <SelectItem value="pest_control">Pest Control</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Details about the expense..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">Save Expense</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
