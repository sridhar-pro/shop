"use client";

export default function ProductPersonalisedText({
  personalisedText,
  setPersonalisedText,
  isMobile = false,
}) {
  if (isMobile) {
    return (
      <div className="flex lg:hidden flex-col gap-3 font-odop mt-4 px-4">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Personalised Text :
        </label>
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            maxLength={30}
            placeholder="Enter text to print"
            value={personalisedText || ""}
            onChange={(e) => setPersonalisedText(e.target.value)}
            className={`w-full px-4 py-3 border rounded-md
              text-sm font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#A00300]/40
              transition-all
              ${
                !personalisedText
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-[#A00300]"
              }`}
          />
          {!personalisedText && (
            <p className="text-xs text-red-600 font-medium">
              Please enter a personalised message to add this item to cart
            </p>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Example:<span className="italic"> "Home Sweet Home"</span>
            </span>
            <span
              className={`font-medium ${
                (personalisedText?.length || 0) > 25
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {personalisedText?.length || 0}/30
            </span>
          </div>
          {personalisedText && (
            <div className="mt-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
              <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">
                Preview
              </p>
              <p className="text-sm font-semibold text-gray-900 break-words">
                "{personalisedText}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-start gap-4 font-odop mt-4">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-1">
        Personalised Text :
      </label>
      <div className="flex flex-col gap-2 w-full max-w-md">
        <input
          type="text"
          maxLength={30}
          placeholder="Enter text to print"
          value={personalisedText || ""}
          onChange={(e) => setPersonalisedText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md
            text-sm font-medium text-gray-800
            focus:outline-none focus:ring-2 focus:ring-[#A00300]/40 focus:border-[#A00300]
            placeholder:text-gray-400 transition-all"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Example:<span className="italic"> "Home Sweet Home"</span>
          </span>
          <span
            className={`font-medium ${
              (personalisedText?.length || 0) > 25
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {personalisedText?.length || 0}/30
          </span>
        </div>
        {personalisedText && (
          <div className="mt-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
            <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">
              Preview
            </p>
            <p className="text-sm font-semibold text-gray-900 break-words">
              "{personalisedText}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
