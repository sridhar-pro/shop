import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Card, CardContent, CardHeader } from "../components/Card";
import { ArrowLeft, Send } from "lucide-react";
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

export default function MobileScreen({
  setCurrentFlow,
  mobileNumber,
  setMobileNumber,
  handleSendOTP,
  loading,
  mobileError,
}) {
  return (
    <motion.div
      key="mobile"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-md !font-extrabold text-gray-200 mt-10">
          Enter your register mobile number
        </p>
      </div>

      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm !font-extrabold text-white"
            >
              Mobile Number *
            </Label>
            <div className="relative mt-3">
              <Input
                id="mobile"
                type="tel"
                maxLength={10}
                placeholder="+91 (000) 000-0000"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleSendOTP();
                  }
                }}
                className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl  placeholder-white text-white"
              />
              {mobileError && (
                <div className="mt-3 text-sm">
                  <p className="text-red-400 font-semibold">
                    The mobile number {mobileNumber} is not registered.
                  </p>

                  <button
                    onClick={() => setCurrentFlow("register")}
                    className="text-blue-300 hover:text-blue-200 underline mt-1"
                  >
                    Register this number to continue →
                  </button>
                </div>
              )}
            </div>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className={`w-full h-12 !font-extrabold uppercase !rounded-full shadow-lg border-0
                ${
                  loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-white hover:bg-gray-950 hover:text-white text-black"
                }
              `}
            >
              {loading ? (
                "Sending OTP..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
