"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Store,
  TrendingUp,
  HeartHandshake,
  Check,
  ArrowRight,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const iconRender = (val) => {
  switch (val) {
    case "initiative":
      return <Sparkles className="w-6 h-6" />;
    case "market":
      return <Store className="w-6 h-6" />;
    case "growth":
      return <TrendingUp className="w-6 h-6" />;
    case "impact":
      return <HeartHandshake className="w-6 h-6" />;
    default:
      return null;
  }
};

const AboutItem = ({ title, description, icon }) => {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      {/* Icon + Title Row */}
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-md flex bg-[#A00300]/10 text-[#A00300]">
          {iconRender(icon)}
        </span>

        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {title}
        </h3>
      </div>

      {/* Points */}
      <ul className="space-y-3 text-sm text-gray-600 leading-relaxed">
        {description.map((point, index) => (
          <li key={index} className="flex items-start gap-3">
            <ArrowRight className="w-4 h-4 text-[#A00300] mt-1 flex-shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const aboutPoints = [
  {
    id: 1,
    title: "SHErise Week – A Structured Annual Movement",
    description: [
      "Yuukke Global’s flagship Women’s Day initiative.",
      "An annual commerce-led movement.",
      "Designed to create measurable impact for women entrepreneurs.",
    ],
    icon: "initiative",
  },
  {
    id: 2,
    title: "Access to Real Markets & Ecosystems",
    description: [
      "Connecting women-led enterprises to real customers.",
      "Access to corporate networks and partnerships.",
      "Scalable market ecosystems through purpose-driven commerce.",
    ],
    icon: "market",
  },
  {
    id: 3,
    title: "25% Reinvested into Women’s Advancement",
    description: [
      "Structured skilling programs.",
      "Mentorship and guided business support.",
      "Infrastructure access and long-term growth pathways.",
    ],
    icon: "growth",
  },
  {
    id: 4,
    title: "Building Economies, Not Just Businesses",
    description: [
      "Women-led growth strengthens families.",
      "Communities evolve through inclusive commerce.",
      "Building sustainable economies for the future.",
    ],
    icon: "impact",
  },
];

const AboutSection = () => {
  const router = useRouter();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-10 bg-gradient-to-br from-slate-50 via-white to-rose-50"
    >
      <div className="max-w-[85rem] mx-auto px-5 sm:px-10 md:px-12 lg:px-5 flex flex-col gap-16">
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center space-y-5"
        >
          <div className="flex justify-center">
            <span className="rounded-full bg-[#A00300]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#A00300] uppercase">
              SHErise Week Initiative
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight ">
            <span className="bg-gradient-to-r from-[#A00300] to-[#000940] bg-clip-text text-transparent">
              Shopping That Creates Impact
            </span>
          </h2>
        </motion.div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-14 lg:items-center">
          {/* Left Content */}
          <motion.div
            variants={fadeLeft}
            className="flex-1 flex flex-col gap-12"
          >
            <div className="grid sm:grid-cols-2 gap-8">
              {aboutPoints.map((point) => (
                <AboutItem key={point.id} {...point} />
              ))}
            </div>
            <motion.button
              onClick={() => router.push("/products")}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(160, 3, 0, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#A00300] to-[#000b50] text-white rounded-xl font-bold text-lg shadow-xl"
            >
              Explore Collections →
            </motion.button>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={fadeRight}
            className="hidden lg:flex justify-end lg:w-1/2 items-center"
          >
            <Image
              src="/Geometric South Asian women in sarees.png"
              width={600}
              height={600}
              alt="Women entrepreneurs collaborating"
              className="w-full h-auto object-cover rounded-2xl shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
