import { motion } from "framer-motion";
import { Button } from "../components/Button";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export default function CheckMailScreen({ setCurrentFlow }) {
  return (
    <motion.div
      key="checkmail"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16"
    >
      <div className="mb-6 text-center">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-2xl !font-extrabold text-red-200 mt-8">
          Check your mail and update your password!
        </p>
      </div>

      {/* 🔙 Back to Sign In */}
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex justify-center mt-6"
      >
        <Button
          onClick={() => setCurrentFlow("initial")}
          className="px-8 h-12 bg-white text-black hover:bg-gray-900 hover:text-white 
                   !font-extrabold !rounded-full shadow-lg border-0"
        >
          Back to Sign In
        </Button>
      </motion.div>
    </motion.div>
  );
}
