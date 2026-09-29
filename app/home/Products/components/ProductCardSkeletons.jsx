"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductCardSkeletons({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg p-4 shadow-sm bg-white animate-pulse"
        >
          <Skeleton height={180} />
          <Skeleton height={20} style={{ marginTop: "1rem" }} />
          <Skeleton height={20} width={"80%"} />
          <Skeleton height={30} width={"60%"} style={{ marginTop: "1rem" }} />
        </div>
      ))}
    </div>
  );
}
