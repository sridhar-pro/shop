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

export default function RegisterScreen({
  setCurrentFlow,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  mobile,
  setMobile,
  handleRegister,
  loading,
}) {
  return (
    <motion.div
      key="register"
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
      </div>
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-50">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-300">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-200"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-200"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerEmail"
              className="text-sm font-medium text-gray-200"
            >
              Email Address
            </Label>
            <Input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerMobile"
              className="text-sm font-medium text-gray-200"
            >
              Mobile Number
            </Label>
            <Input
              id="registerMobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              placeholder="+91 000 000-0000"
              className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full h-12 font-extrabold text-sm rounded-xl shadow-lg border-0
                ${
                  loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-white to-gray-50 hover:from-black hover:to-gray-900 text-black hover:text-white"
                }
              `}
            >
              {loading ? "Registering..." : "Register Now"}
            </Button>
          </motion.div>

          <p className="text-center text-sm text-gray-200 mt-12 ">
            {"By creating an account, you agree to our "}
            <a
              href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
              className="underline underline-offset-2 text-sm text-orange-50 hover:text-orange-100"
            >
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
