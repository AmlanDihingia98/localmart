"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Settings, Activity, Sprout } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: Home,
    },
    {
        title: "My Farms",
        href: "/dashboard/farms",
        icon: Sprout,
    },
    {
        title: "Live Monitoring",
        href: "/dashboard/monitoring",
        icon: Activity,
    },
    {
        title: "Financials",
        href: "/dashboard/financials",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card px-4 py-6">
            <div className="flex items-center gap-2 px-2 pb-6">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border">
                    <Image
                        src="/logo-refresh.png"
                        alt="Local Mart Logo"
                        fill
                        className="object-cover scale-125"
                        priority
                    />
                </div>
                <span className="text-lg font-bold tracking-tight">Local Mart</span>
            </div>
            <nav className="flex flex-col gap-2">
                {sidebarItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-2",
                            pathname === item.href && "bg-secondary"
                        )}
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    </Button>
                ))}
            </nav>
        </div>
    )
}
