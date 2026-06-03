import { createClient } from "@supabase/supabase-js";

// جلب رابط السيرفر الخاص بـ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// جلب المفتاح العام الآمن (تأكد أن هذا الاسم مطابِق لما هو مكتوب في ملف .env.local)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);