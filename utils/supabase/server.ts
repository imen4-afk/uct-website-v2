import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const createClient = async () => {
  const cookieStore = await cookies();

  function getAll() {
    try {
      if (cookieStore && typeof (cookieStore as any).getAll === "function") {
        return (cookieStore as any).getAll();
      }
      if (typeof cookieStore === "function") {
        const maybe = (cookieStore as any)();
        if (maybe && typeof maybe.getAll === "function") return maybe.getAll();
      }
    } catch (e) {}
    return [];
  }

  function setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
    try {
      if (cookieStore && typeof (cookieStore as any).set === "function") {
        cookiesToSet.forEach(({ name, value, options }) => (cookieStore as any).set(name, value, options));
        return;
      }
      if (typeof cookieStore === "function") {
        const maybe = (cookieStore as any)();
        if (maybe && typeof maybe.set === "function") {
          cookiesToSet.forEach(({ name, value, options }) => maybe.set(name, value, options));
          return;
        }
      }
    } catch (e) {}
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll, setAll },
  });
};
