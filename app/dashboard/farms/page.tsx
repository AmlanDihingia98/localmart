import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Sprout } from "lucide-react"
import { AddFarmDialog } from "@/components/farm/add-farm-dialog"

export default async function FarmsPage() {
    const supabase = await createClient()
    const { data: farms, error } = await supabase.from('farms').select('*').order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching farms:", error)
        return <div>Failed to load farms.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Farms</h2>
                <AddFarmDialog />
            </div>

            {farms?.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    No farms found. Create one to get started.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(farms as any[])?.map((farm) => (
                        <Card key={farm.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sprout className="h-5 w-5 text-green-600" />
                                    {farm.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {farm.location || "No location set"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Area</p>
                                        <p className="font-medium">{farm.total_area} Bighas</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="font-medium text-green-600">Active</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/farms/${farm.id}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
