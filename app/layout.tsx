// This tells Next.js that this file is a Client Component
"use client";

import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { isUsingMockDatabase } from "@/lib/supabase";

// Load Google Fonts
const inter = Inter({ subsets: ["latin"] });

// Define the Root Layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything inside AuthProvider to handle authentication */}
        <AuthProvider>
          {/* Show a warning if the mock database is being used */}
          {isUsingMockDatabase && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center text-sm">
              Running in demo mode with localStorage. Set up Supabase for persistent storage.
            </div>
          )}
          {/* Header of the application */}
          <Header />
          {/* Main content */}
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

