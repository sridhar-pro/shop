"use client";

import { Package2, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function EmpoweringSection() {
  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-20 bg-white font-odop">
      <div className="max-w-7xl mx-auto">
        {/* Left Side Content */}
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-[#B21E35]">
            Empowering
          </h2>
          <h3 className="text-2xl font-semibold mt-2 text-gray-800">
            Shopping Community
          </h3>

          <p className="mt-6 text-gray-600 leading-relaxed max-w-3xl">
            Uncover a world of inspiration, from heartfelt product reviews to
            unbeatable deals. Together, let's make every shopping experience not
            just fun, but truly an act of empowerment. Get the product reviews
            and best offers, and offset your product cost as well!
          </p>

          <Link
            href="/products"
            className="inline-block mt-8 px-8 py-3 bg-gradient-to-r from-[#7A003C] to-[#D1002E] text-white font-semibold tracking-wide shadow-md hover:opacity-90 transition-all"
          >
            BROWSE ALL PRODUCTS
          </Link>
        </div>

        {/* Right Side Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="border border-gray-200 rounded-md p-10 text-center hover:shadow-sm transition">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-[#B21E35] text-white rounded-full mb-6">
              <Package2 size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              Products that are truly worth
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Together, let's make every shopping experience not just fun, but
              truly an act of empowerment. Discover and buy the finest products!
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-gray-200 rounded-md p-10 text-center hover:shadow-sm transition">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-[#B21E35] text-white rounded-full mb-6">
              <Sparkles size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              Be a Change Maker
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your purchase is the POWER. Being a consumer isn't just about
              buying—it's about understanding the power of your choices.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border border-gray-200 rounded-md p-10 text-center hover:shadow-sm transition">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-[#B21E35] text-white rounded-full mb-6">
              <Users size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              Support Women
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              We have selected and curated unique passionately made products.
              You can now buy them at a surprising price with just one click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
