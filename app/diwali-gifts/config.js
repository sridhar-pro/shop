// ---------------------------------------------------------------
// Put your Diwali photos in  /public/diwali/  using these names.
// If a file is missing, the gradient fallback is shown instead,
// so the page never looks broken.
// ---------------------------------------------------------------
export const IMAGES = {
  hero: "/diwali/hero.jpg",
  intro: "/diwali/intro.jpg",
  banner: "/diwali/banner.jpg",
  strip: "/diwali/strip.jpg",
  family: "/diwali/family.jpg",
  friends: "/diwali/friends.jpg",
  home: "/diwali/home.jpg",
  corporate: "/diwali/corporate.jpg",
};

// Layered background: real image on top, gradient underneath as fallback
export const bg = (img, fallback) => ({
  backgroundImage: `url('${img}'), ${fallback}`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

export const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
