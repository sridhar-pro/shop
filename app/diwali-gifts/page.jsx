import { sans } from "./fonts";
import HeroSection from "./HeroSection";
import IntroSection from "./IntroSection";
import DiwaliEdit from "./DiwaliEdit";
import FestiveDecor from "./FestiveDecor";
import GiftingBanner from "./GiftingBanner";
import ShopByMoment from "./ShopByMoment";
import DifferenceStrip from "./DifferenceStrip";

const SITE_URL = "https://shop.yuukke.com";
const PAGE_PATH = "/diwali-gifts";

const TITLE = "Diwali Gifts 2026 – Handcrafted by Women Makers | Yuukke";
const OG_TITLE = "Diwali Gifts 2026 – Handcrafted by Women Makers";
const DESCRIPTION =
  "Shop Diwali gifts, hampers & festive décor handcrafted by women entrepreneurs across India. Thoughtful presents that light up every moment – only on Yuukke.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Diwali gifts",
    "Diwali gift hampers",
    "Diwali 2026",
    "handcrafted gifts",
    "women entrepreneurs",
    "festive décor",
    "Diwali gifting online",
    "Yuukke",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "website",
    url: PAGE_PATH,
    siteName: "Yuukke",
    locale: "en_IN",
    title: OG_TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/diwali/og.jpg",
        width: 2163,
        height: 727,
        alt: "Yuukke Diwali 2026 – handcrafted gifts and hampers by women makers",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
    images: ["/diwali/og.jpg"],
  },
};

export default function DiwaliSalePage() {
  return (
    <main
      className={`${sans.className} overflow-x-hidden bg-[#fbf6ef] text-[#1c1620]`}
    >
      <HeroSection />
      <IntroSection />
      <FestiveDecor />
      <GiftingBanner />
      <DiwaliEdit />
      <ShopByMoment />
      <DifferenceStrip />
    </main>
  );
}
