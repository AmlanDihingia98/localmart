"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    {
        day: "Day 1",
        projected: 10,
        actual: 8,
    },
    {
        day: "Day 5",
        projected: 15,
        actual: 14,
    },
    {
        day: "Day 10",
        projected: 25,
        actual: 22,
    },
    {
        day: "Day 15",
        projected: 35,
        actual: 36,
    },
    {
        day: "Day 20",
        projected: 50,
        actual: 48,
    },
    {
        day: "Day 25",
        projected: 70,
        actual: 68,
    },
    {
        day: "Day 30",
        projected: 90,
        actual: 92,
    },
]

export function PlaceholderChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
