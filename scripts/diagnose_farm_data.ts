
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
    const farmId = '4d4e7428-58dd-43c8-95a8-d2d2a9a90179'

    console.log(`Diagnosing Farm ID: ${farmId}`)

    // 1. Check if Farm exists
    const { data: farms, error: farmError } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)

    if (farmError) {
        console.error("Error fetching farm:", farmError.message)
        return
    }

    const farm = (farms && farms.length > 0) ? farms[0] : null

    if (!farm) {
        console.error("Farm NOT found with ID:", farmId)
        console.log("Listing available farms:")
        const { data: allFarms } = await supabase.from('farms').select('id, name').limit(5)
        console.log(allFarms)
        return
    }
    console.log("Farm found:", farm.name)

    // 2. Check Devices for this Farm
    const { data: devices, error: deviceError } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('farm_id', farmId)

    if (deviceError) {
        console.error("Error fetching devices:", deviceError.message)
    }
    console.log(`Devices found for farm (${devices?.length}):`, devices)

    if (!devices || devices.length === 0) {
        console.log("CRITICAL: No devices found for this farm. Readings cannot be displayed.")

        // Check if ANY devices exist in the system
        const { data: allDevices } = await supabase.from('iot_devices').select('*').limit(5)
        console.log("Sample of ALL devices in system:", allDevices)
        return
    }

    // 3. Check Readings for these Devices
    for (const device of devices) {
        const { data: readings, error: readingsError } = await supabase
            .from('iot_readings')
            .select('*')
            .eq('device_id', device.id)
            .order('recorded_at', { ascending: false })
            .limit(5)

        if (readingsError) {
            console.error(`Error fetching readings for device ${device.device_name}:`, readingsError.message)
        } else {
            console.log(`Readings for ${device.device_name} (${device.device_type}):`, readings?.length)
            if (readings && readings.length > 0) {
                console.log("Latest reading:", readings[0])
            }
        }
    }
}

diagnose()
