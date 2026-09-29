"use client";
import { useTranslation } from "react-i18next";

export default function ProductSpecifications({ product }) {
  const { t } = useTranslation();

  if (!product?.specifications) return null;

  let specs = [];
  try {
    specs = JSON.parse(product.specifications || "[]");
  } catch (e) {
    console.error("❌ Invalid specifications JSON:", product.specifications);
  }

  const validSpecs = specs.filter(
    (s) => s?.name && s?.value && s.value.trim() !== "",
  );

  if (!validSpecs.length) return null;

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[#A00300] to-[#8B2FA2]" />
        <h2 className="text-base font-semibold text-[#000930] tracking-tight">
          {t("Specifications")}
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {validSpecs.map((spec, idx) => (
              <tr
                key={idx}
                className={`group transition-colors duration-150 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                } ${
                  idx !== validSpecs.length - 1
                    ? "border-b border-gray-100"
                    : ""
                } hover:bg-[#C0276A]/[0.04]`}
              >
                <th className="relative px-5 py-3.5 font-medium text-gray-500 text-left w-1/3 capitalize">
                  <span className="absolute left-0 top-1/2 h-0 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#A00300] to-[#8B2FA2] transition-all duration-200 group-hover:h-1/2" />
                  {t(spec.name)}
                </th>
                <td className="px-5 py-3.5 font-semibold text-[#000930] border-l border-gray-100">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
