'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    // validate fields
    const parsed = authSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return { error: 'Invalid fields' }
    }

    const { email, password } = parsed.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const parsed = authSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return { error: 'Invalid fields' }
    }

    const { email, password } = parsed.data

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // If signup was successful and a user object is returned (e.g., email confirmation not required, or session created)
    if (data.user) {
        // Create Profile for new user
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    full_name: data.user.email?.split('@')[0] || 'New Farmer',
                    role: 'farmer'
                }
            ] as any)

        if (profileError) {
            // This is a critical error: user account created, but profile creation failed.
            // You might want to log this error or handle it more robustly (e.g., attempt to delete the user,
            // or inform the user to contact support).
            return { error: 'Account created, but failed to create user profile: ' + profileError.message }
        }
    } else {
        // This branch might be hit if email confirmation is required and no session is immediately returned.
        // The user account is created, but not yet active/signed in.
        // In this scenario, the profile might be created after email confirmation, or you might
        // still want to create a pending profile here. For now, we'll assume the user needs to confirm.
        // The redirect below will still happen, but the user won't be logged in until confirmation.
        // You might want to return a specific message like "Please check your email to confirm your account."
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
