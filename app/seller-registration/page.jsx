import SellerRegistrationClient from "./SellerRegistrationClient";

export const metadata = {
  metadataBase: new URL("https://shop.yuukke.com"),

  title: "Sell on Yuukke | Register as a Seller Today",

  description:
    "Join Yuukke — India's First women-powered marketplace. List your handmade, artisan, or homemade products and reach thousands of buyers across India. Free to register.",

  keywords: [
    "sell on Yuukke",
    "seller registration",
    "register as seller",
    "women-powered marketplace",
    "women entrepreneur marketplace",
    "sell handmade products online",
    "artisan marketplace India",
    "homemade products marketplace",
    "women-led brands India",
    "become a seller online",
    "free seller registration",
    "Indian handmade marketplace",
    "support women entrepreneurs",
    "sell handmade gifts",
    "sell home decor online",
    "online marketplace for artisans",
    "small business marketplace India",
    "women entrepreneur platform",
    "start selling online India",
    "seller onboarding",
  ],

  authors: [{ name: "Yuukke" }],
  creator: "Yuukke",
  publisher: "Yuukke",

  alternates: {
    canonical: "https://shop.yuukke.com/seller-registration",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Sell on Yuukke | Register as a Seller Today",

    description:
      "Join India's First women-powered marketplace. Sell handmade, artisan, and homemade products to customers across India.",

    url: "https://shop.yuukke.com/seller-registration",

    siteName: "Yuukke",

    locale: "en_IN",

    images: [
      {
        url: "/seller-og.jpeg", // ← from public folder
        width: 1200,
        height: 630,
        alt: "Sell on Yuukke",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Sell on Yuukke | Register as a Seller Today",

    description:
      "Register as a seller on Yuukke and grow your handmade, artisan, or homemade business across India.",

    images: ["/seller-og.jpeg"], // ← same image
  },
};

export default function Page() {
  return <SellerRegistrationClient />;
}
