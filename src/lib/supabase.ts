// Bu modul faqat serverda ishlaydi. Agar biror client komponent uni import
// qilsa, `server-only` build'ni yiqitadi — service role kaliti brauzerga
// chiqib ketishidan shu himoya qiladi.
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY o'rnatilishi shart"
  );
}

/**
 * Serverdagi yagona Supabase klienti.
 *
 * Avval bu klient `NEXT_PUBLIC_SUPABASE_ANON_KEY` bilan qurilar edi. O'sha
 * kalit brauzer bundle'iga tushadi, ya'ni ochiq — va RLS yoqilmagani uchun
 * u bilan butun bazani o'qish ham, o'zgartirish ham mumkin edi (jumladan
 * savollarning to'g'ri javoblarini). Endi server service role bilan ishlaydi
 * va anon kalitning bazaga umuman huquqi qolmaydi.
 */
export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
