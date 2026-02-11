import { z } from 'zod'

// Operational Log Schema
export const logSchema = z.object({
    farm_id: z.string().uuid(),
    log_type: z.enum([
        'feed_input',
        'mortality',
        'labor_hours',
        'electricity_usage',
        'fertilizer_application',
        'pest_incidence',
        'water_usage',
        'biomass_check',
        'growth_check'
    ]),
    quantity: z.coerce.number().nonnegative(), // Changed to nonnegative to allow 0 if needed, but positive is better for logs? user asked for specific metrics.
    unit: z.string().min(1, "Unit is required"),
    notes: z.string().optional(),
    log_date: z.string(), // ISO date string
    average_weight: z.coerce.number().optional(),
    total_count: z.coerce.number().optional()
})

export type LogFormValues = z.infer<typeof logSchema>

// Farm Schema
export const farmSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(2, "Location is required"),
    total_area: z.coerce.number().positive("Area must be positive"),
    crop_type: z.string().optional(), // For initial setup
})

export type FarmFormValues = z.infer<typeof farmSchema>

// Expense Schema
export const expenseSchema = z.object({
    farm_id: z.string().uuid(),
    expense_date: z.string(),
    category: z.enum([
        'seeds',
        'feed',
        'labor',
        'transport',
        'maintenance',
        'irrigation',
        'pest_control'
    ]),
    amount: z.coerce.number().positive(),
    description: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

// Harvest Schema (New)
export const harvestSchema = z.object({
    farm_id: z.string().uuid(),
    harvest_date: z.string(),
    quantity_kg: z.coerce.number().positive(),
    wastage_kg: z.coerce.number().nonnegative().optional(),
    quality_grade: z.enum(['A', 'B', 'C']).optional(),
    market_price_per_kg: z.coerce.number().nonnegative().optional(),
    sale_price_per_kg: z.coerce.number().nonnegative().optional(),
    notes: z.string().optional(),
})

export type HarvestFormValues = z.infer<typeof harvestSchema>

// Sensor Reading Schema (for Manual Input)
export const sensorReadingSchema = z.object({
    farm_id: z.string().uuid(),
    recorded_at: z.string(),
    soil_moisture: z.coerce.number().min(0).max(100).optional(),
    ph_level: z.coerce.number().min(0).max(14).optional(),
    temperature: z.coerce.number().optional(),
    humidity: z.coerce.number().min(0).max(100).optional(),
    // NPK
    npk_nitrogen: z.coerce.number().nonnegative().optional(),
    npk_phosphorus: z.coerce.number().nonnegative().optional(),
    npk_potassium: z.coerce.number().nonnegative().optional(),
    // Water Quality
    water_ph_level: z.coerce.number().min(0).max(14).optional(),
    dissolved_oxygen: z.coerce.number().nonnegative().optional(),
    ammonia: z.coerce.number().nonnegative().optional(),
    nitrate: z.coerce.number().nonnegative().optional(),
    salinity: z.coerce.number().nonnegative().optional(),
})

export type SensorReadingFormValues = z.infer<typeof sensorReadingSchema>
