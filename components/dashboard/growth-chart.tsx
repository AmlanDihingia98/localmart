"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface GrowthData {
    day: string
    projected_growth?: number
    actual_growth?: number
    soil_moisture?: number
    ph?: number
}

interface GrowthChartProps {
    data: GrowthData[]
}

export function GrowthChart({ data }: GrowthChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    yAxisId="left"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[50, 80]}
                    hide
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="projected_growth"
                    name="Projected Growth"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="actual_growth"
                    name="Actual Growth"
                    stroke="#22c55e"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                />
                {/* Parameter lines as requested */}
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soil_moisture"
                    name="Soil Moisture (Avg)"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
