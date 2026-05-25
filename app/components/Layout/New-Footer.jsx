import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Linkedin } from "lucide-react";

const FooterItem = ({ text, link, title }) => {
  return (
    <li>
      <Link
        href={link}
        title={title}
        className="duration-200 hover:text-[#A00300] "
      >
        {text}
      </Link>
    </li>
  );
};

const FooterBlockItem = ({ title, items }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <FooterItem key={item.id} {...item} />
        ))}
      </ul>
    </div>
  );
};

const footerBlocks = [
  {
    id: 1,
    title: "Shop",
    items: [
      {
        id: 1,
        text: "All Products",
        link: "/products",
        title: "Browse All Products",
      },
      {
        id: 2,
        text: "Offers",
        link: "/offers",
        title: "View Latest Offers",
      },
      {
        id: 3,
        text: "Personalized Gifts",
        link: "/festival-gifting",
        title: "Shop Personalized Gifts",
      },
      {
        id: 4,
        text: "Corporate Gifts",
        link: "https://gift.yuukke.com/#featured-products",
        title: "Explore Corporate Gifts",
      },
    ],
  },
  {
    id: 2,
    title: "Company",
    items: [
      {
        id: 1,
        text: "About Us",
        link: "https://yuukke.com/about/",
        title: "Learn About Yuukke",
      },
      {
        id: 2,
        text: "Global-ambassadors",
        link: "https://yuukke.com/global-ambassadors/",
        title: "Meet Yuukke Global Ambassadors",
      },
      {
        id: 3,
        text: "Contact",
        link: "https://yuukke.com/contact-us/",
        title: "Contact Yuukke",
      },
      {
        id: 4,
        text: "Service-Provider",
        link: "https://connect.yuukke.com/yuukke-service",
        title: "Yuukke Service Providers",
      },
    ],
  },
  {
    id: 3,
    title: "Quick Links",
    items: [
      {
        id: 1,
        text: "Track Order",
        link: "/track-order",
        title: "Track Your Order",
      },
      {
        id: 2,
        text: "ODOP Registration",
        link: "/odop-registration",
        title: "ODOP Registration",
      },
      {
        id: 3,
        text: "Seller Registration",
        link: "/seller-registration",
        title: "Register as a Seller",
      },
      {
        id: 4,
        text: "Empowering Community",
        link: "/empowering-community",
        title: "Empowering Community Initiative",
      },
    ],
  },
  {
    id: 4,
    title: "Resources",
    items: [
      {
        id: 1,
        text: "Blog",
        link: "/blog",
        title: "Read Yuukke Blog",
      },
      {
        id: 2,
        text: "Privacy",
        link: "https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf",
        title: "Yuukke Privacy Policy",
      },
      {
        id: 3,
        text: "Terms",
        link: "https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/yuukke_tnc.pdf",
        title: "Yuukke Terms and Conditions",
      },
      {
        id: 4,
        text: "How To Gain YuukkeMints",
        link: "/gain-yuukkemints",
        title: "Learn How To Gain YuukkeMints",
      },
    ],
  },
];

const FooterBlock = () => {
  return (
    <footer className="bg-gradient-to-br from-red-50 to-gray-50 text-gray-700 font-odop border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* ===== Top Section ===== */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Block */}
          <div className="lg:w-1/3 space-y-6">
            <Link href="/" title="Yuukke Home" className="inline-block">
              <Image
                src="/new-logo.png"
                alt="Yuukke Eco-Friendly Marketplace Logo"
                title="Yuukke Eco-Friendly Marketplace Logo"
                width={150}
                height={50}
                className="object-contain"
                priority
              />
            </Link>

            <p className="text-sm text-gray-800 leading-relaxed">
              A curated marketplace that gives members access to buying and
              selling specialised products in their field of interest.
              Entrepreneurs are encouraged to seize this opportunity and trade
              on the platform to reach a global audience.
            </p>

            {/* Social Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              {/* Text */}
              <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Follow us on
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-4">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/yuukkeglobal/"
                  title="Yuukke on Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gradient-to-tr hover:from-pink-500 hover:to-yellow-500 hover:text-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <Instagram size={18} strokeWidth={1.8} />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/yuukkeglobal/posts/?feedView=all"
                  title="Yuukke on LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-[#0A66C2] hover:text-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <Linkedin size={18} strokeWidth={1.8} />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Blocks */}
          <nav className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerBlocks.map((footerBlock) => (
              <FooterBlockItem key={footerBlock.id} {...footerBlock} />
            ))}
          </nav>
        </div>

        {/* ===== Divider ===== */}
        <div className="border-t border-gray-200 my-6" />

        {/* ===== Newsletter Section ===== */}
        {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Join our newsletter
            </h2>
            <p className="text-sm text-gray-600">
              Get updates on exclusive drops, empowering stories, and special
              sale announcements.
            </p>
          </div>

          <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="johndoe@gmail.com"
              className="px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A00300] flex-1"
            />
            <button className="px-6 py-2.5 bg-[#A00300] text-white rounded-md hover:bg-[#7d0200] transition-colors duration-300">
              Subscribe
            </button>
          </form>
        </div> */}

        {/* ===== Bottom Bar ===== */}
        <div className="mt-0 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Yuukke Global Ventures Private Limited.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterBlock;
