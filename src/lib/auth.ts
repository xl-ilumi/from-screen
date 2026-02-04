// src/lib/auth.ts
import { supabase } from "./supabase";

export type AuthUser = {
  id: string;
  email: string;
};

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * 현재 로그인된 사용자 가져오기
 */
export async function getUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
  };
}

/**
 * 관리자 여부 확인
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;

  // ID로 먼저 확인
  const { data: byId, error: idError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (idError) {
    console.error("관리자 확인 실패 (ID):", idError);
  }

  if (byId) return true;

  // 이메일로도 확인 (ID가 다를 수 있음)
  const { data: byEmail, error: emailError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (emailError) {
    console.error("관리자 확인 실패 (Email):", emailError);
  }

  return !!byEmail;
}

/**
 * Auth 상태 변화 구독
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
