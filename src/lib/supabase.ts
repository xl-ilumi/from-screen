import { createClient } from "@supabase/supabase-js";

// 환경 변수가 없으면 에러를 띄워서 실수를 방지합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
}

// Supabase 클라이언트 생성 (앱 어디서든 이 'supabase'를 불러서 씁니다)
export const supabase = createClient(supabaseUrl, supabaseKey);
