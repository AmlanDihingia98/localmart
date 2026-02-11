import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IoTCard } from "@/components/farm/iot-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertTriangle, CheckCircle } from "lucide-react"

export default async function MonitoringPage() {
    const supabase = await createClient()

    // 1. Fetch all farms for the user
    const { data: farms } = await supabase.from('farms').select('id, name').order('name')

    // 2. Fetch all devices
    const { data: devices } = await supabase
        .from('iot_devices')
        .select('*, farms!inner(owner_id)')

    // 3. Fetch latest readings (this is a bit heavy, in real app we'd use a view or specific query)
    // For now, let's fetch last 100 readings globally and match them in JS
    const { data: readings } = await supabase
        .from('iot_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(500)

    const farmsWithData = (farms as any[])?.map(farm => {
        const farmDevices = (devices as any[])?.filter(d => d.farm_id === farm.id) || []

        // Flatten all metrics from all devices into a single list of cards to render
        // Use a Map to deduplicate metrics by type (e.g., 'temperature', 'humidity')
        // Key: metric type, Value: metric object with timestamp for comparison
        const metricsMap = new Map<string, any>()

        const updateMetric = (key: string, newMetric: any, timestamp: string) => {
            const existing = metricsMap.get(key)
            if (!existing || new Date(timestamp) > new Date(existing._timestamp)) {
                metricsMap.set(key, { ...newMetric, _timestamp: timestamp })
            }
        }

        farmDevices.forEach(device => {
            const latestReading = (readings as any[])?.find(r => r.device_id === device.id)
            if (!latestReading) return

            const timestamp = latestReading.recorded_at

            // 1. Soil Moisture Device -> Soil Moisture & Soil pH
            if (device.device_type === 'soil_moisture') {
                updateMetric('soil_moisture', {
                    id: `${device.id}-soil`,
                    type: 'soil_moisture',
                    value: latestReading.soil_moisture ?? '--',
                    unit: '%',
                    status: latestReading.soil_moisture == null ? 'warning' : (latestReading.soil_moisture < 30 ? 'warning' : 'good')
                }, timestamp)

                updateMetric('soil_ph', {
                    id: `${device.id}-ph`,
                    type: 'ph',
                    title: 'Soil pH Level',
                    value: latestReading.ph_level ?? '--',
                    unit: ' pH',
                    status: latestReading.ph_level == null ? 'warning' : ((latestReading.ph_level < 6 || latestReading.ph_level > 8) ? 'warning' : 'good')
                }, timestamp)
            }

            // 2. Water Quality Device -> Water pH, DO, etc.
            else if (device.device_type === 'water_quality') {
                updateMetric('water_ph', {
                    id: `${device.id}-wph`,
                    type: 'ph',
                    title: 'Water pH Level',
                    value: latestReading.ph_level ?? '--',
                    unit: ' pH',
                    status: 'good'
                }, timestamp)

                updateMetric('dissolved_oxygen', {
                    id: `${device.id}-do`,
                    type: 'dissolved_oxygen',
                    value: latestReading.dissolved_oxygen ?? '--',
                    unit: ' mg/L',
                    status: latestReading.dissolved_oxygen == null ? 'warning' : (latestReading.dissolved_oxygen < 4 ? 'critical' : 'good')
                }, timestamp)
            }

            // 3. Climate Station -> Temp, Humidity
            else if (device.device_type === 'climate_station') {
                updateMetric('temperature', {
                    id: `${device.id}-temp`,
                    type: 'temperature',
                    value: latestReading.temperature ?? '--',
                    unit: '°C',
                    status: 'good'
                }, timestamp)

                updateMetric('humidity', {
                    id: `${device.id}-hum`,
                    type: 'humidity',
                    value: latestReading.humidity ?? '--',
                    unit: '%',
                    status: 'good'
                }, timestamp)
            }
        })

        // Convert Map values to array, removing internal _timestamp
        const allMetrics = Array.from(metricsMap.values()).map(({ _timestamp, ...rest }) => rest)

        return {
            ...farm,
            metrics: allMetrics
        }
    }) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Live Monitoring</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Online</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No critical issues</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Devices Online</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{devices?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Sensors reporting data</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {farmsWithData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No farms configured for monitoring.</div>
                ) : (
                    farmsWithData.map(farm => (
                        <div key={farm.id} className="space-y-3">
                            <h3 className="text-xl font-semibold px-1">{farm.name}</h3>
                            {farm.metrics.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                                    No sensor data available for this farm yet.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {farm.metrics.map((metric: any) => (
                                        <IoTCard
                                            key={metric.id}
                                            title={metric.title}
                                            type={metric.type}
                                            value={metric.value}
                                            unit={metric.unit}
                                            status={metric.status}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
