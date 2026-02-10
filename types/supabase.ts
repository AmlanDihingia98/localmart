export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone_number: string | null
                    role: 'admin' | 'farmer'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone_number?: string | null
                    role?: 'admin' | 'farmer'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    phone_number?: string | null
                    role?: 'admin' | 'farmer'
                    created_at?: string
                    updated_at?: string
                }
            }
            farms: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    location: string | null
                    total_area: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    location?: string | null
                    total_area?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    location?: string | null
                    total_area?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            crop_cycles: {
                Row: {
                    id: string
                    farm_id: string
                    crop_name: string
                    crop_type: 'vegetable' | 'aquaculture'
                    status: 'planned' | 'active' | 'harvested'
                    start_date: string | null
                    end_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id: string
                    crop_name: string
                    crop_type: 'vegetable' | 'aquaculture'
                    status?: 'planned' | 'active' | 'harvested'
                    start_date?: string | null
                    end_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string
                    crop_name?: string
                    crop_type?: 'vegetable' | 'aquaculture'
                    status?: 'planned' | 'active' | 'harvested'
                    start_date?: string | null
                    end_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            iot_devices: {
                Row: {
                    id: string
                    farm_id: string
                    device_name: string
                    device_type: 'soil_moisture' | 'water_quality' | 'climate_station'
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id: string
                    device_name: string
                    device_type: 'soil_moisture' | 'water_quality' | 'climate_station'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string
                    device_name?: string
                    device_type?: 'soil_moisture' | 'water_quality' | 'climate_station'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            iot_readings: {
                Row: {
                    id: number
                    device_id: string
                    recorded_at: string
                    soil_moisture: number | null
                    ph_level: number | null
                    npk_nitrogen: number | null
                    npk_phosphorus: number | null
                    npk_potassium: number | null
                    dissolved_oxygen: number | null
                    temperature: number | null
                    humidity: number | null
                }
                Insert: {
                    id?: number
                    device_id: string
                    recorded_at?: string
                    soil_moisture?: number | null
                    ph_level?: number | null
                    npk_nitrogen?: number | null
                    npk_phosphorus?: number | null
                    npk_potassium?: number | null
                    dissolved_oxygen?: number | null
                    temperature?: number | null
                    humidity?: number | null
                }
                Update: {
                    id?: number
                    device_id?: string
                    recorded_at?: string
                    soil_moisture?: number | null
                    ph_level?: number | null
                    npk_nitrogen?: number | null
                    npk_phosphorus?: number | null
                    npk_potassium?: number | null
                    dissolved_oxygen?: number | null
                    temperature?: number | null
                    humidity?: number | null
                }
            }
            operational_logs: {
                Row: {
                    id: string
                    farm_id: string
                    log_date: string
                    log_type: 'feed_input' | 'mortality' | 'labor_hours' | 'electricity_usage' | 'fertilizer_application'
                    quantity: number | null
                    unit: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id: string
                    log_date?: string
                    log_type: 'feed_input' | 'mortality' | 'labor_hours' | 'electricity_usage' | 'fertilizer_application'
                    quantity?: number | null
                    unit?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string
                    log_date?: string
                    log_type?: 'feed_input' | 'mortality' | 'labor_hours' | 'electricity_usage' | 'fertilizer_application'
                    quantity?: number | null
                    unit?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            harvests: {
                Row: {
                    id: string
                    crop_cycle_id: string
                    harvest_date: string
                    quantity_kg: number
                    wastage_kg: number
                    quality_grade: 'A' | 'B' | 'C' | null
                    revenue_realized: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    crop_cycle_id: string
                    harvest_date?: string
                    quantity_kg: number
                    wastage_kg?: number
                    quality_grade?: 'A' | 'B' | 'C' | null
                    revenue_realized?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    crop_cycle_id?: string
                    harvest_date?: string
                    quantity_kg?: number
                    wastage_kg?: number
                    quality_grade?: 'A' | 'B' | 'C' | null
                    revenue_realized?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    farm_id: string
                    expense_date: string
                    category: 'seeds' | 'feed' | 'labor' | 'transport' | 'maintenance'
                    amount: number
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id: string
                    expense_date?: string
                    category: 'seeds' | 'feed' | 'labor' | 'transport' | 'maintenance'
                    amount: number
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string
                    expense_date?: string
                    category?: 'seeds' | 'feed' | 'labor' | 'transport' | 'maintenance'
                    amount?: number
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
