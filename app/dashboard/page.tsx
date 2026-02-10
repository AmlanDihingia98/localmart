import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Sprout, Droplets, Scale, AlertTriangle, TrendingUp, Users } from "lucide-react"
import { GrowthChart } from "@/components/dashboard/growth-chart"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AddSensorDialog } from "@/components/farm/add-sensor-dialog"
import { AddExpenseDialog } from "@/components/farm/add-expense-dialog"
import { AddLogDialog } from "@/components/farm/add-log-dialog"
import { AddHarvestDialog } from "@/components/farm/add-harvest-dialog"

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Data
    const { data: farms } = await supabase.from('farms').select('*')
    const { data: logs } = await supabase.from('operational_logs').select('*').order('log_date', { ascending: false })
    const { data: readings } = await supabase.from('iot_readings').select('*').order('recorded_at', { ascending: false }).limit(1)
    const { data: harvests } = await supabase.from('harvests').select('*')
    const { data: expenses } = await supabase.from('expenses').select('*')

    // 2. Calculate Agronomy Metrics
    const latestReading = (readings as any[])?.[0]
    const waterUsageLogs = (logs as any[])?.filter(l => l.log_type === 'water_usage') || []
    const totalWaterUsage = waterUsageLogs.reduce((acc, l) => acc + (l.quantity || 0), 0)
    const totalHarvestKg = (harvests as any[])?.reduce((acc, h) => acc + (h.quantity_kg || 0), 0) || 0

    // KPI: Water Usage Efficiency (Kg / L) - Avoid division by zero
    const waterEfficiency = totalWaterUsage > 0 ? (totalHarvestKg / totalWaterUsage).toFixed(2) : '0.00'

    // KPI: FCR (Feed Conversion Ratio)
    const feedLogs = (logs as any[])?.filter(l => l.log_type === 'feed_input') || []
    const totalFeed = feedLogs.reduce((acc, l) => acc + (l.quantity || 0), 0)
    // Simplified Biomass Delta: Current Biomass (from latest log) - Initial (assumed 0 for now)
    const latestBiomassLog = (logs as any[])?.find(l => l.log_type === 'biomass_check')
    const currentBiomass = latestBiomassLog?.quantity || 1 // Avoid div by zero
    const fcr = (totalFeed / currentBiomass).toFixed(2)

    // KPI: Disease Risk (Mock logic based on humidity/temp)
    const temp = latestReading?.temperature || 0
    const humidity = latestReading?.humidity || 0
    const diseaseRisk = (temp > 30 && humidity > 80) ? "High" : "Low"

    // 3. Calculate Production Metrics
    const totalMortality = (logs as any[])?.filter(l => l.log_type === 'mortality').reduce((acc, l) => acc + (l.quantity || 0), 0) || 0
    // Mock initial stock for Survival Rate calculation (would need a real 'stocking' log type)
    const initialStock = 1000
    const survivalRate = ((initialStock - totalMortality) / initialStock * 100).toFixed(1)

    // Growth Velocity (Avg Daily Growth)
    // Need at least 2 biomass logs to calculate velocity
    const biomassLogs = (logs as any[])?.filter(l => l.log_type === 'biomass_check').sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()) || []
    let growthVelocity = "0.00"
    if (biomassLogs.length >= 2) {
        const first = biomassLogs[0]
        const last = biomassLogs[biomassLogs.length - 1]
        const days = (new Date(last.log_date).getTime() - new Date(first.log_date).getTime()) / (1000 * 3600 * 24)
        if (days > 0) growthVelocity = (((last.quantity || 0) - (first.quantity || 0)) / days).toFixed(2) // kg/day
    }

    // 4. Calculate Financial Metrics
    const totalRevenue = (harvests as any[])?.reduce((acc, h) => acc + (h.revenue_realized || 0), 0) || 0
    const totalExpenses = (expenses as any[])?.reduce((acc, e) => acc + (e.amount || 0), 0) || 0
    const laborLogs = (logs as any[])?.filter(l => l.log_type === 'labor_hours') || []
    const totalLaborHours = laborLogs.reduce((acc, l) => acc + (l.quantity || 0), 0)

    // KPI: COP (Cost of Production per Kg)
    const copPerKg = totalHarvestKg > 0 ? (totalExpenses / totalHarvestKg).toFixed(2) : '0.00'

    // KPI: Net Profit Per Bigha
    const totalArea = (farms as any[])?.reduce((acc, f) => acc + (f.total_area || 0), 0) || 1
    const netProfit = totalRevenue - totalExpenses
    const profitPerBigha = (netProfit / totalArea).toFixed(0)

    // Chart Data Preparation
    // Use biomass logs for growth curve
    const chartData = (biomassLogs.length > 0 ? biomassLogs : []).map(log => ({
        day: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual_growth: log.quantity,
        projected_growth: (log.quantity || 0) * 1.1, // Mock projection
        soil_moisture: 60 // Placeholder for now, could map readings by date
    }))


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <AddSensorDialog farms={farms as any[]} />
                    <AddLogDialog farms={farms as any[]} />
                    <AddExpenseDialog farms={farms as any[]} />
                    <AddHarvestDialog farms={farms as any[]} />
                    <Button asChild variant="outline" size="sm">
                        <Link href="/seed">Reset / Seed Data</Link>
                    </Button>
                </div>
            </div>

            {/* SECTION 1: AGRONOMY & ENVIRONMENTAL (Real-time / Daily) */}
            <div>
                <h3 className="text-xl font-semibold mb-4">1. Agronomy & Environmental</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Real-time Sensors */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{latestReading?.soil_moisture || '--'}%</div>
                            <p className="text-xs text-muted-foreground">pH: {latestReading?.ph_level || '--'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
                            <Activity className="h-4 w-4 text-cyan-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{latestReading?.dissolved_oxygen || '--'} mg/L</div>
                            <p className="text-xs text-muted-foreground">O2 Level (Aqua)</p>
                        </CardContent>
                    </Card>

                    {/* Calculated Agronomy KPIs */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Water Efficiency</CardTitle>
                            <Scale className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{waterEfficiency} <span className="text-sm font-normal">kg/L</span></div>
                            <p className="text-xs text-muted-foreground">Harvest per Liter</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Feed Conv. Ratio</CardTitle>
                            <Scale className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fcr}</div>
                            <p className="text-xs text-muted-foreground">Target: 1.2 - 1.5</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disease Risk</CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${diseaseRisk === 'High' ? 'text-red-500' : 'text-green-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${diseaseRisk === 'High' ? 'text-red-500' : 'text-green-500'}`}>{diseaseRisk}</div>
                            <p className="text-xs text-muted-foreground">Based on Temp/Hum</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* SECTION 2: PRODUCTION & GROWTH TRACKING */}
            <div>
                <h3 className="text-xl font-semibold mb-4">2. Production & Growth</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Biomass Growth Curve</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <GrowthChart data={chartData} />
                        </CardContent>
                    </Card>

                    <div className="col-span-3 grid gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Survival Rate</CardTitle>
                                <HeartrateIcon className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{survivalRate}%</div>
                                <p className="text-xs text-muted-foreground">Mortality: {totalMortality}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Growth Velocity</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{growthVelocity} <span className="text-sm font-normal">kg/day</span></div>
                                <p className="text-xs text-muted-foreground">Avg Daily Gain</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Est. Biomass</CardTitle>
                                <Sprout className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentBiomass} kg</div>
                                <p className="text-xs text-muted-foreground">Current Standing Stock</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* SECTION 3: FINANCIAL & OPERATIONAL */}
            <div>
                <h3 className="text-xl font-semibold mb-4">3. Financial & Operational</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Input Costs</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total Expenses</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit / Bigha</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₹{parseFloat(profitPerBigha).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Across {totalArea} Bighas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cost of Prod (COP)</CardTitle>
                            <DollarSign className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{copPerKg} <span className="text-sm font-normal">/kg</span></div>
                            <p className="text-xs text-muted-foreground">Break-even Price</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Labor Hours</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalLaborHours} hrs</div>
                            <p className="text-xs text-muted-foreground">Total Man-hours</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function HeartrateIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 14c1.49-1.28 3.6-2.34 4.8-1.5 2.15 1.5 1.5 7.15-5.3 11.5-6.8 4.35-14.7-2-16-6.5C1.65 13.9.7 10.65 3.5 8c2.8-2.65 6.3 0 6.3 0s3.5-3.65 6.3-1c3 2.85 2 6.15.5 8" />
            <path d="M12 21.35V2.65" />
        </svg>
    )
}


