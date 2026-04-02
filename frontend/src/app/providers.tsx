"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(13, 20, 34, 0.95)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              borderRadius: "14px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0d1422" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0d1422" } },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
