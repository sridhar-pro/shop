"use client";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

// ─── Premium Delete Confirmation Modal ─────────────────────────────────────
export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        <div className="px-8 pt-8 pb-7 text-center">
          {/* Icon ring */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>

          <h3 className="text-[17px] font-bold text-gray-900 mb-1.5">
            Remove this address?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">
            This address will be permanently deleted and can't be recovered.
          </p>

          <div className="mt-7 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Keep it
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white shadow-sm shadow-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
