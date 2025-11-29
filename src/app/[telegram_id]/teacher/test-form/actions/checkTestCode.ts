'use server'

import { supabase } from "@/lib/supabase"
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors"

export async function isTestCodeUnique(code: string, testId?: string): Promise<boolean> {
    try {
        const {data, error} = await supabase
        .from('tests')
        .select('id, code, status')
        .eq('code', code)
        .maybeSingle()

        if (error) {
            throw new Error('Error checking test code')
        }

        
        if(!data) {
            return true
        }

        if(data?.id === testId) {
            return true
        }

        return false
    } catch (error) {
        sendProductionErrors(error, 'checkTestCodeAction')
        return false
    }
} 