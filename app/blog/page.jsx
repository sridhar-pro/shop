import BlogClient from "./BlogClient";

export const metadata = {
  metadataBase: new URL("https://shop.yuukke.com"),

  title: "Yuukke Blog | Handmade Products, Gifting Ideas & Lifestyle Insights",

  description:
    "Explore Yuukke blogs on handmade products, gifting ideas, artisan stories, home decor trends, wellness, millet snacks & women-led brands in India.",

  keywords: [
    "Yuukke blog",
    "handmade products blog",
    "artisan stories India",
    "women-led business blog",
    "gifting ideas India",
    "home decor inspiration",
    "lifestyle trends India",
    "wellness blogs India",
    "handmade gift ideas",
    "curated gifting inspiration",
    "handmade Indian products",
    "artisan marketplace India",
    "women entrepreneur brands",
    "support local artisans India",
    "women-powered marketplace",
    "sustainable handmade products",
    "premium handmade gifts",
    "Indian artisan collections",
    "millet snacks blog",
    "healthy lifestyle India",
    "traditional snacks India",
    "organic pantry essentials",
    "healthy gifting ideas",
    "home decor trends India",
    "handcrafted decor inspiration",
    "luxury handmade decor",
    "artisan home styling",
  ],

  authors: [{ name: "Yuukke" }],

  creator: "Yuukke",

  publisher: "Yuukke",

  alternates: {
    canonical: "https://shop.yuukke.com/blog",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title:
      "Yuukke Blog | Handmade Products, Gifting Ideas & Lifestyle Insights",

    description:
      "Discover artisan stories, gifting inspiration, handmade collections, wellness tips & lifestyle insights from Yuukke Global.",

    url: "https://shop.yuukke.com/blog",

    siteName: "Yuukke",

    locale: "en_IN",

    images: [
      {
        url: "https://shop.yuukke.com/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Yuukke Blog",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Yuukke Blog | Handmade Products, Gifting Ideas & Lifestyle Insights",

    description:
      "Read blogs on handmade gifting, artisan brands, decor inspiration, wellness & lifestyle trends at Yuukke.",

    images: ["https://shop.yuukke.com/og-banner.jpg"],
  },
};

export default function Page() {
  return <BlogClient />;
}
