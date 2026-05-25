"use client";

import { AuthProvider } from "@/app/utils/AuthContext";
import { SessionProvider } from "@/app/context/SessionContext";
import { CartProvider } from "@/app/context/CartContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
