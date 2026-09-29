"use client";

import { Download, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const InvoiceDownload = ({ order }) => {
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";
  const BASE_URL = `https://marketplace.${DOMAIN_KEY}.com/shop/invoice`;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 192,
  });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const warehouseList = order?.warehouse_details || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const dropdownWidth = 192;
    const spacing = 8;

    let left = rect.right - dropdownWidth;

    if (left < 8) {
      left = 8;
    }

    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }

    setPosition({
      top: rect.bottom + spacing,
      left,
      width: dropdownWidth,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * IMPORTANT:
   * This is intentionally the exact same mechanism
   * as the old working component.
   */
  const downloadInvoice = (packageId) => {
    if (!order?.id) {
      console.error("Invoice: order.id is missing", order);
      return;
    }

    if (!packageId) {
      console.error("Invoice: packageId is missing", {
        orderId: order.id,
        warehouseList,
      });
      return;
    }

    const invoiceUrl = `${BASE_URL}/${order.id}/${packageId}`;

    console.log("Opening invoice:", invoiceUrl);

    window.open(invoiceUrl, "_blank", "noopener,noreferrer");

    setOpen(false);
  };

  /**
   * Recalculate dropdown position while open
   */
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  /**
   * Close only when clicking outside BOTH
   * the button and the portal dropdown.
   */
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      const clickedButton = buttonRef.current?.contains(event.target);

      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedButton && !clickedDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  /**
   * SINGLE PACKAGE
   */
  if (warehouseList.length <= 1) {
    const packageId = warehouseList[0]?.product_warehouse_id;

    return (
      <button
        type="button"
        disabled={!packageId}
        onClick={() => downloadInvoice(packageId)}
        className="
          inline-flex
          items-center
          gap-1.5
          text-xs
          md:text-sm
          font-medium
          text-blue-600
          hover:text-blue-800
          transition-colors
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <Download className="h-4 w-4 shrink-0" />
        Download
      </button>
    );
  }

  /**
   * MULTIPLE PACKAGES
   */
  return (
    <>
      {/* Packages Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) {
            handleClose();
          } else {
            handleOpen();
          }
        }}
        className="
          inline-flex
          items-center
          gap-1.5
          text-xs
          md:text-sm
          font-medium
          text-blue-600
          hover:text-blue-800
          transition-colors
        "
      >
        <Download className="h-4 w-4 shrink-0" />
        Packages
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="
              fixed
              z-[9999]
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-2xl
              font-odop
            "
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Download Invoice
              </p>
            </div>

            {/* Packages */}
            <div className="py-1">
              {warehouseList.map((pkg, idx) => {
                const packageId = pkg?.product_warehouse_id;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!packageId}
                    onClick={(event) => {
                      event.stopPropagation();

                      downloadInvoice(packageId);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      px-4
                      py-2.5
                      text-left
                      text-sm
                      text-gray-700
                      transition-colors
                      hover:bg-gray-50
                      hover:text-[#A00300]
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    <span className="whitespace-nowrap">Package {idx + 1}</span>

                    <Download className="h-3.5 w-3.5 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default InvoiceDownload;
