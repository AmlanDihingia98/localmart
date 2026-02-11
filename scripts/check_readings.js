const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngdslxyfxudfojduvbjh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZHNseHlmeHVkZm9qZHV2YmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzM2NDIsImV4cCI6MjA4NjMwOTY0Mn0.Qx8kPvISbqDKbDuWa5m-cHIpJXXJZgypJxZle5zmSrw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- DEBUG START ---');

    // 1. Fetch ALL Devices and print their types
    const { data: devices, error: devError } = await supabase.from('iot_devices').select('id, device_type');
    if (devError) console.error('Device Error:', devError);
    console.log(`Step 1: Found ${devices?.length} devices in iot_devices table.`);

    // 2. Fetch distinct device_ids from readings
    const { data: readingsList, error: readListError } = await supabase
        .from('iot_readings')
        .select('device_id, soil_moisture')
        .order('recorded_at', { ascending: false })
        .limit(50);

    if (readListError) console.error('Reading Error:', readListError);
    console.log(`Step 2: Fetched ${readingsList?.length} readings.`);

    if (readingsList && readingsList.length > 0) {
        console.log('Sample Reading:', readingsList[0]);
        const uniqueDeviceIds = [...new Set(readingsList.map(r => r.device_id))];
        console.log('Unique Device IDs in Readings:', uniqueDeviceIds);

        // Check if these IDs exist in the devices list
        const missing = uniqueDeviceIds.filter(id => !devices.some(d => d.id === id));
        console.log('Device IDs present in readings but MISSING in iot_devices table:', missing);
    }

    if (!devices || devices.length === 0) {
        console.log('CRITICAL: No devices found in DB. Cannot look for target IDs.');
    } else {
        const typeToFind = 'soil_moisture';
        const targetIds = devices.filter(d => d.device_type === typeToFind).map(d => d.id);
        console.log(`Step 3: Looking for type '${typeToFind}'. Matches found: ${targetIds.length}`);

        if (targetIds.length > 0) {
            // ... existing match logic would go here if we were querying by targets ...
            console.log('Target IDs:', targetIds);
        }
    }

    // 3. Fetch Readings (Mimic Dashboard Logic)
    const { data: readings, error: readError } = await supabase
        .from('iot_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

    if (readError) console.error('Reading Error:', readError);
    console.log(`Step 3: Fetched ${readings?.length} latest readings.`);

    // 4. Try to match
    const field = 'soil_moisture';
    const match = readings.find(r => targetIds.includes(r.device_id) && r[field] != null);

    if (match) {
        console.log('SUCCESS: Found matching reading!');
        console.log('Reading ID:', match.id);
        console.log('Device ID:', match.device_id);
        console.log('Value:', match[field]);
        console.log('Recorded At:', match.recorded_at);
    } else {
        console.log('FAILURE: No matching reading found in top 100.');

        // Deep dive: Check if any of the target IDs appear at all
        const anyPresence = readings.filter(r => targetIds.includes(r.device_id));
        console.log(`Stats: Target IDs appear ${anyPresence.length} times in valid readings.`);
        if (anyPresence.length > 0) {
            console.log('Example entry for target ID:', anyPresence[0]);
            console.log(`But is field '${field}' null?`, anyPresence[0][field]);
        }
    }
    console.log('--- DEBUG END ---');
}

check();
