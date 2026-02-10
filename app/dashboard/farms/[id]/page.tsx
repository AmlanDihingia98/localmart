import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IoTCard } from "@/components/farm/iot-card"
import { OperationsTable } from "@/components/farm/operations-table"
import { AddLogDialog } from "@/components/farm/add-log-dialog"
import { AddExpenseDialog } from "@/components/farm/add-expense-dialog"
import { AddHarvestDialog } from "@/components/farm/add-harvest-dialog"
import { createClient } from "@/lib/supabase/server"
import { Sprout, TrendingUp, AlertOctagon } from "lucide-react"

export default async function FarmDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch Logs
    const { data: logs } = await supabase
        .from('operational_logs')
        .select('*')
        .eq('farm_id', params.id)
        .order('log_date', { ascending: false })

    // 2. Fetch Latest IoT Readings
    const { data: readings } = await supabase
        .from('iot_readings')
        .select('*, iot_devices(device_type)')
        .order('recorded_at', { ascending: false })
        .limit(50)

    // 3. Fetch Harvests (via crop_cycles)
    const { data: harvests } = await supabase
        .from('harvests')
        .select('*, crop_cycles!inner(farm_id)')
        .eq('crop_cycles.farm_id', params.id)
        .order('harvest_date', { ascending: false })

    // Helper to find latest reading value
    const getLatestReading = (type: string) => {
        // @ts-ignore
        const reading = (readings as any[])?.find(r => r.iot_devices?.device_type === type)
        return reading ? Number(reading.soil_moisture || reading.ph_level || reading.temperature || reading.humidity) : 0
    }

    // Formatting logic for Logs
    const formattedLogs = (logs || [])?.map((log: any) => ({
        id: log.id,
        date: log.log_date,
        type: log.log_type,
        quantity: log.quantity || 0,
        unit: log.unit || '',
        notes: log.notes || ''
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Farm Details</h2>
                <div className="flex gap-2">
                    <AddExpenseDialog farmId={params.id} />
                    <AddLogDialog farmId={params.id} />
                    <AddHarvestDialog farmId={params.id} />
                </div>
            </div>

            <Tabs defaultValue="production" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="production">Production & Growth</TabsTrigger>
                    <TabsTrigger value="agronomy">Agronomy (Environment)</TabsTrigger>
                    <TabsTrigger value="logs">Logs & Operations</TabsTrigger>
                </TabsList>

                {/* PRODUCTION TAB */}
                <TabsContent value="production" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
                                <Sprout className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(harvests as any[])?.reduce((acc, h) => acc + (h.quantity_kg || 0), 0).toFixed(1)} kg
                                </div>
                                <p className="text-xs text-muted-foreground">Recorded Harvests</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ₹{(harvests as any[])?.reduce((acc, h) => acc + (h.revenue_realized || 0), 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">Active Cycle</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Mortality Events</CardTitle>
                                <AlertOctagon className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {logs?.filter((l: any) => l.log_type === 'mortality').length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Incidents Recorded</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Harvests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {harvests && harvests.length > 0 ? (
                                <div className="space-y-4">
                                    {harvests.map((h: any) => (
                                        <div key={h.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium">{new Date(h.harvest_date).toLocaleDateString()}</p>
                                                <p className="text-sm text-muted-foreground">{h.quality_grade ? `Grade ${h.quality_grade}` : 'No Grade'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{h.quantity_kg} kg</p>
                                                <p className="text-sm text-green-600">+₹{h.revenue_realized}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No harvests recorded yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AGRONOMY TAB */}
                <TabsContent value="agronomy" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <IoTCard type="soil_moisture" value={getLatestReading('soil_moisture')} unit="%" status="good" />
                        <IoTCard type="ph" value={getLatestReading('water_quality')} unit="pH" status="good" />
                        <IoTCard type="temperature" value={getLatestReading('climate_station')} unit="°C" status="good" />
                        <IoTCard type="humidity" value={45} unit="%" status="warning" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Feed Consumption</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {logs?.filter((l: any) => l.log_type === 'feed_input').reduce((acc: number, l: any) => acc + (l.quantity || 0), 0)} kg
                                </div>
                                <p className="text-xs text-muted-foreground">Total Feed Input</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Water Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {logs?.filter((l: any) => l.log_type === 'water_usage').reduce((acc: number, l: any) => acc + (l.quantity || 0), 0)} L
                                </div>
                                <p className="text-xs text-muted-foreground">Total Water Input</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* LOGS TAB */}
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operations Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {formattedLogs.length > 0 ? (
                                <OperationsTable logs={formattedLogs} />
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">No logs found. Add one!</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

