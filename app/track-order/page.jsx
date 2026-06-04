import TrackOrderClient from "./TrackOrderClient";

export const metadata = {
  metadataBase: new URL("https://shop.yuukke.com"),

  title: "Track Your Order Online | Yuukke Global",

  description:
    "Track your Yuukke order in real time using Order ID, AWB number, or phone number. Stay updated on your shipment and delivery status.",

  keywords: [
    // Core Tracking Keywords
    "track order online",
    "Yuukke order tracking",
    "track shipment India",
    "track package online",
    "order delivery status",
    "AWB tracking India",
    "online parcel tracking",
    "real time order tracking",

    // User Intent Keywords
    "track my order",
    "check order status",
    "shipment tracking",
    "delivery tracking India",
    "courier tracking online",
    "package delivery updates",

    // Brand Keywords
    "Yuukke Global",
    "Yuukke tracking",
    "Yuukke delivery",
    "Yuukke order status",

    // Marketplace SEO
    "women-powered marketplace",
    "handmade products India",
    "artisan marketplace India",
  ],

  authors: [{ name: "Yuukke" }],

  creator: "Yuukke",

  publisher: "Yuukke",

  alternates: {
    canonical: "https://shop.yuukke.com/track-order",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Track Your Order Online | Yuukke Global",

    description:
      "Track your order status, shipment progress, and delivery updates in real time with Yuukke Global.",

    url: "https://shop.yuukke.com/track-order",

    siteName: "Yuukke",

    locale: "en_IN",

    images: [
      {
        url: "https://shop.yuukke.com/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Yuukke Order Tracking",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Track Your Order Online | Yuukke Global",

    description:
      "Track your Yuukke shipment, package delivery, and order updates in real time.",

    images: ["https://shop.yuukke.com/og-banner.jpg"],
  },
};

export default function Page() {
  return <TrackOrderClient />;
}
