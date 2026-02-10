"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
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

import { createFarm } from "@/lib/actions"
import { farmSchema, type FarmFormValues } from "@/lib/schemas"

export function AddFarmDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm<FarmFormValues>({
        resolver: zodResolver(farmSchema) as any,
        defaultValues: {
            name: "",
            location: "",
            total_area: 0,
        },
    })

    async function onSubmit(data: FarmFormValues) {
        const result = await createFarm(data)

        if (result.success) {
            setOpen(false)
            form.reset()
            toast.success("Farm created successfully!")
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Farm
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Farm</DialogTitle>
                    <DialogDescription>
                        Enter details about your new farm plot.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Farm Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Green Valley Plot 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Sector 4, North District" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="total_area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Area (Bighas)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Create Farm</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
