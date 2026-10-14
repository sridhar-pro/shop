"use client";

// 🎁 Discount input + Apply button + refresh indicator + coupon error message.
// All state comes from useCouponState (passed in as `coupon`).
export default function DiscountInput({ coupon, handleApply, isRefreshing }) {
  const {
    codeInputRef,
    isApplyingRef,
    code,
    setCode,
    setIsApplied,
    couponMessage,
    isManualCouponApplied,
    setIsManualCouponApplied,
  } = coupon;

  return (
    <>
      <div className="flex gap-2 items-center">
        <input
          ref={codeInputRef}
          type="text"
          placeholder="Discount code"
          value={code}
          autoComplete="off"
          onChange={(e) => {
            const newCode = e.target.value;

            // Only clear message if user actually changed the value meaningfully
            if (newCode !== code) {
              setIsApplied(false);
              setIsManualCouponApplied(false); // reset manual flag on input change
              // couponValue stays: the server discount is still applied
            }

            setCode(newCode);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="input flex-1 bg-white"
        />

        <div className="flex flex-col items-center relative">
          <button
            onClick={handleApply}
            // only disable/show "Applied" when a manual coupon is applied
            disabled={isManualCouponApplied || isApplyingRef.current}
            className={`bg-gray-200 text-sm font-bold px-4 py-2 rounded-md relative z-10 transition-all duration-200 ${
              isManualCouponApplied ? "text-green-600" : "text-gray-600"
            }`}
            title={
              isManualCouponApplied ? "Coupon already applied" : "Apply coupon"
            }
          >
            {isManualCouponApplied ? "Applied" : "Apply"}
          </button>
          {isManualCouponApplied && (
            <span className="mt-1 text-xs text-green-600 font-medium">
              Coupon Applied
            </span>
          )}
        </div>
      </div>

      {/* Inline light refresh indicator (doesn't unmount input) */}
      {isRefreshing && (
        <div className="text-xs text-gray-500 mt-1">Updating…</div>
      )}

      {/* Always show below Apply button */}
      {couponMessage ? (
        <span className="mt-1 text-xs text-red-600 font-medium px-4 text-center flex justify-center">
          {couponMessage}
        </span>
      ) : null}
    </>
  );
}
