"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Gift,
  ShoppingBag,
  Tag,
  LogOut,
  ShoppingCart,
  Package,
  LogIn,
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useCart } from "@/app/context/CartContext";

const CartSidebar = dynamic(() => import("@/app/components/CartSideBar"), {
  ssr: false,
});

// Injected once — no global CSS or Tailwind config changes
const CART_ANIMATION_STYLES = `
  @keyframes cartRing {
    0%   { transform: translateY(0px)   rotate(0deg);   }
    10%  { transform: translateY(-4px)  rotate(-12deg); }
    20%  { transform: translateY(-6px)  rotate(12deg);  }
    30%  { transform: translateY(-4px)  rotate(-10deg); }
    40%  { transform: translateY(-2px)  rotate(8deg);   }
    50%  { transform: translateY(0px)   rotate(-5deg);  }
    60%  { transform: translateY(0px)   rotate(0deg);   }
    100% { transform: translateY(0px)   rotate(0deg);   }
  }

  .cart-icon-ring {
    animation: cartRing 2.4s ease-in-out infinite;
    transform-origin: top center;
    display: inline-flex;
  }
`;

const MobileBottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, handleLogout } = useSession();
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // ❌ Hide on specific route(s)
  const hiddenRoutes = ["/odop-registration"];
  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <>
      {/* Scoped animation styles — injected inline, no global side-effects */}
      <style>{CART_ANIMATION_STYLES}</style>

      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.05)] border-t border-gray-200 lg:hidden font-odop">
        <div className="flex justify-around items-center py-3">
          {/* Products */}
          <button
            onClick={() => router.push("/products")}
            className="flex flex-col items-center text-xs text-[#A00300] gap-1"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
            <span className="text-black">Products</span>
          </button>

          {/* Gifts */}
          <button
            onClick={() => router.push("https://gift.yuukke.com/")}
            className="flex flex-col items-center text-xs text-[#A00300] gap-1"
          >
            <Gift className="w-5 h-5" strokeWidth={2} />
            <span className="text-black">Gifts</span>
          </button>

          {/* Offers */}
          <button
            onClick={() => router.push("/products/offers")}
            className="flex flex-col items-center text-xs text-[#A00300] gap-1"
          >
            <Tag className="w-5 h-5" strokeWidth={2} />
            <span className="text-black">Offers</span>
          </button>

          {/* Cart — animated */}
          <button
            onClick={toggleCart}
            aria-label="Cart"
            className="relative flex flex-col items-center text-xs text-[#A00300] gap-1"
          >
            <span className="relative">
              {/* Ring + pop-up animation wrapper */}
              <span className="cart-icon-ring">
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              </span>

              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-600 px-[4px] text-[9px] font-odop leading-none text-white shadow-md">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="text-black">Cart</span>
          </button>

          {/* Orders OR Login */}
          {!isLoggedIn ? (
            <button
              onClick={() => router.push("/login")}
              className="flex flex-col items-center text-xs text-[#A00300] gap-1"
            >
              <LogIn className="w-5 h-5" strokeWidth={2} />
              <span className="text-black">Login</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/orders")}
                className="flex flex-col items-center text-xs text-[#A00300] gap-1"
              >
                <Package className="w-5 h-5" strokeWidth={2} />
                <span className="text-black">Orders</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center text-xs text-red-600 gap-1"
              >
                <LogOut className="w-5 h-5" strokeWidth={2} />
                <span className="text-black">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default MobileBottomBar;
