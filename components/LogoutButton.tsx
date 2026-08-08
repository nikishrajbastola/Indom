"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      style={className ? undefined : buttonStyle}
    >
      Log Out
    </button>
  );
}

const buttonStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
