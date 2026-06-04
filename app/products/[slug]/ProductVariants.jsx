"use client";

export default function ProductVariants({
  product,
  selectedVariants,
  setSelectedVariants,
  selectedModel,
  setSelectedModel,
  selectedOption,
  setSelectedOption,
  customModelText,
  setCustomModelText,
  isOthersSelected,
  handleModelChange,
  isMobile = false,
}) {
  const hasColorVariant = product.variants.some((v) => v.type === "color");
  const labelText = hasColorVariant ? "Colours" : "Options";

  const wrapClass = isMobile
    ? "flex md:hidden items-start gap-4 font-odop p-4"
    : "hidden lg:flex items-start gap-4 font-odop";

  const dropdownWrapClass = isMobile
    ? "flex flex-col gap-1 mt-4 px-4"
    : "flex flex-col gap-1 mt-4";

  const inputWrapClass = isMobile
    ? "flex flex-col gap-1 mt-4 px-4"
    : "flex flex-col gap-1";

  const selectWrapClass = isMobile
    ? "flex flex-col gap-1 px-4 mt-4"
    : "flex flex-col gap-1";

  return (
    <>
      {/* Variant Colour/Option Selector */}
      {product.variants.length > 0 && (
        <div className={wrapClass}>
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-1">
            {labelText}:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {product.variants.map((variant) => {
              const isSelected =
                selectedVariants?.[product.id]?.id === variant.id ||
                (!selectedVariants?.[product.id] &&
                  variant.id === product.variants[0]?.id);

              const handleSelect = () =>
                setSelectedVariants((prev) => ({
                  ...prev,
                  [product.id]: variant,
                }));

              if (variant.type === "color") {
                return (
                  <button
                    key={variant.id}
                    onClick={handleSelect}
                    className={`relative w-7 h-7 rounded-full border transition-all duration-200 ${
                      isSelected
                        ? "border-[#A00300] ring-2 ring-[#A00300]/30 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: variant.color || "#ccc" }}
                  />
                );
              }

              return (
                <button
                  key={variant.id}
                  onClick={handleSelect}
                  title={variant.name}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-md uppercase
                    truncate text-center transition-all duration-200 ${
                      isSelected
                        ? "bg-[#A00300] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Dropdown */}
      {Array.isArray(product?.variant_dropdown) &&
        product.variant_dropdown.length > 0 && (
          <div className={dropdownWrapClass}>
            <label className="text-sm font-semibold text-gray-700 uppercase">
              Select Model:
            </label>
            <select
              value={selectedModel?.id || ""}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Choose a model</option>
              {product.variant_dropdown.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}

      {/* Options / Custom Input */}
      {selectedModel && (
        <>
          {isOthersSelected ? (
            <div className={inputWrapClass}>
              <label className="text-sm font-semibold text-gray-700 uppercase">
                Enter Model:
              </label>
              <input
                type="text"
                value={customModelText}
                onChange={(e) => setCustomModelText(e.target.value)}
                placeholder="Type your model"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          ) : (
            selectedModel?.options?.length > 0 && (
              <div className={selectWrapClass}>
                <label className="text-sm font-semibold text-gray-700 uppercase">
                  Select Option:
                </label>
                <select
                  value={selectedOption?.id || ""}
                  onChange={(e) => {
                    const opt = selectedModel.options.find(
                      (o) => o.id === e.target.value,
                    );
                    setSelectedOption(opt);
                  }}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Choose an option</option>
                  {selectedModel.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
        </>
      )}
    </>
  );
}
