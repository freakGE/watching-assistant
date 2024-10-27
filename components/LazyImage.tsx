import dynamic from "next/dynamic";
import Image, { ImageProps } from "next/image";
import { memo, useState } from "react";

const Spinner = dynamic(() => import("./Spinner"));

type LazyImageProps = {
  src: string;
  alt: string;
  children?: string;
  spinner?: boolean;
  spinnerSize?: number;
  navbar?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  onImageLoad?: () => void;
} & ImageProps;

const LazyImage = ({
  src,
  alt,
  children,
  spinner = true,
  spinnerSize = 3,
  navbar,
  priority = false,
  quality = 25,
  unoptimized = true,
  onImageLoad,
  ...rest
}: LazyImageProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center text-dark-100">
      {isLoading && spinner && (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner
            className="absolute animate-spin"
            style={{
              width: spinnerSize + "rem",
            }}
          />
        </div>
      )}
      {isLoading && children}
      <Image
        src={src}
        alt={alt || "Loading..."}
        quality={quality}
        width={500}
        height={500}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        unoptimized={unoptimized}
        onLoad={() => {
          setIsLoading(false);
          onImageLoad && onImageLoad();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          onImageLoad && onImageLoad();
        }}
        className="flex justify-center items-center bg-red-200"
        {...rest}
      />
           {hasError && (
        <div className="absolute z-[1] flex h-full w-full items-center justify-center bg-dark-150">
          <p className="text-dark-100 text-sm font-semibold">Failed to load image.</p>
        </div>
      )}
    </div>
  );
};

export default memo(LazyImage);
