import { createClient } from '@supabase/supabase-js';
import 'dotenv/config.js'


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;


function checkSupabaseEnv() {
    if (!SUPABASE_URL) {
        throw new Error('SUPABASE_URL is not set or is empty. Please set it in your environment variables.');
    }

    if (!SUPABASE_KEY) {
        throw new Error('SUPABASE_KEY is not set or is empty. Please set it in your environment variables.');
    }
}

// Panggil fungsi untuk memeriksa variabel lingkungan
checkSupabaseEnv();

// Buat klien Supabase
export const database = createClient(SUPABASE_URL, SUPABASE_KEY);
