"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, Mic, Users, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const bulletFade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const agendaItems = [
  {
    time: "05:00 PM",
    title: "Welcome & Networking",
    description:
      "An evening begins with welcome drinks and meaningful conversations — a space to connect, reflect, and build new bridges within the ecosystem.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    time: "06:00 PM",
    title: "Inaugural & Opening Note",
    points: [
      "Lamp Lighting & Opening Welcome",
      "Chief Guest Address",
      "Felicitations of Guests of Honour",
      "Guest of Honour Addresses",
    ],
    description:
      "Marking the beginning of an evening dedicated to women shaping economies ",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    time: "06:30 PM",
    title: "Official Launch of Yuukke SHErise Week",
    description: "A special unveiling of our Women’s Day initiative",
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    time: "07:00 PM – 07:45 PM",
    title: "Curated Panel Conversation",
    description:
      "A candid discussion with leaders across industry, institutions, and enterprise on building an inclusive SME economy.",
    icon: <Mic className="w-5 h-5" />,
  },
  // {
  //   time: "07:45 PM – 08:15 PM",
  //   title: "Exclusive Fireside Chat",
  //   description:
  //     "A deeper conversation on strengthening infrastructure, access, and long-term growth for women-led businesses.",
  //   icon: <Users className="w-5 h-5" />,
  // },
  {
    time: "08:00 PM",
    title: "Closing Reflections & Dinner",
    description:
      "Bringing the evening together with a collective call to action.",
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const AgendaSection = () => {
  return (
    <section className="py-10 bg-white relative">
      {/* Soft background glow (very subtle) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#A00300]/5 via-transparent to-[#000940]/5 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#A00300]/10 text-[#A00300] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full">
            Event Agenda
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mt-5">
            Yuukke SHErise 2026
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            26th February 2026 • 5PM Onwards • Hotel Savera, Chennai
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-8">
          {agendaItems.map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-100"
            >
              {/* Time */}
              <div className="md:w-1/4">
                <div className="flex items-center gap-3 text-[#A00300] font-bold text-lg md:text-lg">
                  <Clock className="w-5 h-5" />
                  {item.time}
                </div>
              </div>

              {/* Content */}
              <div className="md:w-3/4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#A00300]">{item.icon}</span>
                  <h3 className="font-semibold text-gray-900 text-xl leading-snug">
                    {item.title}
                  </h3>
                </div>

                {item.points && (
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-2 text-base text-gray-700 ml-6 list-disc"
                  >
                    {item.points.map((point, i) => (
                      <motion.li key={i} variants={bulletFade}>
                        {point}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}

                {item.description && (
                  <p className="text-base text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgendaSection;
