import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.className}`}>
        <QueryProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: "text-sm font-medium",
                  style: {
                    zIndex: 9999,
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  },
                  success: {
                    style: {
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                    },
                    iconTheme: {
                      primary: "white",
                      secondary: "#10b981",
                    },
                  },
                  error: {
                    style: {
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      border: "none",
                    },
                    iconTheme: {
                      primary: "white",
                      secondary: "#ef4444",
                    },
                  },
                }}
              />
            </SidebarProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
