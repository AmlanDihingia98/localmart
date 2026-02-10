import type { Metadata } from "next"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
    title: "Local Mart Dashboard",
    description: "Agri-tech platform for monitoring pilot farms",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-background p-8">
                {children}
            </main>
        </div>
    )
}
