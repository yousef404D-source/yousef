import { createClient } from "@supabase/supabase-js";

// جلب رابط السيرفر الخاص بـ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// جلب المفتاح العام الآمن
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,    // التذكر التلقائي للمستخدم ومنع خروجه عند إغلاق الموقع
    autoRefreshToken: true,  // تجديد التوكن والجلسة تلقائياً في الخلفية
    detectSessionInUrl: true // التعرف تلقائياً على روابط تسجيل دخول جوجل وإعادة تعيين الباسورد
  }
});