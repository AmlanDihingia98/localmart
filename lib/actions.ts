'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
    logSchema, type LogFormValues,
    farmSchema, type FarmFormValues,
    expenseSchema, type ExpenseFormValues,
    harvestSchema, type HarvestFormValues,
    type SensorReadingFormValues
} from '@/lib/schemas'

export async function addOperationalLog(data: LogFormValues) {
    console.log("Server Action Received:", data)
    const supabase = await createClient()

    try {
        const { error } = await supabase.from('operational_logs').insert([
            {
                farm_id: data.farm_id,
                log_type: data.log_type,
                quantity: data.quantity,
                unit: data.unit,
                notes: data.notes ?? null,
                log_date: data.log_date,
            },
        ] as any)

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, message: error.message }
        }

        revalidatePath(`/dashboard/farms/${data.farm_id}`)
        return { success: true, message: 'Log added successfully' }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, message: 'Failed to add log' }
    }
}

export async function createFarm(data: FarmFormValues) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    // Check if profile exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

    if (!profile) {
        // Create missing profile to satisfy Foreign Key constraint
        const { error: profileError } = await supabase.from('profiles').insert([
            {
                id: user.id,
                full_name: user.email?.split('@')[0] || 'Farmer',
                role: 'farmer'
            }
        ] as any)

        if (profileError) {
            console.error('Failed to create profile:', profileError)
            return { success: false, message: 'Failed to initialize user profile. Please contact support.' }
        }
    }

    try {
        const { error } = await supabase.from('farms').insert([
            {
                name: data.name,
                location: data.location,
                total_area: data.total_area,
                owner_id: user.id
            },
        ] as any)

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, message: error.message }
        }

        revalidatePath('/dashboard/farms')
        return { success: true, message: 'Farm created successfully' }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, message: 'Failed to create farm' }
    }
}

export async function addExpense(data: ExpenseFormValues) {
    const supabase = await createClient()

    try {
        const { error } = await supabase.from('expenses').insert([
            {
                farm_id: data.farm_id,
                expense_date: data.expense_date,
                category: data.category,
                amount: data.amount,
                description: data.description ?? null
            },
        ] as any)

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, message: error.message }
        }

        revalidatePath(`/dashboard/farms/${data.farm_id}`)
        return { success: true, message: 'Expense added successfully' }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, message: 'Failed to add expense' }
    }
}

export async function addHarvest(data: HarvestFormValues) {
    const supabase = await createClient()

    // 1. Find active crop cycle for this farm
    // We need a cycle to link the harvest to.
    const { data: cycles } = await supabase
        .from('crop_cycles')
        .select('id')
        .eq('farm_id', data.farm_id)
        .eq('status', 'active')
        .limit(1)

    let cropCycleId = (cycles as any)?.[0]?.id

    // 2. If no active cycle, create a default one (Production Level resilience)
    if (!cropCycleId) {
        // Try to find ANY cycle first to avoid spamming
        const { data: anyCycle } = await supabase
            .from('crop_cycles')
            .select('id')
            .eq('farm_id', data.farm_id)
            .order('created_at', { ascending: false })
            .limit(1)

        if ((anyCycle as any)?.[0]?.id) {
            cropCycleId = (anyCycle as any)[0].id
        } else {
            // Create initial cycle
            const { data: newCycle, error: cycleError } = await supabase
                .from('crop_cycles')
                .insert([{
                    farm_id: data.farm_id,
                    crop_name: 'Initial Crop',
                    crop_type: 'vegetable', // Default
                    status: 'active',
                    start_date: new Date().toISOString()
                }] as any)
                .select()
                .single()

            if (cycleError || !newCycle) {
                return { success: false, message: 'Failed to create tracking cycle for harvest' }
            }
            cropCycleId = (newCycle as any).id
        }
    }

    try {
        const { error } = await supabase.from('harvests').insert([
            {
                crop_cycle_id: cropCycleId,
                harvest_date: data.harvest_date,
                quantity_kg: data.quantity_kg,
                wastage_kg: data.wastage_kg ?? 0,
                quality_grade: data.quality_grade,
                market_price_per_kg: data.market_price_per_kg ?? 0,
                sale_price_per_kg: data.sale_price_per_kg ?? 0,
                revenue_realized: (data.quantity_kg * (data.sale_price_per_kg || 0)),
                // notes: data.notes // notes not in schema yet? schema.sql didn't show notes column in harvests table, checking...
                // Harvests table in schema.sql:
                // id, crop_cycle_id, harvest_date, quantity_kg, wastage_kg, quality_grade, revenue_realized, created_at...
                // It does NOT have notes. I should add it or omit it. 
                // Adding notes to schema.sql is easy but might require another migration for user.
                // For now, I'll omit notes from insert to avoid error.
            },
        ] as any)

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, message: error.message }
        }

        revalidatePath(`/dashboard/farms/${data.farm_id}`)
        return { success: true, message: 'Harvest recorded successfully' }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, message: 'Failed to add harvest' }
    }
}

export async function addSensorReading(data: SensorReadingFormValues) {
    const supabase = await createClient()

    // 1. Find or Create a "Manual Entry" Device for this farm
    const { data: devices } = await supabase
        .from('iot_devices')
        .select('id')
        .eq('farm_id', data.farm_id)
        .eq('device_type', 'climate_station')
        .eq('device_name', 'Manual Entry')
        .limit(1)

    let deviceId = (devices as any)?.[0]?.id

    if (!deviceId) {
        const { data: newDevice, error: deviceError } = await supabase
            .from('iot_devices')
            .insert([{
                farm_id: data.farm_id,
                device_name: 'Manual Entry',
                device_type: 'climate_station',
                is_active: true
            }] as any)
            .select()
            .single()

        if (deviceError || !newDevice) {
            return { success: false, message: 'Failed to initialize manual log device' }
        }
        deviceId = (newDevice as any).id
    }

    try {
        const { error } = await supabase.from('iot_readings').insert([
            {
                device_id: deviceId,
                recorded_at: data.recorded_at,
                soil_moisture: data.soil_moisture,
                ph_level: data.ph_level,
                temperature: data.temperature,
                humidity: data.humidity,
                npk_nitrogen: data.npk_nitrogen,
                npk_phosphorus: data.npk_phosphorus,
                npk_potassium: data.npk_potassium,
                dissolved_oxygen: data.dissolved_oxygen,
                ammonia: data.ammonia,
                nitrate: data.nitrate,
                salinity: data.salinity
            },
        ] as any)

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, message: error.message }
        }

        revalidatePath(`/dashboard/farms/${data.farm_id}`)
        return { success: true, message: 'Readings recorded successfully' }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, message: 'Failed to add readings' }
    }
}


