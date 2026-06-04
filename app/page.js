import React from "react";
import dynamic from "next/dynamic";
import { ImagesSliderDemo } from "./home/slider";
import HomeSchema from "./HomeSchema";

// ⏳ Product card skeleton loader
const LoadingFallback = ({ count = 8 }) => (
  <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-[280px] rounded-xl bg-gray-100 animate-pulse" />
    ))}
  </div>
);

const WobbleCardDemo = dynamic(
  () => import("./home/card").then((m) => m.WobbleCardDemo),
  {
    loading: () => null,
  },
);

const RecentlyViewedProducts = dynamic(
  () => import("./home/RecentlyViewedProducts"),
  {
    loading: () => <LoadingFallback />,
  },
);

const LogoSlider = dynamic(() => import("./home/LogoSlider"), {
  loading: () => <LoadingFallback />,
});

const Products = dynamic(() => import("./home/Products/Page"), {
  loading: () => <LoadingFallback />,
});

const Testimonial = dynamic(() => import("./home/TestimonialCarousel"), {
  loading: () => <LoadingFallback />,
});

const SpinnerWheel = dynamic(() => import("./components/SpinnerWheel"), {
  loading: () => <div className="flex justify-center"></div>,
});

const RecentlyViewed = dynamic(() => import("./home/RecentlyViewed"), {
  loading: () => <LoadingFallback />,
});

const WishlistProducts = dynamic(() => import("./home/WishlistProducts"), {
  loading: () => <LoadingFallback />,
});

export default function Home() {
  return (
    <>
      <HomeSchema />

      <ImagesSliderDemo />

      {/* 🌀 Lazy-loaded spinner wheel */}
      <SpinnerWheel />

      {/* 🧩 Lazy-loaded sections with skeleton fallback */}
      <WobbleCardDemo />

      <Products />
      <RecentlyViewedProducts />
      <RecentlyViewed />
      <WishlistProducts />
      <Testimonial />
      <LogoSlider />
    </>
  );
}
