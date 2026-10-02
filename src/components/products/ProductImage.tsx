"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  zoomed?: boolean;
}

export default function ProductImage({ src, alt, className = "", priority = false, zoomed = false }: ProductImageProps) {
  const [failed, setFailed] = useState(!src);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {failed ? (
        <div className="image-placeholder flex h-full w-full flex-col items-center justify-center gap-2 text-[color:var(--muted)]">
          <ImageIcon aria-hidden="true" size={25} strokeWidth={1.4} />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <Image
          src={src!}
          alt={alt}
          fill
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className={`object-cover transition-transform duration-500 ease-out ${zoomed ? "scale-125" : "group-hover:scale-[1.045]"}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}