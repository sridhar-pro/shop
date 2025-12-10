"use client";

import { Package } from "lucide-react";

export default function ShippingSection() {
  return (
    <section className="w-full flex justify-center py-16 px-4 bg-white font-odop">
      <div className="w-full max-w-5xl border border-gray-300 rounded-sm shadow-sm">
        {/* Header */}
        <div className="bg-[#00194A] text-white px-6 py-4 flex items-center gap-3">
          <Package size={20} />
          <h2 className="text-xl font-semibold tracking-wide">Shipping</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-gray-700 leading-relaxed tracking-wide text-[15px]">
          <p className="font-semibold mb-6">
            Please carefully read our shipping policy to understand more about
            the shipping procedure.
          </p>

          <p className="mb-6">
            Shipping costs will vary depending on your chosen method and your
            delivery address. The exact shipping cost will be displayed at
            checkout before you complete your order.
          </p>

          <p className="mb-6">
            Once your order is ready to ship, you will receive a confirmation
            email with tracking information. The estimated delivery time will
            depend on the shipping method you select and your location. Please
            note that delivery times are approximate and might be affected by
            factors beyond our control, such as weather conditions and carrier
            delays.
          </p>

          <p className="mb-6">
            For most orders, we provide tracking information so you can monitor
            the progress of your shipment. This allows you to stay informed
            about the estimated delivery date.
          </p>

          <p className="mb-6">
            If you encounter any issues with your order, including
            shipping-related problems such as damaged or lost items, please
            refer to our Return and Refund Policy for detailed instructions on
            how to proceed.
          </p>

          <p className="mb-6">
            By placing an order on Yuukke, you agree to abide by these shipping
            policies. We appreciate your trust in us and look forward to serving
            you with high-quality products and reliable shipping services.
          </p>

          <p className="mb-6">
            If you have any questions, concerns, or need further assistance
            regarding our shipping policies or your order, please don't hesitate
            to reach out to our customer support team at support@yuukke.com, 044
            46314646
          </p>

          <p className="mb-2">
            Thank you for shopping with Yuukke! We're committed to providing you
            with a seamless shopping experience.
          </p>
        </div>
      </div>
    </section>
  );
}
