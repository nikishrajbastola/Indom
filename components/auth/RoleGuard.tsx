"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "organization" | "admin";

type RoleGuardProps = {
  children: ReactNode;
  allowedRole: UserRole;
};

export default function RoleGuard({
  children,
  allowedRole,
}: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthorization = async () => {
      setIsChecking(true);

      /*
       * getUser() contacts Supabase Auth and verifies the current user.
       * This is more appropriate for authorization than merely trusting
       * locally stored session information.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (profileError || !profile) {
        console.error("Unable to load user profile:", profileError);
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const role = profile.role as UserRole;

      if (role !== allowedRole) {
        if (role === "student") {
          router.replace("/student");
          return;
        }

        if (role === "organization") {
          router.replace("/organization");
          return;
        }

        if (role === "admin") {
          router.replace("/admin");
          return;
        }

        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuthorization();

    /*
     * Recheck whenever the authentication state changes, such as when
     * the user signs out in another tab.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [allowedRole, router]);

  if (isChecking || !isAuthorized) {
    return (
      <main style={loadingPage}>
        <div style={spinner} />
        <p style={loadingText}>Checking access...</p>
      </main>
    );
  }

  return <>{children}</>;
}

const loadingPage = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
};

const spinner = {
  width: "34px",
  height: "34px",
  border: "3px solid rgba(255,255,255,0.2)",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const loadingText = {
  color: "#aaa",
  fontSize: "15px",
};