"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Activity } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"

import { addSensorReading } from "@/lib/actions"
import { sensorReadingSchema, type SensorReadingFormValues } from "@/lib/schemas"

// ... imports

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AddSensorDialogProps {
    farmId?: string
    farms?: { id: string; name: string }[]
}

export function AddSensorDialog({ farmId, farms }: AddSensorDialogProps) {
    const [open, setOpen] = useState(false)
    const defaultFarmId = farmId || farms?.[0]?.id || ''

    const form = useForm<SensorReadingFormValues>({
        resolver: zodResolver(sensorReadingSchema) as any,
        defaultValues: {
            farm_id: defaultFarmId,
            recorded_at: new Date().toISOString().split('T')[0] + 'T12:00',
            soil_moisture: undefined,
            ph_level: undefined,
            temperature: undefined,
            humidity: undefined,
            npk_nitrogen: undefined,
            npk_phosphorus: undefined,
            npk_potassium: undefined,
            dissolved_oxygen: undefined,
            ammonia: undefined,
            nitrate: undefined,
            salinity: undefined
        },
    })

    async function onSubmit(data: SensorReadingFormValues) {
        const result = await addSensorReading(data)

        if (result.success) {
            setOpen(false)
            form.reset({
                ...data,
                // keep farm_id and date, reset others? or just reset all?
                // Resetting helps avoid double entry
                soil_moisture: undefined,
                ph_level: undefined,
            })
            toast.success("Readings recorded successfully!")
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    const showFarmSelect = !farmId && farms && farms.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Activity className="mr-2 h-4 w-4" /> Add Sensor Readings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manual Sensor Entry</DialogTitle>
                    <DialogDescription>
                        Record environmental metrics.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <ScrollArea className="h-[400px] pr-4">

                            {showFarmSelect && (
                                <FormField
                                    control={form.control}
                                    name="farm_id"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
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
                                name="recorded_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date & Time</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <h3 className="col-span-2 font-semibold text-sm border-b pb-1">Soil / Environment</h3>
                                <FormField
                                    control={form.control}
                                    name="temperature"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Temperature (°C)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="humidity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Humidity (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="soil_moisture"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Soil Moisture (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ph_level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>pH Level</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <h3 className="col-span-3 font-semibold text-sm border-b pb-1">NPK Levels</h3>
                                <FormField
                                    control={form.control}
                                    name="npk_nitrogen"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nitrogen</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="npk_phosphorus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phosphorus</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="npk_potassium"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Potassium</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <h3 className="col-span-2 font-semibold text-sm border-b pb-1">Water Quality (Aqua)</h3>
                                <FormField
                                    control={form.control}
                                    name="dissolved_oxygen"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dissolved Oxygen (mg/L)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ammonia"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ammonia (mg/L)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nitrate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nitrate (mg/L)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="salinity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Salinity (ppt)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </ScrollArea>
                        <Button type="submit" className="w-full">Save Readings</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
