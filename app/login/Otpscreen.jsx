import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/Card";
import { ArrowLeft } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export default function OTPScreen({
  setCurrentFlow,
  mobileNumber,
  otp,
  setOtp,
  handleVerifyOTP,
  handleReSendOTP,
  verifyLoading,
  resendLoading,
  loading,
}) {
  return (
    <motion.div
      key="otp"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("mobile")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Enter OTP
          </CardTitle>
          <CardDescription className="text-gray-300">
            {"We've sent a 6-digit code to " + mobileNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-200">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !verifyLoading) {
                  e.preventDefault(); // stop browser default behavior
                  handleVerifyOTP();
                }
              }}
              className="h-12 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-xl"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={verifyLoading}
              className={`w-full h-12 rounded-xl shadow-lg border-0
                ${
                  verifyLoading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-white to-gray-50 hover:from-black hover:to-gray-950 text-black hover:text-white"
                }
              `}
            >
              {verifyLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>
          </motion.div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReSendOTP}
              disabled={resendLoading}
              className={`text-orange-50
                ${resendLoading ? "opacity-50 cursor-not-allowed" : "hover:text-orange-100"}
              `}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
