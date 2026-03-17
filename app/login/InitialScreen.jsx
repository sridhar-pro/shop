import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import Image from "next/image";

export default function InitialScreen({ setCurrentFlow }) {
  return (
    <div className="min-h-screen flex flex-col pt-40 px-4">
      {/* Logo + Branding */}
      <div className="text-center mb-8">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-md text-gray-200 mt-12 ">
          By tapping Sign in, you agree to our <br />
          <a
            href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
            className="underline underline-offset-2 text-sm text-orange-50 hover:text-orange-100"
          >
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Sign-In Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-6 rounded-3xl">
          <CardContent className="space-y-8">
            {/* Mobile */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentFlow("mobile")}
                className="w-full min-h-[48px] text-white text-sm sm:text-[1rem] !font-extrabold border border-white !rounded-full flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-white hover:text-gray-800 transition-colors duration-300 uppercase whitespace-normal text-left break-words"
              >
                <Image
                  src="/telephone.png"
                  alt="Mobile"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <span className="leading-tight">Sign in with Mobile</span>
              </Button>
            </motion.div>
            {/* Email */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentFlow("email")}
                className="w-full min-h-[48px] text-white text-sm sm:text-[1rem] !font-extrabold border border-gray-300 !rounded-full flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-white hover:text-gray-900 transition-colors duration-300 uppercase whitespace-normal text-left break-words"
              >
                <Image
                  src="/email.png"
                  alt="Email"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <span className="leading-tight">Sign in with Email</span>
              </Button>
            </motion.div>

            {/* Register (inline) */}
            <p className="text-center text-sm text-white mt-10">
              New user?{" "}
              <a
                onClick={() => setCurrentFlow("register")}
                className="cursor-pointer text-orange-50 hover:text-orange-100 font-medium underline ml-1"
              >
                Create New Account
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
