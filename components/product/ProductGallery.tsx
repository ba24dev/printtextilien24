"use client";

import { copy } from "@/config/copy";
import { useProduct } from "@shopify/hydrogen-react";
import { Dialog } from "radix-ui";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { MouseEvent, useEffect, useState } from "react";

export default function ProductGallery() {
  const { product } = useProduct();
  const images = (product?.images?.nodes ?? []).filter(
    (img): img is { id: string; url: string; altText: string | null } =>
      img != null && typeof img.url === "string",
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = images.length;
  const visible = images.slice(0, 4);
  const overflow = total - visible.length;

  useEffect(() => {
    if (activeIndex === null || total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i === null ? null : (i - 1 + total) % total));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i === null ? null : (i + 1) % total));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, total]);

  if (total === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden site-border-radius bg-surface/40">
        <Image
          src="https://placehold.co/800x800.png?text=Printtextilien24"
          alt={copy.gallery.noImageAvailable}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <>
      <GalleryGrid
        images={visible}
        overflow={overflow}
        onSelect={(i) => setActiveIndex(i)}
        priorityCount={1}
      />

      <Dialog.Root
        open={activeIndex !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              if (e.target === e.currentTarget) setActiveIndex(null);
            }}
          >
            <Dialog.Title className="sr-only">
              {activeIndex !== null
                ? images[activeIndex]?.altText ?? product?.title ?? ""
                : ""}
            </Dialog.Title>

            {activeIndex !== null ? (
              <>
                <div className="relative h-full w-full">
                  <Image
                    src={images[activeIndex].url}
                    alt={
                      images[activeIndex].altText ??
                      product?.title ??
                      copy.gallery.noImageAvailable
                    }
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>

                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((i) =>
                          i === null ? null : (i - 1 + total) % total,
                        )
                      }
                      aria-label={copy.gallery.lightboxPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur transition hover:bg-background md:left-4 md:p-3"
                    >
                      <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((i) =>
                          i === null ? null : (i + 1) % total,
                        )
                      }
                      aria-label={copy.gallery.lightboxNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur transition hover:bg-background md:right-4 md:p-3"
                    >
                      <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                    </button>
                  </>
                ) : null}

                {total > 1 ? (
                  <span
                    role="status"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur"
                  >
                    {copy.gallery.lightboxCounter(activeIndex + 1, total)}
                  </span>
                ) : null}

                <Dialog.Close
                  aria-label={copy.gallery.lightboxClose}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur transition hover:bg-background md:right-4 md:top-4 md:p-3"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                </Dialog.Close>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

interface GalleryGridProps {
  images: GalleryImage[];
  overflow: number;
  onSelect: (index: number) => void;
  priorityCount: number;
}

function GalleryGrid({
  images,
  overflow,
  onSelect,
  priorityCount,
}: GalleryGridProps) {
  if (images.length === 1) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <ThumbButton
          image={images[0]}
          onClick={() => onSelect(0)}
          priority
          aspect="aspect-square"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, i) => (
          <ThumbButton
            key={img.id}
            image={img}
            onClick={() => onSelect(i)}
            priority={i < priorityCount}
            aspect="aspect-3/2"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
      {images.map((img, i) => {
        const aspect =
          i === 0
            ? "lg:row-span-2"
            : i === 3
              ? "lg:col-span-2 aspect-5/2"
              : "aspect-3/2";
        const hideOnMobile = i > 0 ? "max-lg:hidden" : "";

        return (
          <ThumbButton
            key={img.id}
            image={img}
            onClick={() => onSelect(i)}
            priority={i < priorityCount}
            className={`${aspect} ${hideOnMobile}`}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            overflowBadge={i === 3 && overflow > 0 ? overflow : undefined}
          />
        );
      })}
    </div>
  );
}

interface ThumbButtonProps {
  image: GalleryImage;
  onClick: () => void;
  priority?: boolean;
  aspect?: string;
  className?: string;
  sizes?: string;
  overflowBadge?: number;
}

function ThumbButton({
  image,
  onClick,
  priority = false,
  aspect,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  overflowBadge,
}: ThumbButtonProps) {
  const wrapperClasses = [
    "relative overflow-hidden site-border-radius bg-surface/40 cursor-pointer group transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    aspect ?? "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copy.gallery.openFullscreen}
      className={wrapperClasses}
    >
      <Image
        src={image.url}
        alt={image.altText ?? copy.catalog.productFallbackTitle}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-700 ease-out group-hover:scale-105"
      />
      {overflowBadge !== undefined ? (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-black/55 text-3xl font-semibold text-white md:text-5xl"
        >
          {copy.gallery.moreImages(overflowBadge)}
        </span>
      ) : null}
    </button>
  );
}
