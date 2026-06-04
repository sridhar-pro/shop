"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductImageGallery({
  product,
  selectedImage,
  setSelectedImage,
  filteredMedia,
  variantImages,
  productImages,
  invalidVideos,
  setInvalidVideos,
  DOMAIN_KEY,
}) {
  const imageRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  const imagesToShow = variantImages.length > 0 ? variantImages : productImages;

  if (imagesToShow.length === 0) return null;

  return (
    <>
      {/* Desktop Thumbnails */}
      <div className="hidden lg:block w-20 flex-shrink-0 ml-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2 sr-only">
          Thumbnails
        </h2>
        <div className="flex flex-col gap-3 h-[calc(100vh-160px)] overflow-y-auto py-2 scrollbar-hide">
          {filteredMedia.map((img, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedImage(img)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                selectedImage === img
                  ? "border-[#A00300]"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              {img.endsWith(".mp4") ? (
                <div className="relative w-full h-full">
                  <video
                    src={img}
                    className="w-full h-full object-cover"
                    onError={() => setInvalidVideos((prev) => [...prev, img])}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      ▶
                    </div>
                  </div>
                </div>
              ) : (
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  title={`${product.name} Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full lg:flex-1 flex flex-col px-4 lg:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage || "default"}
            className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onMouseMove={handleMouseMove}
          >
            {(selectedImage || filteredMedia[0])?.endsWith(".mp4") ? (
              <video
                src={selectedImage || filteredMedia[0]}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                ref={imageRef}
                src={
                  selectedImage ||
                  filteredMedia[0] ||
                  (variantImages.length > 0
                    ? variantImages[0]
                    : productImages.length > 0
                      ? productImages[0]
                      : product.image)
                }
                alt={product?.name}
                title={product?.name}
                fill
                style={zoomStyle}
                className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-150"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Horizontal Thumbnails */}
        {imagesToShow.length > 0 && (
          <div className="mt-4 lg:hidden">
            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
              {filteredMedia.map((img, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  whileHover={{ scale: 1.05 }}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-[#A00300]"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {img.endsWith(".mp4") ? (
                    <div className="relative w-full h-full">
                      <video
                        src={img}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setInvalidVideos((prev) => [...prev, img])
                        }
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                          ▶
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      title={`${product.name} Thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
