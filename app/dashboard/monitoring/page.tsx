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
        .limit(200)

    const farmsWithData = (farms as any[])?.map(farm => {
        const farmDevices = (devices as any[])?.filter(d => d.farm_id === farm.id) || []
        const deviceReadings = farmDevices.map(device => {
            const latestReading = (readings as any[])?.find(r => r.device_id === device.id)
            let value = 0
            if (latestReading) {
                // Map the correct column based on device type
                if (device.device_type === 'soil_moisture') value = Number(latestReading.soil_moisture)
                else if (device.device_type === 'water_quality') value = Number(latestReading.ph_level) // Assuming pH for now
                else if (device.device_type === 'climate_station') value = Number(latestReading.temperature)
                else if (device.device_type === 'ph') value = Number(latestReading.ph_level)
                else if (device.device_type === 'temperature') value = Number(latestReading.temperature)
                else if (device.device_type === 'humidity') value = Number(latestReading.humidity)
            }

            // Determine status mock logic
            let status: 'good' | 'warning' | 'critical' = 'good'
            if (value === 0) status = 'warning'

            return {
                ...device,
                currentValue: value,
                status,
                lastUpdate: latestReading?.recorded_at
            }
        })
        return {
            ...farm,
            devices: deviceReadings
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
                            {(farm.devices as any[]).length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                                    No IoT devices connected to this farm.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {(farm.devices as any[]).map(device => (
                                        <IoTCard
                                            key={device.id}
                                            type={device.device_type as any} // Cast safely knowing schema
                                            value={device.currentValue}
                                            unit={device.device_type === 'temperature' ? '°C' : device.device_type === 'humidity' || device.device_type === 'soil_moisture' ? '%' : 'pH'}
                                            status={device.status}
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
