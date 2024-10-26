import Image from "next/image";
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import SliderContainer from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";
import {  useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Paragraph = dynamic(() => import("./Paragraph"));
const Spinner = dynamic(() => import("./Spinner"));
const LazyImage = dynamic(() => import("../components/LazyImage"));

import { addToDB, removeFromDB } from "@/lib/changeDB";
import { saveToDatabaseProps } from "@/lib/types";
import { updateMoviesWithVariants } from "@/lib/getMovies";
import { TrendingTypes } from "@/lib/types";
import { movieDetails } from "@/lib/navigate";

type SliderProps = {
  top?: boolean;
  type?: "tv" | "movie" | "person" | "all";
  request?: "similar" | "trending";
  variants?: {[id:number]: string};
  id?: string | number;
};

const fetchSliderData = async ({ type, request, id }: SliderProps) => {
  const safeId = id ? `&id=${id}` : "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/${request}?type=${type}${safeId}`,
    {
      next: {
        revalidate: 60 * 60 * 4,
      },
    }
  );

  const data = await response.json();

  if (data.total_results === 0) {
    const safeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/trending?type=${type || "all"}`,
      {
        next: {
          revalidate: 60 * 60 * 4,
        },
      }
    );
    return await safeResponse.json();
  }

  return data;
};

function convertToReadableDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

const Slider = ({
  top = false,
  type = "all",
  request = "trending",
  id,
}: SliderProps) => {
  const { status, data } = useSession();
  const router = useRouter();
  const queryType =
    router.query.type || (router.query.titleId && router.query.titleId[0]);
  const sliderRef = React.createRef<SliderContainer>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);
  const [movies, setMovies] = useState<TrendingTypes["results"]>([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [animationValue, setAnimationValue] = useState(0);
  const [sliderData, setSliderData] = useState<TrendingTypes | null>(null);
  const prevValues = useRef<{
    type: "tv" | "movie" | "person" | "all" | null, 
    request: "similar" | "trending" | null, 
    id: string | number | null | undefined}>({ type: null, request: null, id: null });

  const sliderSettings = {
      className: "center",
      centerMode: true,
      infinite: true,
      dots: animationValue !== 0,
      centerPadding: "60px",
      slidesToShow: 3,
      speed: 500,
      autoplaySpeed: 3500,
      autoplay: true,
      pauseOnHover: true,
      focusOnSelect: true,
      draggable: true,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            centerPadding: "175px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            centerPadding: "125px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 520,
          settings: {
            centerPadding: "100px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 475,
          settings: {
            centerPadding: "75px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 425,
          settings: {
            centerPadding: "60px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 380,
          settings: {
            centerPadding: "40px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 340,
          settings: {
            centerPadding: "30px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
        {
          breakpoint: 320,
          settings: {
            centerPadding: "25px",
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            swipe: true,
          },
        },
      ],
  };

  const handleClick = async (title: any) => {
    // const resolvedQueryType = typeof queryType === 'string' ? queryType : undefined;
    // movieDetails(title, resolvedQueryType);
    movieDetails(title, queryType, true);
  };

  const handleAdd = (variant: saveToDatabaseProps["variant"], title: any) => {
    addToDB(variant, title, data?.user, setDropdown)
  }
  const handleRemove = (variant: saveToDatabaseProps["variant"], title: any) => {
    removeFromDB(variant, title, data?.user, setDropdown)
  }

  const fetchSlider = async () => {
    const newSliderData = await fetchSliderData({ type, request, id });
    if (JSON.stringify(newSliderData) !== JSON.stringify(sliderData)) setSliderData(newSliderData); 
  };

  useEffect(() => {
    if (
      prevValues.current?.type !== type ||
      prevValues.current?.request !== request ||
      prevValues.current?.id !== id
    ) {
      fetchSlider();

      prevValues.current = { type, request, id };
    }
  }, [type, request, id]);
  
  useEffect(() => {
    const updateMovies = async () => {
      if (sliderData) {
        await updateMoviesWithVariants(sliderData, setMovies);
      }
    };

    updateMovies();
  }, [dropdownId, router.query, status, sliderData]); 

  useEffect(() => {
    const cutLasso = 200;

    const handleMouseLeave = (event: { clientX: number; clientY: number }) => {
      const distance =
        Math.sqrt(
          Math.pow(event.clientX - trackMouse[0], 2) +
            Math.pow(event.clientY - trackMouse[1], 2)
        ) || 0;

      if (distance >= cutLasso) {
        setDropdown(null);
      }
    };

    const handleScroll = () => {
      if (trackScroll && Math.abs(scrollY - trackScroll) > cutLasso)
        setDropdown(null);
    };

    document.addEventListener("mousemove", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousemove", handleMouseLeave);
      window.addEventListener("scroll", handleScroll);
    };
  }, [dropdown, trackMouse, trackScroll]);

  return (
    <div
      className={`h-[26rem] w-screen text-dark-300 relative
      ${top ? `my-[1rem] sm:my-[3.5rem]` : `mb-[3rem]`}
      `}
    >
      <div className="relative h-[26rem] duration-300">
        <Suspense
          fallback={
            <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
          }
        >
          <SliderContainer
            ref={sliderRef}
            {...sliderSettings}
            className="h-full"
          >
            {
            animationValue === 0 && 
            Array.from({ length: 20 }, (_, index) => (
              <div 
                key={index} 
                className="flex h-[26rem] w-full max-w-[80rem] 2xs:w-10/12 items-center bg-dark-200 rounded-lg"
              >
                {/* // Preload start */}
                <div 
                className="flex h-full w-full items-center justify-center relative overflow-hidden bg-dark-200 p-4 shadow-xl shadow-dark-300/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-dark-100/10 before:to-transparent"
                >
                      <div className="flex h-2/3 w-3/4 text-light-100">
                        <div 
                        className="hidden h-full w-[15rem] 2md:flex lg:hidden 2xl:flex bg-dark-150 rounded-md object-cover justify-center items-center">
                          <svg className="w-10 h-10 text-dark-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                              <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                              <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                          </svg>
                        </div>
                        
                        <div className="ml-0 pt-1.5 pl-1.5 flex w-full flex-col 2md:ml-[0.5rem] lg:ml-0 2xl:ml-[0.5rem] justify-between">
                          <div className="w-full">
                            <div className="h-4 bg-dark-150 rounded-full w-2/5 mb-2.5"/>
                            <div className="h-4 bg-dark-150 rounded-full w-2/5 mb-2.5"/>
                            <div className="h-4 bg-dark-150 rounded-full w-1/3 mb-2.5 bg-opacity-50"/>
                            
                            <div className="h-3 bg-dark-150 rounded-full w-full mb-1.5 bg-opacity-75"/>
                            <div className="h-3 bg-dark-150 rounded-full w-11/12 mb-1.5 bg-opacity-80"/>
                            <div className="h-3 bg-dark-150 rounded-full w-[95%] mb-1.5
                            bg-opacity-70"/>
                            <div className="h-3 bg-dark-150 rounded-full w-10/12 mb-1.5 bg-opacity-80"/>
                            <div className="h-3 bg-dark-150 rounded-full w-2/5 mb-2.5 bg-opacity-60"/>
                          </div>

                          <div className="h-10 w-full gap-x-3 flex flex-row justify-start">
                            <div className="h-full bg-dark-150 rounded-md w-full py-2 bg-opacity-90"/>
                            <div className="h-full bg-dark-150 rounded-md w-full py-2 bg-opacity-60"/>
                          </div>
                        </div>
                    
                      </div>
                    </div>
                {/* // Preload end */}
              </div>
            ))}
        
            {movies &&
              movies.map((slide, i) => {
                const priority = (i < 2 || i === movies.length - 1) ? true : false
                const date = slide?.release_date || slide?.first_air_date;
                const release = convertToReadableDate(date);
                return (
                  <div
                    key={slide.id}
                    className="relative flex h-[26rem] w-full max-w-[80rem] 2xs:w-10/12 items-center overflow-hidden bg-dark-300"
                  >
                    <Image
                      priority={priority}
                      quality={10}
                      src={
                        slide.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500` +
                            slide.backdrop_path
                          : `https://image.tmdb.org/t/p/w500` +
                            slide.poster_path
                      }
                      height={0}
                      width={0}
                      alt={
                        slide.title ||
                        slide.original_title ||
                        slide.name ||
                        "Background Poster"
                      }
                      loading={priority ? "eager" : "lazy"}
                      unoptimized={true}
                      className="absolute z-[0] object-cover opacity-80 blur-[2px]"
                      style={{
                        width: "auto",
                        height: "416px"
                      }}
                    />
                    <span className="absolute h-full w-full bg-dark-300 bg-opacity-50" />
                    <div className="absolute z-[1] flex h-full w-full items-center justify-center">
                      <div className="flex h-2/3 w-3/4 text-light-100">
                        <div className="hidden h-full w-[16rem] 2md:block lg:hidden 2xl:block">
                          <button
                            onClick={() => handleClick(slide)}
                            className="relative h-full w-full "
                          >
                            <LazyImage
                              src={
                                slide.poster_path
                                  ? `https://image.tmdb.org/t/p/w500` +
                                    slide.poster_path
                                  : `https://image.tmdb.org/t/p/w500` +
                                    slide.backdrop_path
                              }
                              alt={
                                slide.title ||
                                slide.original_title ||
                                slide.name ||
                                "Poster"
                              }
                              priority={priority}
                              spinner={false}
                              onImageLoad={() => setAnimationValue(1)}
                              className="z-[1] h-full rounded-md object-cover duration-300"
                            />
                          </button>
                        </div>
                        <div className="ml-0 flex w-full flex-col justify-between 2md:ml-[0.5rem] lg:ml-0 2xl:ml-[0.5rem]">
                          <div className="flex w-full justify-between">
                            <h3 className="font-semibold">
                              {slide.title ||
                                slide.original_title ||
                                slide.name}
                            </h3>
                            <span className="flex h-min items-center justify-center ">
                              <svg
                                stroke="currentColor"
                                className="mr-[2px] h-[1rem] w-[1rem] fill-star "
                                strokeWidth="0"
                                viewBox="0 0 1024 1024"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                  display: slide.vote_average
                                    ? "block"
                                    : "none",
                                }}
                              >
                                <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>
                              </svg>
                              {slide.vote_average
                                ? Math.round(slide.vote_average * 10) / 10
                                : `+${Math.round(slide.popularity * 10) / 10}`}
                            </span>
                          </div>
                          <div>{release}</div>
                          <Paragraph className="h-[11.5rem] overflow-hidden text-sm">
                            {slide.overview}
                          </Paragraph>

                          <div className="flex w-full gap-x-3 5xl:text-sm 5xl:font-[500]">
                            <button
                              onClick={() => handleClick(slide)}
                              className="flex w-full items-center justify-center rounded-md bg-highlight-pink py-2 text-light-100 shadow-sm duration-300 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95"
                            >
                              <svg
                                className="w-[1.5rem]"
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M13 7h9v2h-9zM13 15h9v2h-9zM16 11h6v2h-6zM13 12L8 7v4H2v2h6v4z"></path>
                              </svg>
                              <span className="hidden md:inline-block 2md:hidden xl:inline-block 2xl:hidden 5xl:inline-block">
                                Read more
                              </span>
                            </button>
                            <div
                              className="relative flex h-[2.5rem]  w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 shadow-md duration-200 hover:text-highlight-cyan"
                              onClick={e => {
                                setTrackMouse([e.clientX, e.clientY]);
                                setTrackScroll(window.pageYOffset);

                                dropdown === `${slide.id}`
                                  ? setDropdown(null)
                                  : setDropdown(`${slide.id}`);
                              }}
                            >
                              {slide.variant ? (
                                <>
                                  <div className="hidden h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden duration-300 md:flex 2md:hidden xl:flex 2xl:hidden 5xl:flex">
                                    <span
                                      className="flex w-full items-center justify-center duration-300 "
                                      style={{
                                        transform: slide.variant
                                          ? dropdownId === slide.id
                                            ? "translateY(calc(-100%))"
                                            : "translateY(calc(100% - 0.25rem))"
                                          : "translateY(calc(-100%))",
                                      }}
                                    >
                                      {slide.variant}
                                      <svg
                                        className="w-[1.5rem]"
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 512 512"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M128 192l128 128 128-128z"></path>
                                      </svg>
                                    </span>
                                    <span
                                      className=" flex w-full items-center justify-center duration-300"
                                      style={{
                                        transform: slide.variant
                                          ? "translateY(100%)"
                                          : "translateY(calc(-100% + 0.25rem))",
                                      }}
                                    >
                                      <svg
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        width="24"
                                        height="24"
                                        className="duration-200 hover:opacity-90"
                                      >
                                        <line
                                          fill="none"
                                          stroke="currentColor"
                                          strokeMiterlimit={10}
                                          x1="7.23"
                                          y1="14.86"
                                          x2="16.77"
                                          y2="14.86"
                                        ></line>
                                        <line
                                          fill="none"
                                          stroke="currentColor"
                                          strokeMiterlimit={10}
                                          x1="12"
                                          y1="10.09"
                                          x2="12"
                                          y2="19.64"
                                        ></line>
                                        <path
                                          fill="none"
                                          stroke="currentColor"
                                          strokeMiterlimit={10}
                                          d="M12,3.41,10.09,1.5H1.5V20.59A1.9,1.9,0,0,0,3.41,22.5H20.59a1.9,1.9,0,0,0,1.91-1.91V3.41Z"
                                        ></path>
                                        <line
                                          fill="none"
                                          stroke="currentColor"
                                          strokeMiterlimit={10}
                                          x1="1.5"
                                          y1="7.23"
                                          x2="22.5"
                                          y2="7.23"
                                        ></line>
                                      </svg>
                                    </span>
                                  </div>
                                  <svg
                                    id="Layer_1"
                                    data-name="Layer 1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    width="24"
                                    height="24"
                                    className="duration-200 hover:opacity-90 md:hidden 2md:block xl:hidden 2xl:block 5xl:hidden"
                                  >
                                    <line
                                      fill="none"
                                      stroke="currentColor"
                                      strokeMiterlimit={10}
                                      x1="7.23"
                                      y1="14.86"
                                      x2="16.77"
                                      y2="14.86"
                                    ></line>
                                    <line
                                      fill="none"
                                      stroke="currentColor"
                                      strokeMiterlimit={10}
                                      x1="12"
                                      y1="10.09"
                                      x2="12"
                                      y2="19.64"
                                    ></line>
                                    <path
                                      fill="none"
                                      stroke="currentColor"
                                      strokeMiterlimit={10}
                                      d="M12,3.41,10.09,1.5H1.5V20.59A1.9,1.9,0,0,0,3.41,22.5H20.59a1.9,1.9,0,0,0,1.91-1.91V3.41Z"
                                    ></path>
                                    <line
                                      fill="none"
                                      stroke="currentColor"
                                      strokeMiterlimit={10}
                                      x1="1.5"
                                      y1="7.23"
                                      x2="22.5"
                                      y2="7.23"
                                    ></line>
                                  </svg>
                                </>
                              ) : (
                                <svg
                                  id="Layer_1"
                                  data-name="Layer 1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  width="24"
                                  height="24"
                                  className="duration-200 hover:opacity-90"
                                >
                                  <line
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit={10}
                                    x1="7.23"
                                    y1="14.86"
                                    x2="16.77"
                                    y2="14.86"
                                  ></line>
                                  <line
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit={10}
                                    x1="12"
                                    y1="10.09"
                                    x2="12"
                                    y2="19.64"
                                  ></line>
                                  <path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit={10}
                                    d="M12,3.41,10.09,1.5H1.5V20.59A1.9,1.9,0,0,0,3.41,22.5H20.59a1.9,1.9,0,0,0,1.91-1.91V3.41Z"
                                  ></path>
                                  <line
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit={10}
                                    x1="1.5"
                                    y1="7.23"
                                    x2="22.5"
                                    y2="7.23"
                                  ></line>
                                </svg>
                              )}
                              <div
                                ref={dropdownRef}
                                className={`absolute bottom-0 z-[5] w-full overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-sm leading-tight text-light-100 shadow-lg duration-1000 md:text-base 2md:text-sm xl:text-base 2xl:text-xs 3xl:text-sm 5xl:text-sm
                                ${
                                  dropdown === `${slide.id}`
                                    ? "w-[7.5rem] sm:w-[8rem] md:w-full 2md:w-[8rem] xl:w-full 2xl:w-[7.5rem] 3xl:w-[8rem] 5xl:w-full"
                                    : "w-full"
                                }
                                `}
                                style={{
                                  borderWidth:
                                    dropdown === `${slide.id}`
                                      ? "1px 1px 0px 1px"
                                      : "0px",
                                  borderColor:
                                    dropdown === `${slide.id}`
                                      ? "rgb(47 214 181)"
                                      : "transparent",
                                  height:
                                    dropdown === `${slide.id}`
                                      ? dropdownRef?.current?.scrollHeight
                                        ? dropdownRef.current.scrollHeight
                                        : "max-content"
                                      : 0,
                                }}
                              >
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                            ${
                              slide.variant === "Watching"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                                  onClick={e => {
                                    handleAdd("watching", slide);
                                    e.stopPropagation();
                                  }}
                                >
                                  Watching
                                  {slide.variant === "Watching" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(slide.variant, slide);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                            ${
                              slide.variant === "On-Hold"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                                  onClick={e => {
                                    handleAdd("on-hold", slide);
                                    e.stopPropagation();
                                  }}
                                >
                                  On-Hold
                                  {slide.variant === "On-Hold" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(slide.variant, slide);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                             ${
                               slide.variant === "To Watch"
                                 ? "text-highlight-cyan"
                                 : "text-light-100"
                             }
                             `}
                                  onClick={e => {
                                    handleAdd("to-watch", slide);
                                    e.stopPropagation();
                                  }}
                                >
                                  To Watch
                                  {slide.variant === "To Watch" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(slide.variant, slide);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                               ${
                                 slide.variant === "Dropped"
                                   ? "text-highlight-cyan"
                                   : "text-light-100"
                               }
                               `}
                                  onClick={e => {
                                    handleAdd("dropped", slide);
                                    e.stopPropagation();
                                  }}
                                >
                                  Dropped
                                  {slide.variant === "Dropped" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(slide.variant, slide);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                          ${
                            slide.variant === "Completed"
                              ? "text-highlight-cyan"
                              : "text-light-100"
                          }
                          `}
                                  onClick={e => {
                                    handleAdd("completed", slide);
                                    e.stopPropagation();
                                  }}
                                >
                                  Completed
                                  {slide.variant === "Completed" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(slide.variant, slide);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </SliderContainer>
          {movies && (
            <>
              <button
                className="absolute left-[9%] top-[50%] hidden -translate-y-1/2 rounded-full bg-dark-300 bg-opacity-50 p-4 text-light-100 text-opacity-50 duration-[250ms] hover:bg-opacity-70 hover:text-opacity-75 active:bg-opacity-[85%] active:text-opacity-100 sm:block lg:left-[20%] xl:left-[15%] 2xl:left-[10%]"
                onClick={() => sliderRef?.current?.slickPrev()}
              >
                <svg
                  className="h-[3rem] w-[3rem] rounded-full border-2 border-current"
                  fill="currentcolor"
                  stroke="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                </svg>
              </button>
              <button
                className="absolute right-[9%] top-[50%] hidden -translate-y-1/2 rounded-full bg-dark-300 bg-opacity-50 p-4 text-light-100 text-opacity-50 duration-[250ms] hover:bg-opacity-70 hover:text-opacity-75 active:bg-opacity-[85%] active:text-opacity-100 sm:block lg:right-[20%] xl:right-[15%] 2xl:right-[10%]"
                onClick={() => sliderRef?.current?.slickNext()}
              >
                <svg
                  className="h-[3rem] w-[3rem] rounded-full border-2 border-current"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                </svg>
              </button>
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Slider;
