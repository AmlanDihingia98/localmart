
import { createClient } from '@/lib/supabase/server'

// This is a helper function to seed data. 
// In a real app we'd run this via a script, but here we can expose it via a temporary server action or just run it once if we had a runner.
// Since we don't have a direct runner, I'll make a Next.js API route or Server Action to trigger it.
// Let's make it a Server Action that we can call from a temporary button or just assume the user wants the data there.
// I'll add a temporary "Seed Data" button to the Settings page, or just run it via a hidden component.
// Better: I'll create a `route.ts` that I can hit with a browser or curl.

export async function seedFarms(userId: string) {
    const supabase = await createClient()

    const farmsToCreate = [
        { name: "Green Valley Model Farm", location: "Sector 4, North Block", total_area: 5.2 },
        { name: "Eco-Aqua Hub", location: "Riverside Zone A", total_area: 3.5, crop_type: 'aquaculture' },
        { name: "Sunrise Veg Plot", location: "East Field", total_area: 2.1 },
        { name: "Orchard Pilot Project", location: "Hillside Terrace", total_area: 8.0 },
        { name: "Urban Vertical Unit", location: "City Center Lab", total_area: 0.5 },
        { name: "Community Garden A", location: "Village Square", total_area: 1.2 },
        { name: "Community Garden B", location: "Village Square", total_area: 1.2 },
        { name: "Research Plot X1", location: "Agronomy Center", total_area: 0.8 },
        { name: "Hydroponic Testbed", location: "Glasshouse 2", total_area: 0.3 },
        { name: "Sustainable Fishery 1", location: "Lake Zone", total_area: 4.0, crop_type: 'aquaculture' },
        { name: "Organic Rhizome Field", location: "West Block", total_area: 3.0 },
        { name: "Mixed Crop Demo", location: "South Gate", total_area: 2.5 }
    ]

    let count = 0
    for (const farm of farmsToCreate) {
        const { error } = await supabase.from('farms').insert({
            owner_id: userId,
            name: farm.name,
            location: farm.location,
            total_area: farm.total_area
        } as any)
        if (!error) count++
    }
    return count
}
