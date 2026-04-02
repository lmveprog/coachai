"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { billingApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({ className, children }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push("/register?plan=pro");
      return;
    }
    setLoading(true);
    try {
      const { data } = await billingApi.createCheckout();
      window.location.href = data.url;
    } catch {
      setLoading(false);
      toast.error("Erreur lors de la création de la session de paiement. Réessaie dans un instant.");
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
      {children}
    </button>
  );
}
