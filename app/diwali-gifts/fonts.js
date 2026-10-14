import { Playfair_Display, Jost } from "next/font/google";

// Display serif used for all big headings
export const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Clean geometric sans used for body, labels and buttons
export const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
