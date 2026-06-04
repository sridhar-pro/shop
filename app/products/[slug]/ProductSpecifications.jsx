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
    <div className="mb-8">
      <h2 className="text-sm font-medium text-gray-500 uppercase pb-2 border-b border-gray-200 italic">
        {t("Specifications")}
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-4">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <tbody>
            {validSpecs.map((spec, idx) => (
              <tr
                key={idx}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-b last:border-none`}
              >
                <th className="px-4 py-3 font-medium text-gray-900 w-1/3 capitalize">
                  {t(spec.name)}
                </th>
                <td className="px-4 py-3 border-l border-gray-200">
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
