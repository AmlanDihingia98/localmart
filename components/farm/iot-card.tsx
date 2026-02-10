import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, Thermometer, Wind } from "lucide-react"

interface IoTCardProps {
    type: 'soil_moisture' | 'ph' | 'temperature' | 'humidity'
    value: number
    unit: string
    status: 'good' | 'warning' | 'critical'
}

export function IoTCard({ type, value, unit, status }: IoTCardProps) {
    const getIcon = () => {
        switch (type) {
            case 'soil_moisture': return <Droplets className="h-4 w-4" />
            case 'ph': return <Activity className="h-4 w-4" />
            case 'temperature': return <Thermometer className="h-4 w-4" />
            case 'humidity': return <Wind className="h-4 w-4" />
        }
    }

    const getTitle = () => {
        switch (type) {
            case 'soil_moisture': return "Soil Moisture"
            case 'ph': return "pH Level"
            case 'temperature': return "Temperature"
            case 'humidity': return "Humidity"
        }
    }

    const getColor = () => {
        switch (status) {
            case 'good': return "text-green-500"
            case 'warning': return "text-yellow-500"
            case 'critical': return "text-red-500"
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
                <div className={`h-4 w-4 ${getColor()}`}>
                    {getIcon()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value}{unit}
                </div>
                <p className={`text-xs ${getColor()} font-medium capitalize`}>
                    {status} Status
                </p>
            </CardContent>
        </Card>
    )
}
