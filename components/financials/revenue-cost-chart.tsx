"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
    {
        name: "Jan",
        revenue: 4000,
        cost: 2400,
    },
    {
        name: "Feb",
        revenue: 3000,
        cost: 1398,
    },
    {
        name: "Mar",
        revenue: 2000,
        cost: 9800,
    },
    {
        name: "Apr",
        revenue: 2780,
        cost: 3908,
    },
    {
        name: "May",
        revenue: 1890,
        cost: 4800,
    },
    {
        name: "Jun",
        revenue: 2390,
        cost: 3800,
    },
    {
        name: "Jul",
        revenue: 3490,
        cost: 4300,
    },
]

export function RevenueCostChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
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
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="cost" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Cost" />
            </BarChart>
        </ResponsiveContainer>
    )
}
