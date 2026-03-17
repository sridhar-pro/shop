import { useState } from "react";
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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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

export default function EmailScreen({
  setCurrentFlow,
  emailLogin,
  setEmailLogin,
  password,
  setPassword,
  handleMailLogin,
  loading,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    handleMailLogin();
  };

  return (
    <motion.div
      key="email"
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
          <CardTitle className="text-2xl font-bold text-white">
            Sign in with Email
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-6">
              {/* Email */}
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
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-100"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pr-12 border-2 border-gray-200 rounded-xl placeholder:text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white" />
                    ) : (
                      <Eye className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Button
                  type="button"
                  onClick={() => setCurrentFlow("forget")}
                  variant="ghost"
                  className="text-sm text-orange-50 hover:text-orange-100 p-0 underline"
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit */}
              <motion.div
                variants={buttonVariants}
                whileHover={!loading ? "hover" : undefined}
                whileTap={!loading ? "tap" : undefined}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 !font-extrabold !rounded-full shadow-lg border-0
                    ${
                      loading
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-white hover:bg-gray-900 text-black hover:text-white"
                    }
                  `}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
