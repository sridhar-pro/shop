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

export default function ForgetPasswordScreen({
  setCurrentFlow,
  email,
  setEmail,
  handleForgetSendMail,
  loading,
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
          Enter your register Email account
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
              htmlFor="email"
              className="text-sm font-medium text-gray-100"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 rounded-xl  placeholder:text-white mt-3"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleForgetSendMail}
              disabled={loading}
              className={`w-full h-12 !font-extrabold uppercase !rounded-full shadow-lg border-0
                ${
                  loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-white hover:bg-gray-950 text-black hover:text-white"
                }
              `}
            >
              {loading ? (
                "Sending Mail..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Mail
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
