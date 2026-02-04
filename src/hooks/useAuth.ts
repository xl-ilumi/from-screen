"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AuthUser,
  getUser,
  isAdmin,
  onAuthStateChange,
  signOut,
} from "@/lib/auth";

type AuthState = {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
};

export function useAuth(requireAdmin = false) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    // 초기 사용자 상태 확인
    async function checkUser() {
      const user = await getUser();
      if (user) {
        const adminStatus = await isAdmin();
        setState({ user, isAdmin: adminStatus, isLoading: false });

        // 관리자 권한 필요한데 관리자가 아니면 리다이렉트
        if (requireAdmin && !adminStatus) {
          router.push("/admin");
        }
      } else {
        setState({ user: null, isAdmin: false, isLoading: false });
        if (requireAdmin) {
          router.push("/admin");
        }
      }
    }

    checkUser();

    // Auth 상태 변화 구독
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        const adminStatus = await isAdmin();
        setState({ user, isAdmin: adminStatus, isLoading: false });
      } else {
        setState({ user: null, isAdmin: false, isLoading: false });
        if (requireAdmin) {
          router.push("/admin");
        }
      }
    });

    return unsubscribe;
  }, [requireAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin");
  };

  return {
    ...state,
    signOut: handleSignOut,
  };
}
