"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import ProductImage from "@/components/products/ProductImage";

interface ProductGalleryProps {
  name: string;
  images: string[];
}

export default function ProductGallery({ name, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const activeImage = images[activeIndex];

  return (
    <div className="min-w-0">
      <div className="group relative aspect-square overflow-hidden rounded-sm bg-[color:var(--surface-soft)] sm:aspect-[1.08/1]">
        <ProductImage src={activeImage} alt={`${name}, image ${activeIndex + 1}`} priority zoomed={zoomed} />
        <button
          type="button"
          aria-label={zoomed ? "Zoom out of product image" : "Zoom in on product image"}
          aria-pressed={zoomed}
          title={zoomed ? "Zoom out" : "Zoom in"}
          onClick={() => setZoomed((value) => !value)}
          className="absolute bottom-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-[color:var(--line)] bg-white/95 text-[color:var(--ink)] shadow-sm transition-colors hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
        </button>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2.5 sm:gap-3" aria-label="Product image thumbnails">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => {
                setActiveIndex(index);
                setZoomed(false);
              }}
              className={`relative aspect-square overflow-hidden rounded-sm bg-[color:var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${activeIndex === index ? "ring-2 ring-[color:var(--ink)] ring-offset-2" : "opacity-70 transition-opacity hover:opacity-100"}`}
            >
              <ProductImage src={image} alt={`${name} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}