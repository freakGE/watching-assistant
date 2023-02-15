import dynamic from "next/dynamic";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

const Spinner = dynamic(() => import("./Spinner"));

type LazyImageProps = {
  src: string;
  alt: string;
  children?: string;
  spinner?: boolean;
  spinnerSize?: number;
  navbar?: boolean;
  onImageLoad?: () => void;
} & ImageProps;

const LazyImage = ({
  src,
  alt,
  children,
  spinner = true,
  spinnerSize = 3,
  navbar,
  onImageLoad,
  ...rest
}: LazyImageProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [placeholder, setPlaceholder] = useState(false);

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
      {placeholder && (
        <div className="absolute z-[1] flex h-full w-full items-center justify-center bg-dark-150 duration-[250ms] hover:scale-105">
          <svg
            stroke="currentColor"
            fill="currentColor"
            style={{
              width: !!navbar
                ? spinnerSize + "rem"
                : spinnerSize * 1.75 + "rem",
            }}
            strokeWidth="0"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"></path>
          </svg>
        </div>
      )}
      {isLoading && children}
      <Image
        src={src}
        alt={alt || "Loading..."}
        quality={isLoading ? 1 : 100}
        width={500}
        height={500}
        loading="lazy"
        style={{ visibility: isLoading ? "hidden" : "visible" }}
        onLoadingComplete={() => {
          setIsLoading(false);
          setPlaceholder(false);
          onImageLoad && onImageLoad();
        }}
        onError={() => {
          setIsLoading(false);
          setPlaceholder(true);
          onImageLoad && onImageLoad();
        }}
        {...rest}
      />
    </div>
  );
};

export default LazyImage;
