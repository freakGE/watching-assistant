import { TrendingTypes } from "@/lib/types";
import Image from "next/image";
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Paragraph from "./Paragraph";
import SliderContainer from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { changeDB } from "@/lib/changeDB";
import checkTitle from "@/lib/checkTitle";
import { saveToDatabaseProps } from "@/lib/types";
import { getSession, useSession } from "next-auth/react";

const Spinner = dynamic(() => import("./Spinner"));
const LazyImage = dynamic(() => import("../components/LazyImage"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

type SliderProps = {
  top?: boolean;
  type?: "tv" | "movie" | "person" | "all";
  request?: "similar" | "trending";
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

const sliderSettings = {
  className: "center",
  centerMode: true,
  infinite: true,
  dots: true,
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
  // const [sliderData, setSliderData] = useState<TrendingTypes | null>(null);
  const [isPending, startTransition] = useTransition();
  const sliderRef = React.createRef<SliderContainer>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);
  const [movies, setMovies] = useState<TrendingTypes["results"]>([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [animationValue, setAnimationValue] = useState(0);

  const refreshData = () => {
    router.replace(router.asPath, undefined, { scroll: false });
  };

  const handleAdd = (variant: saveToDatabaseProps["variant"], title: any) => {
    changeDB({
      variant,
      user: data?.user,
      title,
    });
    refreshData();

    setDropdown(null);

    setTimeout(() => {
      setDropdownId(title.id);
      setTimeout(() => setDropdownId(null), 1000);
    }, 750);
  };

  const handleRemove = (
    variant: saveToDatabaseProps["variant"],
    title: any
  ) => {
    changeDB({
      variant,
      user: data?.user,
      title,
      remove: true,
    });
    refreshData();

    setDropdown(null);

    setTimeout(() => {
      setDropdownId(title.id);
      setTimeout(() => setDropdownId(null), 1000);
    }, 750);
  };

  const fetchData = async () => {
    const res: TrendingTypes = await fetchSliderData({ type, request, id });

    const updatedMovies = async () => {
      const session = await getSession();

      if (!session) {
        return res.results;
      }
      return await Promise.all(
        res.results.map(async movie => {
          const variant = await checkTitle(movie);
          return { ...movie, variant };
        })
      );
    };
    updatedMovies().then(value => {
      startTransition(() => {
        setMovies(value);
      });
    });
  };

  useEffect(() => {
    fetchData();
  }, [dropdownId, router.query, status]);

  const handleClick = async (title: any) => {
    const type = title.media_type || queryType;

    if (type === "person") {
      router
        .replace(
          {
            pathname: `/name/${title.id}`,
          },
          undefined,
          {
            shallow: true,
          }
        )
        .catch(e => {
          if (!e.cancelled) {
            throw e;
          }
        });
      return;
    }
    if (type === "movie") {
      router
        .replace(
          {
            pathname: `/title/${type}`,
            query: { i: title.id },
          },
          undefined,
          {
            shallow: !true,
          }
        )
        .catch(e => {
          if (!e.cancelled) {
            throw e;
          }
        });
      return;
    }
    if (type === "tv") {
      router
        .replace(
          {
            pathname: `/title/${type}`,
            query: { i: title.id },
          },
          undefined,
          {
            shallow: !true,
          }
        )
        .catch(e => {
          if (!e.cancelled) {
            throw e;
          }
        });
      return;
    }
  };

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
      className={`h-[26rem] w-screen text-dark-300 
      ${top ? `my-[1rem] sm:my-[3.5rem]` : `mb-[3rem]`}`}
    >
      {/* //! preloader */}
      <span
        className="duration-400 fixed top-0 z-[9999] h-screen w-screen items-center justify-center bg-dark-300"
        style={{
          display: animationValue === 0 ? "flex" : "none",
        }}
      >
        <svg
          className="tea w-[4rem] sm:w-[5rem]"
          viewBox="0 0 37 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke="rgb(151 155 176)"
            strokeWidth={2}
            d="M27.0819 17H3.02508C1.91076 17 1.01376 17.9059 1.0485 19.0197C1.15761 22.5177 1.49703 29.7374 2.5 34C4.07125 40.6778 7.18553 44.8868 8.44856 46.3845C8.79051 46.79 9.29799 47 9.82843 47H20.0218C20.639 47 21.2193 46.7159 21.5659 46.2052C22.6765 44.5687 25.2312 40.4282 27.5 34C28.9757 29.8188 29.084 22.4043 29.0441 18.9156C29.0319 17.8436 28.1539 17 27.0819 17Z"
          />
          <path
            stroke="rgb(151 155 176)"
            strokeWidth={2}
            d="M29 23.5C29 23.5 34.5 20.5 35.5 25.4999C36.0986 28.4926 34.2033 31.5383 32 32.8713C29.4555 34.4108 28 34 28 34"
          />
          <path
            id="teabag"
            fill="rgb(151 155 176)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 25V17H14V25H12C10.3431 25 9 26.3431 9 28V34C9 35.6569 10.3431 37 12 37H18C19.6569 37 21 35.6569 21 34V28C21 26.3431 19.6569 25 18 25H16ZM11 28C11 27.4477 11.4477 27 12 27H18C18.5523 27 19 27.4477 19 28V34C19 34.5523 18.5523 35 18 35H12C11.4477 35 11 34.5523 11 34V28Z"
          />
          <path
            id="steamL"
            d="M17 1C17 1 17 4.5 14 6.5C11 8.5 11 12 11 12"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="rgb(151 155 176)"
          />
          <path
            id="steamR"
            d="M21 6C21 6 21 8.22727 19 9.5C17 10.7727 17 13 17 13"
            stroke="rgb(151 155 176)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="relative h-[26rem]">
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
            {movies &&
              movies.map(slide => {
                const date = slide?.release_date || slide?.first_air_date;
                const release = convertToReadableDate(date);
                return (
                  <div
                    key={slide.id}
                    className="relative flex h-[26rem] w-full max-w-[80rem] items-center overflow-hidden bg-dark-300 2xs:w-10/12"
                  >
                    <Image
                      quality={100}
                      src={
                        slide.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500` +
                            slide.backdrop_path
                          : `https://image.tmdb.org/t/p/w500` +
                            slide.poster_path
                      }
                      alt={
                        slide.title ||
                        slide.original_title ||
                        slide.name ||
                        "Background Poster"
                      }
                      fill
                      unoptimized={true}
                      className="z-[0] h-full w-full object-cover opacity-80 blur-[2px]"
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
                              onImageLoad={() => setAnimationValue(1)}
                              unoptimized={true}
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
                                // md:flex 2md:hidden xl:flex 2xl:hidden 5xl:flex
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
