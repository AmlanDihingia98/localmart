import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Active Farms Count
    const { count: farmCount, error: farmError } = await supabase
        .from('farms')
        .select('*', { count: 'exact', head: true })

    // 2. Monthly Revenue (Sum of 'harvests' table revenue_realized for current month)
    // Note: Easier to just fetch all for now and filter in JS given the complexity of date filtering in pure Supabase JS sometimes
    // 2. Revenue (Harvests)
    const { data: harvests, error: harvestError } = await supabase
        .from('harvests')
        .select('revenue_realized, harvest_date')

    const currentMonth = new Date().getMonth()
    const monthlyRevenue = (harvests as any[])
        ?.filter(h => new Date(h.harvest_date).getMonth() === currentMonth)
        .reduce((sum, h) => sum + (h.revenue_realized || 0), 0) || 0

    // 3. Expenses
    const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount, expense_date')

    const monthlyExpenses = (expenses as any[])
        ?.filter(e => new Date(e.expense_date).getMonth() === currentMonth)
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0

    const netProfit = monthlyRevenue - monthlyExpenses

    return {
        farmCount: farmCount || 0,
        monthlyRevenue,
        netProfit,
        activeAlerts: 3, // Mock for now as alert logic is complex
    }
}
