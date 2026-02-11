import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IoTCard } from "@/components/farm/iot-card"
import { OperationsTable } from "@/components/farm/operations-table"
import { AddLogDialog } from "@/components/farm/add-log-dialog"
import { AddExpenseDialog } from "@/components/farm/add-expense-dialog"
import { AddHarvestDialog } from "@/components/farm/add-harvest-dialog"
import { createClient } from "@/lib/supabase/server"
import { Sprout, TrendingUp, AlertOctagon } from "lucide-react"

export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 0. Fetch Farm Details
    const { data: farm } = await supabase.from('farms').select('name').eq('id', id).single() as any

    // 1. Fetch Logs
    const { data: logs, error: logsError } = await supabase
        .from('operational_logs')
        .select('*')
        .eq('farm_id', id)
        .order('log_date', { ascending: false })

    if (logsError) console.error("Error fetching logs:", logsError)
    console.log("Farm Logs:", logs?.length)

    // 2. Fetch Latest IoT Readings
    const { data: readings, error: readingsError } = await supabase
        .from('iot_readings')
        .select('*, iot_devices!inner(device_type, farm_id)')
        .eq('iot_devices.farm_id', id)
        .order('recorded_at', { ascending: false })
        .limit(200)

    if (readingsError) console.error("Error fetching readings:", readingsError)
    console.log("Farm Readings:", readings?.length, readings?.[0])

    // 3. Fetch Harvests (via crop_cycles)
    const { data: harvests } = await supabase
        .from('harvests')
        .select('*, crop_cycles!inner(farm_id)')
        .eq('crop_cycles.farm_id', id)
        .order('harvest_date', { ascending: false })

    // Helper to find latest non-null reading value for a specific type and field
    const getLatestMetric = (type: string, field: string) => {
        // @ts-ignore
        const reading = (readings as any[])?.find(r => r.iot_devices?.device_type === type && r[field] != null)
        return reading ? reading[field] : null
    }

    const latestSoilMoisture = getLatestMetric('soil_moisture', 'soil_moisture')
    const latestSoilPH = getLatestMetric('soil_moisture', 'ph_level')

    const latestWaterPH = getLatestMetric('water_quality', 'ph_level')
    const latestDO = getLatestMetric('water_quality', 'dissolved_oxygen')

    const latestTemp = getLatestMetric('climate_station', 'temperature')
    const latestHum = getLatestMetric('climate_station', 'humidity')


    // Formatting logic for Logs
    const formattedLogs = (logs || [])?.map((log: any) => ({
        id: log.id,
        date: log.log_date,
        type: log.log_type,
        quantity: log.quantity || 0,
        unit: log.unit || '',
        notes: log.notes || ''
    })) || []

    // Biomass & Growth Calculation
    const biomassLogs = (logs as any[])?.filter(l => l.log_type === 'biomass_check' || l.log_type === 'growth_check').sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()) || []

    const latestBiomassLog = biomassLogs[biomassLogs.length - 1]
    const currentBiomass = latestBiomassLog?.quantity || 0

    let growthVelocity = "0.00"
    if (biomassLogs.length >= 2) {
        const first = biomassLogs[0]
        const last = biomassLogs[biomassLogs.length - 1]
        const days = (new Date(last.log_date).getTime() - new Date(first.log_date).getTime()) / (1000 * 3600 * 24)
        if (days > 0) growthVelocity = (((last.quantity || 0) - (first.quantity || 0)) / days).toFixed(2)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{farm?.name || 'Farm Details'}</h2>
                <div className="flex gap-2">
                    <AddExpenseDialog farmId={id} />
                    <AddLogDialog farmId={id} />
                    <AddHarvestDialog farmId={id} />
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
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
                                <Sprout className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {((harvests as any[])?.reduce((acc, h) => acc + (h.quantity_kg || 0), 0) || 0).toFixed(1)} kg
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
                                    ₹{((harvests as any[])?.reduce((acc, h) => acc + (h.revenue_realized || 0), 0) || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">Active Cycle</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Current Biomass</CardTitle>
                                <Sprout className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {currentBiomass} kg
                                </div>
                                <p className="text-xs text-muted-foreground">Standing Stock</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Growth Velocity</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {growthVelocity} <span className="text-sm font-normal">kg/day</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Avg Daily Gain</p>
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
                <TabsContent value="agronomy" className="space-y-6">
                    {/* Soil Sensors Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Soil Sensors</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <IoTCard type="soil_moisture" value={latestSoilMoisture ?? 0} unit="%" status="good" />
                            <IoTCard type="ph" title="Soil pH Level" value={latestSoilPH ?? 0} unit=" pH" status="good" />
                            <IoTCard type="temperature" value={latestTemp ?? 0} unit="°C" status="good" />
                            <IoTCard type="humidity" value={latestHum ?? 0} unit="%" status="warning" />
                        </div>
                    </div>

                    {/* Water Sensors Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Water Sensors</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <IoTCard type="ph" title="Water pH Level" value={latestWaterPH ?? 0} unit=" pH" status="good" />
                            <IoTCard type="dissolved_oxygen" value={latestDO ?? 0} unit="mg/L" status="good" />
                        </div>
                    </div>

                    {/* Operational Inputs */}
                    <div className="grid gap-4 md:grid-cols-2 mt-6">
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

