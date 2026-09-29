"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("🚫 Skipping Microsoft Clarity in development");
      return;
    }

    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!projectId) {
      console.warn("Microsoft Clarity Project ID is missing");
      return;
    }

    Clarity.init(projectId);
  }, []);

  return null;
}
