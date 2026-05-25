import "./globals.css";
import ClientAppWrapper from "./components/Layout/ClientAppWrapper";
import Providers from "./providers";

export const metadata = {
  metadataBase: new URL("https://shop.yuukke.com"),

  title:
    "Handmade Indian Products, Gifts & Home Essentials Online | Yuukke Global",

  description:
    "Looking for unique handmade products? Shop curated artisan collections, home decor, gifts, pantry essentials & millet snacks at Yuukke Global.",

  keywords: [
    // Brand Positioning
    "women-powered marketplace",
    "Bharat’s first women-powered marketplace",
    "women-led brands India",
    "women entrepreneur marketplace",
    "support women entrepreneurs",
    "shop women-owned brands",

    // Marketplace Keywords
    "handmade products online India",
    "handcrafted products online",
    "artisan products India",
    "curated handmade products",
    "women entrepreneur products",
    "Indian handmade marketplace",
    "handmade Indian gifts",
    "unique handmade products",
    "premium handmade products",
    "sustainable handmade products",
    "artisanal collections India",
    "artisanal gift hampers",

    // Home Decor
    "handmade home decor India",
    "brass decor items online",
    "wooden decor products",
    "marble home decor",
    "artisan home accessories",
    "handcrafted decor online",
    "premium home decor India",
    "curated decor collections",

    // Pantry / Grocery
    "millet snacks online",
    "healthy millet snacks India",
    "pantry essentials online",
    "artisanal groceries India",
    "healthy snacks online India",
    "traditional Indian snacks",
    "organic pantry essentials",
    "handcrafted food products",
    "women-led food brands",
  ],

  authors: [{ name: "Yuukke" }],

  creator: "Yuukke",

  publisher: "Yuukke",

  alternates: {
    canonical: "https://shop.yuukke.com",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title:
      "Handmade Indian Products, Gifts & Home Essentials Online | Yuukke Global",

    description:
      "Looking for unique handmade products? Shop curated artisan collections, home decor, gifts, pantry essentials & millet snacks at Yuukke Global.",

    url: "https://shop.yuukke.com",

    siteName: "Yuukke",

    locale: "en_IN",

    images: [
      {
        url: "https://shop.yuukke.com/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Yuukke Global Marketplace",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Handmade Indian Products, Gifts & Home Essentials Online | Yuukke Global",

    description:
      "Shop curated artisan collections, handmade gifts, home decor, pantry essentials & millet snacks at Yuukke Global.",

    images: ["https://shop.yuukke.com/og-banner.jpg"],
  },
};

export default function RootLayout({ children }) {
  const schemas = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "Organization",

        "@id": "https://shop.yuukke.com/#organization",

        name: "Yuukke",

        url: "https://shop.yuukke.com",

        logo: {
          "@type": "ImageObject",
          url: "https://shop.yuukke.com/new-logo.png",
        },

        description:
          "India’s women-powered marketplace for handmade, artisan, sustainable, and premium products.",

        sameAs: ["https://instagram.com/yuukke", "https://facebook.com/yuukke"],

        inLanguage: "en-IN",
      },

      {
        "@type": "WebSite",

        "@id": "https://shop.yuukke.com/#website",

        name: "Yuukke",

        url: "https://shop.yuukke.com",

        inLanguage: "en-IN",

        publisher: {
          "@id": "https://shop.yuukke.com/#organization",
        },

        potentialAction: {
          "@type": "SearchAction",

          target: {
            "@type": "EntryPoint",

            urlTemplate:
              "https://shop.yuukke.com/search?q={search_term_string}",
          },

          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="9naGn2ncQ9JE4a4-MMIopkLPdL59RWPoXsO-UBFKZdI"
        />

        {/* Global Structured Data */}
        <script
          id="global-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas),
          }}
        />
      </head>

      <body className="antialiased">
        <Providers>
          <ClientAppWrapper>{children}</ClientAppWrapper>
        </Providers>

        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TSWV69XP"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          />
        </noscript>
      </body>
    </html>
  );
}
