"use client";
import React from "react";
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  PackageCheck,
  AlertTriangle,
  Truck,
  Package,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  MapPin,
  Calendar,
  Hash,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

const TrackingResult = ({ trackingData, showBackButton = true }) => {
  const singleTrack = trackingData?.tracking_data;
  const multiWarehouse = trackingData?.data?.warehouses;

  const ownShipment = multiWarehouse?.some((wh) => wh?.ownshipment) || false;
  const ownShipmentWarehouses =
    multiWarehouse?.filter((wh) => wh?.ownshipment) || [];

  if (multiWarehouse?.warehouses?.length > 0) {
    const warehouseError =
      Array.isArray(multiWarehouse?.warehouses) &&
      multiWarehouse.warehouses.length > 0
        ? multiWarehouse.warehouses[0]?.tracking_info?.error || null
        : null;
    if (warehouseError) {
      return (
        <div className="flex flex-col items-center py-10 px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-6 text-center max-w-md w-full">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-semibold text-base">
              {warehouseError}
            </p>
          </div>
        </div>
      );
    }
  }

  if (trackingData?.status_code && trackingData.status_code !== 200) {
    return (
      <div className="flex flex-col items-center py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-6 text-center max-w-md w-full">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold text-base">
            {trackingData.message || "An error occurred."}
          </p>
        </div>
      </div>
    );
  }

  if (!singleTrack && !multiWarehouse) {
    return (
      <div className="flex flex-col items-center py-12 px-4 gap-5">
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center max-w-sm w-full">
          <img
            src="/tracking.png"
            alt="Tracking Illustration"
            className="w-28 h-28 object-contain opacity-80 mx-auto mb-5"
          />
          <p className="text-[#a00300] text-lg font-semibold mb-1">
            No Tracking Data Found
          </p>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find any tracking information for the details you
            entered.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#a00300] text-white font-semibold rounded-full shadow hover:bg-[#c20404] transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tracking
          </button>
        </div>
      </div>
    );
  }

  const filterActivities = (activities) => {
    if (!activities) return [];
    const filterLabels = [
      "In Transit",
      "Booked",
      "Picked Up",
      "Not Picked",
      "Pickup Scheduled",
      "Softdata Upload",
      "Pickup Awaited",
      "Mis Route",
      "Reached At Destination",
    ];
    const seen = new Set();
    const filtered = [];

    for (let i = activities.length - 1; i >= 0; i--) {
      const act = activities[i];
      if (filterLabels.includes(act.activity)) {
        if (!seen.has(act.activity)) {
          seen.add(act.activity);
          filtered.push(act);
        }
      } else {
        filtered.push(act);
      }
    }
    return filtered;
  };

  const renderStepTracker = (activities) => {
    let filteredActivities = filterActivities(activities);

    const scrollRef = useRef(null);
    const stepRef = useRef(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const [stepWidth, setStepWidth] = useState(0);
    const [maxIndex, setMaxIndex] = useState(0);

    useEffect(() => {
      if (stepRef.current) {
        setStepWidth(stepRef.current.offsetWidth);
      }
    }, []);

    useEffect(() => {
      if (scrollRef.current && stepWidth > 0) {
        const visibleCount = Math.floor(
          scrollRef.current.clientWidth / stepWidth,
        );
        const maxSteps = filteredActivities.length - visibleCount;
        setMaxIndex(maxSteps > 0 ? maxSteps : 0);
      }
    }, [stepWidth, filteredActivities.length]);

    const handleNext = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.min(prev + 1, maxIndex);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth + 8,
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const handlePrev = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.max(prev - 1, 0);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth,
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const isScrollable = filteredActivities.length > 5;
    const totalSteps = filteredActivities.length;

    const getLastStepIcon = (status) => {
      const s = status.toLowerCase();
      if (s.includes("not delivered"))
        return <Clock className="w-4 h-4 text-yellow-600" />;
      if (s.includes("cancelled") || s.includes("canceled"))
        return <XCircle className="w-4 h-4 text-red-600" />;
      if (s.includes("pickup not done"))
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      if (s.includes("in transit"))
        return <Truck className="w-4 h-4 text-yellow-600" />;
      if (s.includes("picked successfully"))
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      if (s.includes("reached at destination") || s.includes("delivered"))
        return <PackageCheck className="w-4 h-4 text-green-600" />;
      return <Circle className="w-4 h-4 text-gray-400" />;
    };

    const getStatusIcon = (status) => {
      const s = status.toLowerCase();
      let text = "text-gray-500";
      let IconComponent = Circle;

      switch (s) {
        case "pending":
          text = "text-gray-700";
          IconComponent = Clock;
          break;
        case "processing":
          text = "text-white";
          IconComponent = AlertTriangle;
          break;
        case "dispatched":
          text = "text-white";
          IconComponent = Truck;
          break;
        case "delivered":
          text = "text-white";
          IconComponent = PackageCheck;
          break;
        case "cancelled":
        case "canceled":
          text = "text-white";
          IconComponent = XCircle;
          break;
      }

      return <IconComponent className={`w-4 h-4 ${text}`} />;
    };

    const getOwnShipmentClasses = (activity) => {
      const s = activity.toLowerCase();
      if (s === "pending") return "bg-gray-300 border-gray-400";
      if (s === "processing") return "bg-yellow-400 border-yellow-500";
      if (s === "dispatched") return "bg-orange-500 border-orange-600";
      if (s === "delivered") return "bg-green-500 border-green-600";
      if (s === "cancelled" || s === "canceled")
        return "bg-red-500 border-red-600";
      return "bg-gray-200 border-gray-300";
    };

    // ── Mobile vertical timeline ──────────────────────────────────────────────
    const renderMobileTimeline = () => (
      <div className="flex flex-col gap-0 md:hidden">
        {filteredActivities.map((act, i) => {
          const isCompleted = i < totalSteps - 1;
          const isLastStep = i === totalSteps - 1;

          const circleClass = ownShipment
            ? `${getOwnShipmentClasses(act.activity)} text-white`
            : isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white border-gray-300 text-gray-400";

          return (
            <div key={i} className="flex gap-4 relative">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 flex-shrink-0 ${circleClass}`}
                >
                  {ownShipment ? (
                    getStatusIcon(act.activity)
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isLastStep ? (
                    getLastStepIcon(act.activity)
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2rem] mt-1 mb-1 ${isCompleted ? "bg-green-400" : "bg-gray-200"}`}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className={`pb-5 flex-1 ${i === totalSteps - 1 ? "pb-1" : ""}`}
              >
                <p className="text-sm font-semibold text-gray-800 capitalize leading-snug">
                  {act.activity}
                </p>
                {act.date && (
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                      {act.date.split(" ")[0]} &nbsp;
                      {act.date.split(" ")[1]?.split(".")[0]}
                    </span>
                  </div>
                )}
                {act.location && (
                  <div className="flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-400 leading-snug">
                      {act.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );

    // ── Desktop horizontal stepper ────────────────────────────────────────────
    const renderDesktopStepper = () => (
      <div className="relative hidden md:block px-8">
        <div
          ref={scrollRef}
          className="flex overflow-x-hidden"
          style={{ scrollBehavior: "smooth" }}
        >
          {filteredActivities.map((act, i) => {
            const isCompleted = i < totalSteps - 1;
            const isLastStep = i === totalSteps - 1;

            const circleClass = ownShipment
              ? `${getOwnShipmentClasses(act.activity)} text-white`
              : isCompleted
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-gray-300 text-gray-400";

            return (
              <div
                key={i}
                ref={i === 0 ? stepRef : null}
                className={`flex flex-col items-center text-center relative ${isScrollable ? "flex-none w-44" : "flex-1"}`}
              >
                {/* Connector line */}
                {i < totalSteps - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 h-0.5 z-0 ${isCompleted ? "bg-green-400" : "bg-gray-200"}`}
                    style={{
                      width: "100%",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                    }}
                  />
                )}

                {/* Circle icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shadow-sm ${circleClass}`}
                >
                  {ownShipment ? (
                    getStatusIcon(act.activity)
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isLastStep ? (
                    getLastStepIcon(act.activity)
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Text info */}
                <div className="mt-3 px-1">
                  <p className="text-xs font-semibold text-gray-800 capitalize leading-tight">
                    {[
                      "Pickup Scheduled",
                      "Pickup Reassigned",
                      "Softdata Upload",
                    ].includes(act.activity)
                      ? act.activity.split(" ").map((word, idx, arr) => (
                          <React.Fragment key={`${act.activity}-${idx}`}>
                            {word}
                            {idx < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))
                      : act.activity}
                  </p>
                  {act.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {act.date.split(" ")[0]}
                      <br />
                      {act.date.split(" ")[1]?.split(".")[0]}
                    </p>
                  )}
                  {act.location && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                      {act.location.split(",").map((line, idx) => (
                        <span key={idx} className="block">
                          {line.trim()}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isScrollable && scrollIndex < filteredActivities.length - 6 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-4 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20 border border-gray-100"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {isScrollable && scrollIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-4 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20 border border-gray-100"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    );

    return (
      <div className="py-4 capitalize">
        {renderMobileTimeline()}
        {renderDesktopStepper()}
      </div>
    );
  };

  // ── Summary badge helper ───────────────────────────────────────────────────
  const SummaryBadge = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-gray-400">
        <Icon className="w-3 h-3" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-800 leading-snug">
        {value || "—"}
      </p>
    </div>
  );

  const renderCard = (
    awbCode,
    activities,
    status,
    courier,
    destination,
    eta,
    warehouseName,
  ) => (
    <div className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-[#a00300] text-white px-5 py-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            {warehouseName && (
              <p className="text-base font-bold tracking-wide uppercase leading-tight">
                {warehouseName}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3.5 h-3.5 text-red-200" />
              <span className="text-xs font-medium text-red-100 tracking-wide">
                AWB: {awbCode}
              </span>
            </div>
          </div>
          {status && (
            <span className="self-start mt-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 capitalize">
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 px-5 py-4 bg-gray-50 border-b border-gray-100">
        <SummaryBadge icon={CheckCircle} label="Status" value={status} />
        <SummaryBadge icon={Truck} label="Courier" value={courier} />
        <SummaryBadge icon={MapPin} label="Destination" value={destination} />
        <SummaryBadge icon={Clock} label="ETA" value={eta} />
      </div>

      {/* Tracker */}
      <div className="px-5 pb-6 pt-2">{renderStepTracker(activities)}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 md:px-0">
      {/* Page heading */}
      <div className="text-center pt-2 pb-1">
        <div className="inline-flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#a00300]/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#a00300]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#a00300] uppercase">
            Shipment Tracking
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Stay <span className="text-[#a00300] font-semibold">updated</span>{" "}
          with the latest status of your orders
        </p>
      </div>

      {/* Own shipment */}
      {ownShipment ? (
        ownShipmentWarehouses.map((wh, idx) => (
          <div
            key={`own-${idx}`}
            className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100"
          >
            <div className="bg-[#a00300] text-white px-5 py-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="text-base font-bold tracking-wide uppercase">
                    {wh.warehouse_name || "Own Shipment"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Hash className="w-3.5 h-3.5 text-red-200" />
                    <span className="text-xs font-medium text-red-100 tracking-wide">
                      Order ID: {trackingData?.data?.order_id || "-"}
                    </span>
                  </div>
                </div>
                {wh.awb_status && (
                  <span className="self-start mt-0.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 capitalize">
                    {wh.awb_status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 px-5 py-4 bg-gray-50 border-b border-gray-100">
              <SummaryBadge
                icon={Package}
                label="Item Count"
                value={wh.item_count}
              />
              <SummaryBadge
                icon={CheckCircle}
                label="Status"
                value={wh.awb_status}
              />
              <SummaryBadge icon={Hash} label="AWB Code" value={wh.awb_codes} />
              <SummaryBadge
                icon={Truck}
                label="Shipment Type"
                value="Own Shipment"
              />
            </div>

            <div className="px-5 pb-6 pt-2">
              {wh.tracking_info?.length > 0 ? (
                renderStepTracker(
                  [...wh.tracking_info].reverse().map((info) => ({
                    activity: info.current_status || "Unknown Status",
                    date: info.date
                      ? new Date(info.date).toLocaleString()
                      : "No timestamp",
                    location: info.location || "",
                    isOwnShipment: true,
                  })),
                )
              ) : (
                <p className="text-gray-400 italic text-center py-6 text-sm">
                  No tracking updates available
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <>
          {multiWarehouse &&
            multiWarehouse.map((wh, idx) => {
              const tInfo = wh.tracking_info;

              if (typeof tInfo === "string") {
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 text-center"
                  >
                    <h2 className="text-base font-bold text-[#a00300] mb-2 capitalize">
                      {wh.warehouse_name || "Warehouse"}
                    </h2>
                    <p className="text-gray-600 text-sm">{tInfo}</p>
                  </div>
                );
              }

              if (tInfo?.error) {
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center"
                  >
                    <h2 className="text-base font-bold text-red-700 mb-2 capitalize">
                      {wh.warehouse_name || "Warehouse"}
                    </h2>
                    <p className="text-red-600 text-sm font-medium">
                      {tInfo.error}
                    </p>
                  </div>
                );
              }

              return renderCard(
                wh.awb_codes,
                tInfo?.shipment_track_activities || [],
                tInfo?.shipment_track?.[0]?.current_status || "",
                tInfo?.shipment_track?.[0]?.courier_name || "",
                tInfo?.shipment_track?.[0]?.destination || "",
                tInfo?.etd || "",
                wh?.warehouse_name || "",
              );
            })}

          {singleTrack &&
            !singleTrack.error &&
            renderCard(
              singleTrack.shipment_track?.[0]?.awb_code,
              singleTrack.shipment_track_activities,
              singleTrack.shipment_track?.[0]?.current_status,
              singleTrack.shipment_track?.[0]?.courier_name,
              singleTrack.shipment_track?.[0]?.destination,
              singleTrack.etd,
              singleTrack.shipment_track?.[0]?.warehouse_name,
            )}

          {singleTrack?.error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
              <h2 className="text-base font-bold text-red-700 mb-2">
                Tracking Error
              </h2>
              <p className="text-red-600 text-sm font-medium">
                {singleTrack.error}
              </p>
            </div>
          )}
        </>
      )}

      {/* Back button */}
      {showBackButton && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#a00300] text-white font-semibold rounded-full shadow hover:bg-[#c20404] transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tracking
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackingResult;
