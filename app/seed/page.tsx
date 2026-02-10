
import { createClient } from "@/lib/supabase/server"
import { seedFarms } from "@/lib/seed"
import { redirect } from "next/navigation"

export default async function SeedPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please login first</div>
    }

    const count = await seedFarms(user.id)

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Seeding Complete</h1>
            <p>Created {count} farms.</p>
            <form action={async () => {
                'use server'
                redirect('/dashboard')
            }}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Go to Dashboard</button>
            </form>
        </div>
    )
}
