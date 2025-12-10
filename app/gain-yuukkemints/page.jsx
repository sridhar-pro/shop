"use client";

import Image from "next/image";
import { Heart, UserPlus, MessageSquarePlus, Share2 } from "lucide-react";

export default function ShoppingExperience() {
  return (
    <section className="w-full bg-gradient-to-b from-[#94002E] via-[#6A0030] to-[#2B004A] py-20 px-6 flex justify-center font-odop">
      <div className="w-full max-w-7xl bg-white rounded-lg p-10 shadow-sm">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <Heart
              size={42}
              className="mb-4"
              stroke="black" // outline
              fill="#a00300" // inside color
              strokeWidth={1.5} // adjust outline thickness (optional)
            />
            <h2 className="text-3xl font-semibold text-[#1E1E1E] mb-2 tracking-wide">
              Share your shopping experience
            </h2>

            <p className="text-gray-600 text-[15px] leading-relaxed tracking-wide max-w-lg">
              Shared joy is doubled joy. After receiving the products, you can
              write your own product review. Spread your happiness and get
              YuukkeMints
            </p>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <Image
              src="/shoping_experience_1.png"
              alt="Shopping Experience Illustration"
              width={420}
              height={420}
              className="object-contain"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-12"></div>

        {/* Bottom Section */}
        <h3 className="flex items-center gap-2 text-xl font-semibold text-[#1E1E1E] mb-8 tracking-wide">
          <span className="w-1.5 h-6 bg-[#CF002E] inline-block rounded-sm"></span>
          Get discounts for your purchase
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left card */}
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm flex gap-5">
            <Image
              src="/shoping_experience_1.png"
              alt="Points Illustration"
              width={80}
              height={80}
              className="object-contain"
            />

            <div>
              <h4 className="text-lg font-semibold text-[#1E1E1E] tracking-wide mb-2">
                Convert points to credits
              </h4>

              <p className="text-gray-600 text-[14px] leading-relaxed tracking-wide">
                With every purchase, we're all crafting a world where respect
                and empowerment are the norms. YuukkeMints can be converted into
                credits, which you can use to offset the cost on your next
                shopping!
              </p>
            </div>
          </div>

          {/* Right card */}
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#1E1E1E] mb-5 tracking-wide">
              How to gain YuukkeMints
            </h4>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-700 tracking-wide">
                <UserPlus size={20} className="text-[#CF0030]" />
                <span>Create account</span>
              </li>

              <li className="flex items-center gap-3 text-gray-700 tracking-wide">
                <MessageSquarePlus size={20} className="text-[#CF0030]" />
                <span>Create a review post</span>
              </li>

              <li className="flex items-center gap-3 text-gray-700 tracking-wide">
                <Share2 size={20} className="text-[#CF0030]" />
                <span>Share your post and get likes from others</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
