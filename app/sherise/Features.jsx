"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Users,
  Lightbulb,
  TrendingUp,
  HeartHandshake,
  Sparkles,
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

const zoomFade = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
};

const iconMap = {
  purpose: <ShoppingBag className="w-5 h-5" />,
  ecosystem: <Users className="w-5 h-5" />,
  belief: <Lightbulb className="w-5 h-5" />,
  growth: <TrendingUp className="w-5 h-5" />,
  impact: <HeartHandshake className="w-5 h-5" />,
  movement: <Sparkles className="w-5 h-5" />,
};

const FeatureItem = ({ title, description, icon }) => {
  return (
    <motion.div variants={fadeUp} className="flex flex-col space-y-4">
      {/* Icon + Title Row */}
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-md bg-[#A00300]/10 text-[#A00300] flex">
          {iconMap[icon]}
        </span>

        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {title}
        </h3>
      </div>

      {/* Description Points */}
      <ul className="space-y-3 text-sm text-gray-600 leading-relaxed pl-1">
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

const leftFeatures = [
  {
    title: "Engage. Reflect. Lead.",
    description: [
      "A shared platform to reflect on women’s role in commerce.",
      "A collective commitment to building what’s next.",
    ],
    icon: "purpose",
  },
  {
    title: "Curated Conversations That Matter",
    description: [
      "Inaugural addresses and opening reflections.",
      "Panel discussions shaping inclusive SME growth.",
    ],
    icon: "ecosystem",
  },
];

const rightFeatures = [
  {
    title: "Building Ecosystems Where Women Thrive",
    description: [
      "Strengthening access to infrastructure and networks.",
      "Creating long-term business growth pathways.",
    ],
    icon: "impact",
  },
  {
    title: "Beyond Celebration — Real Action",
    description: [
      "Women’s Day transformed into structured impact.",
      "Commerce as a pathway for economic participation.",
    ],
    icon: "movement",
  },
];

const Features = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-10 bg-gradient-to-br from-rose-50 via-white to-slate-50"
    >
      <div className="max-w-[85rem] mx-auto px-5 sm:px-10 md:px-12 lg:px-5">
        <div className="flex flex-col space-y-16">
          {/* Heading */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-center text-center mx-auto md:max-w-3xl space-y-5"
          >
            <span className="rounded-full bg-[#A00300]/10 px-4 py-1.5 text-xs w-max mx-auto font-semibold tracking-widest text-[#A00300] uppercase">
              SHErise Week Impact
            </span>

            <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl xl:text-5xl leading-tight">
              Commerce That Creates
              <span className="block bg-gradient-to-r from-[#A00300] to-[#000940] bg-clip-text text-transparent">
                Economic Empowerment
              </span>
            </h1>

            <p className="text-gray-600 max-w-xl mx-auto">
              25% of proceeds directly fund women entrepreneurs’ growth,
              mentorship, and skill development — turning shopping into real
              impact.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
            {/* Left Features */}
            <motion.div
              variants={fadeLeft}
              className="grid gap-10 sm:grid-cols-2 md:grid-cols-1"
            >
              {leftFeatures.map((item, i) => (
                <FeatureItem key={i} {...item} />
              ))}
            </motion.div>

            {/* Center Image */}
            <motion.div
              variants={zoomFade}
              className="flex items-center justify-center md:col-span-2 lg:h-full"
            >
              <div
                className="flex-1 relative bg-gradient-to-tr 
                           from-[#A00300]/10 to-[#000940]/20 
                           p-6 rounded-2xl aspect-[4/2.4] overflow-hidden shadow-xl"
              >
                <Image
                  src="/feature.jpeg"
                  alt="SHErise Impact"
                  height={1100}
                  width={1800}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Right Features */}
            <motion.div
              variants={fadeRight}
              className="grid gap-10 sm:grid-cols-2 md:grid-cols-1"
            >
              {rightFeatures.map((item, i) => (
                <FeatureItem key={i} {...item} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Features;
