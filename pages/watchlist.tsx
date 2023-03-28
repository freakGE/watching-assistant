"use client";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { saveToDatabaseProps } from "@/lib/types";
import { changeDB } from "@/lib/changeDB";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

const Spinner = dynamic(() => import("@/components/Spinner"));
const LazyImage = dynamic(() => import("../components/LazyImage"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});
const ExtraModal = dynamic(() => import("@/components/ExtraModal"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

const fetchData = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/get-db?full=true`,
    {
      next: {
        revalidate: 60 * 60 * 4,
      },
    }
  );
  const data = await response.json();

  return data;
};

const variantTranslator = (str: string) => {
  let fixedVariant;
  if (str === "watching") fixedVariant = "Watching";
  if (str === "on-hold") fixedVariant = "On-Hold";
  if (str === "to-watch") fixedVariant = "To Watch";
  if (str === "dropped") fixedVariant = "Dropped";
  if (str === "completed") fixedVariant = "Completed";
  // ?
  if (str === "Watching") fixedVariant = "watching";
  if (str === "On-Hold") fixedVariant = "on-hold";
  if (str === "To Watch") fixedVariant = "to-watch";
  if (str === "Dropped") fixedVariant = "dropped";
  if (str === "Completed") fixedVariant = "completed";
  return fixedVariant;
};

const Watchlist = () => {
  const { status, data } = useSession();
  const router = useRouter();
  const variantsArray = [
    "watching",
    "on-hold",
    "to-watch",
    "dropped",
    "completed",
  ];
  const [currentVariant, setCurrentVariant] = useState<string>(
    variantsArray[0]
  );
  const [extraForm, setExtraForm] = useState(false);
  const [variant, setVariant] = useState<{
    [x: string]: { id: number; title: string; type: "movie" | "tv" }[];
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);
  const [dropdownId, setDropdownId] = useState(null);
  const [extraMovie, setExtraMovie] = useState<any>(null);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") signIn();
    if (status === "authenticated") setIsLoading(false);
  }, [status]);

  const handleCurrentVariant = (e: React.MouseEvent<HTMLButtonElement>) => {
    const defaultVariant = "watching";

    const type =
      variantTranslator(e?.currentTarget?.innerText)?.toLowerCase() ||
      defaultVariant;

    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          type,
        },
      },
      undefined,
      { scroll: false }
    );
  };

  useEffect(() => {
    const defaultVariant = "watching";
    const safeVariant = router.query.type?.toString() || defaultVariant;
    setCurrentVariant(
      variantsArray.includes(safeVariant) ? safeVariant : defaultVariant
    );
  }, [router.query.type, variantsArray]);

  const handleClick = async (title: any) => {
    const id = `${title.type}`;
    if (title.type === "person") {
      router
        .push(
          {
            pathname: `name/${title.id}`,
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
    if (title.type === "movie") {
      router
        .push(
          {
            pathname: `title/${id}`,
            query: { i: title.id },
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
    if (title.type === "tv") {
      router
        .push(
          {
            pathname: `title/${id}`,
            query: { i: title.id },
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
  };

  const handleAdd = (variant: saveToDatabaseProps["variant"], title: any) => {
    changeDB({
      variant,
      user: data?.user,
      title,
    });

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

    setDropdown(null);

    setTimeout(() => {
      setDropdownId(title.id);
      setTimeout(() => setDropdownId(null), 1000);
    }, 750);
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchData().then(res => {
      let obj: any = {};
      for (const index of variantsArray) {
        const array = res[index];
        obj[index] = array;
      }
      setVariant(obj);
    });
  }, [dropdownId, extraForm, status]);

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

  if (loading) {
    return (
      <>
        <Head>
          <title>Watching Assistant</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Description */}
          <meta
            name="description"
            content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
          />
          <meta
            name="keywords"
            content="watching, watching assistant, watchlist"
          />
          {/* Open Graph data */}
          <meta property="og:title" content="Watching Assistant" />
          <meta
            property="og:description"
            content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
          />
          <meta
            property="og:image"
            content={`${process.env.NEXT_PUBLIC_URL}/thumbnail.png`}
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Spinner className="w-[3rem] animate-spin text-dark-100" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Watchlist - WA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Description */}
        <meta
          name="description"
          content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
        />
        <meta
          name="keywords"
          content="watching, watching assistant, watchlist"
        />
        {/* Open Graph data */}
        <meta property="og:title" content="Watching Assistant" />
        <meta
          property="og:description"
          content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/thumbnail.png`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {extraForm && (
        <ExtraModal
          title={extraMovie}
          extra={extraMovie.extra}
          onClose={() => setExtraForm(false)}
        />
      )}
      <main className="wrapper-container mt-[6rem] min-h-[calc(100vh-6rem-100px)]  sm:mt-[5rem] sm:min-h-[calc(100vh-5rem-100px)]">
        <div className="w-11/12 max-w-[80rem] md:w-10/12">
          <ul className="relative flex w-full flex-wrap justify-center gap-x-2 gap-y-2 1xs:flex-nowrap 1.5xs:gap-y-0 2xs:gap-x-3 3xs:justify-between 3xs:gap-x-4">
            {variantsArray.map((item, i) => {
              const text = variantTranslator(item);
              return (
                <li
                  key={`${item}_${i}`}
                  className="flex w-min items-center justify-center 3xs:w-full"
                >
                  <button
                    onClick={handleCurrentVariant}
                    className={`whitespace-nowrap rounded-md py-1 px-2 font-[500] duration-[250ms] 1xs:w-full  1xs:py-1.5 lg:py-2 lg:text-lg ${
                      currentVariant === item
                        ? "bg-highlight-cyan text-dark-300 shadow-xl hover:bg-opacity-90 active:bg-opacity-[85%]"
                        : "bg-dark-150 text-light-100 shadow-lg hover:bg-opacity-80 active:bg-opacity-70"
                    }`}
                  >
                    {text}
                  </button>
                </li>
              );
            })}
          </ul>
          {variant?.[currentVariant] && variant?.[currentVariant].length > 0 ? (
            <div className="my-[1rem] grid w-full grid-cols-1  grid-rows-1 gap-4 xs:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
              {variant?.[currentVariant]
                ?.map((movie: any, i: number) => {
                  movie.variant = variantTranslator(currentVariant);
                  return (
                    <div
                      key={movie.id}
                      className={`flex w-full justify-center rounded-md shadow-lg`}
                      style={{
                        zIndex: i,
                      }}
                    >
                      <div className="relative flex w-full max-w-[35rem] flex-col items-center rounded-md bg-dark-200 shadow-md duration-300 hover:shadow-xl md:flex-row lg:max-w-full">
                        {movie.poster && (
                          <div className="z-[1] mb-1 mt-[0.5rem] flex w-full max-w-[12rem] flex-col rounded-md duration-300 1xs:mb-0  1xs:w-[15rem] md:mt-0 2xl:w-[18rem]">
                            <button
                              onClick={() => handleClick(movie)}
                              className="relative flex h-[14rem] items-center justify-center overflow-hidden rounded-md 1xs:rounded-r-none lg:h-[16rem] 2xl:h-[17rem]"
                            >
                              <LazyImage
                                src={movie.poster}
                                unoptimized={true}
                                alt={movie.title}
                                className="absolute flex h-full w-full scale-100 items-center justify-center bg-dark-150 text-center text-sm font-semibold text-dark-100
                      duration-[250ms] hover:scale-110"
                                draggable={false}
                              />
                            </button>
                          </div>
                        )}
                        <div className="z-[1] flex h-full w-full flex-col justify-between gap-y-2 p-2">
                          <div className="w-full">
                            {movie.extra && movie.extra.url ? (
                              <div className="box-orient relative z-0 max-h-[3.5rem] w-full select-text overflow-hidden text-ellipsis text-center text-lg font-semibold duration-300 1xs:text-start">
                                <Link
                                  href={movie.extra.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="flex w-full flex-row-reverse items-start justify-center gap-x-1 text-dark-100 md:justify-end"
                                >
                                  <svg
                                    className="w-[2rem] stroke-highlight-cyan duration-300 hover:opacity-[75%] 2exs:w-[1.5rem] 2xs:min-w-[1.3rem] 2xs:max-w-[1.3rem]"
                                    fill="none"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                  </svg>
                                  <h4 className="text-light-100 duration-300 hover:text-dark-100">
                                    {movie.title}
                                  </h4>
                                </Link>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleClick(movie)}
                                className="box-orient relative z-0 max-h-[3.5rem] w-full select-text overflow-hidden text-ellipsis text-center text-lg font-semibold duration-300 hover:text-dark-100 md:text-start"
                              >
                                <h4 className="">{movie.title}</h4>
                              </button>
                            )}
                            {movie.extra && (
                              <>
                                <div className="relative my-2 flex h-[1px] w-full items-center bg-dark-100 bg-opacity-[20%]"></div>
                                <div className="flex w-full flex-col gap-y-1">
                                  {movie.extra.season && (
                                    <div className="flex flex-wrap gap-x-1">
                                      <h3 className="font-semibold">Season:</h3>
                                      <p className="text-dark-100">
                                        {movie.extra.season}
                                      </p>
                                    </div>
                                  )}
                                  {movie.extra.episode && (
                                    <div className="flex flex-wrap gap-x-1">
                                      <h3 className="font-semibold">
                                        Episode:
                                      </h3>
                                      <p className="text-dark-100">
                                        {movie.extra.episode}
                                      </p>
                                    </div>
                                  )}
                                  {movie.extra.comment && (
                                    <div className="flex flex-row flex-wrap gap-x-1">
                                      {/* <h3 className="font-semibold">Comment:</h3> */}
                                      <p className="box-orient max-h-[3rem] overflow-hidden text-ellipsis text-dark-100">
                                        → {movie.extra.comment}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex h-[3rem] w-full items-center justify-center gap-x-2">
                            <div
                              className="relative flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 shadow-md duration-200 hover:text-highlight-cyan"
                              onClick={e => {
                                setTrackMouse([e.clientX, e.clientY]);
                                setTrackScroll(window.pageYOffset);

                                dropdown === `${movie.id}`
                                  ? setDropdown(null)
                                  : setDropdown(`${movie.id}`);
                              }}
                            >
                              <div className="flex h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden font-[500] duration-300 xs:hidden sm:flex md:hidden lg:flex 2xl:hidden">
                                <span
                                  className=" flex w-full items-center justify-center duration-300"
                                  style={{
                                    transform: movie.variant
                                      ? dropdownId === movie.id
                                        ? "translateY(calc(-100%))"
                                        : "translateY(calc(100% - 0.25rem))"
                                      : "translateY(calc(-100%))",
                                  }}
                                >
                                  {movie.variant}
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
                                    transform: movie.variant
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
                                className="hidden duration-200 hover:opacity-90 xs:block sm:hidden md:block lg:hidden 2xl:block"
                                id="Layer_1"
                                data-name="Layer 1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                width="24"
                                height="24"
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
                              <div
                                ref={dropdownRef}
                                className="absolute top-0 z-[2] w-full overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-base text-light-100 shadow-lg duration-1000 2exs:text-[0.9rem] 2xs:text-sm xl:text-base"
                                style={{
                                  borderWidth:
                                    dropdown === `${movie.id}`
                                      ? "0px 1px 1px 1px"
                                      : "0px",
                                  borderColor:
                                    dropdown === `${movie.id}`
                                      ? "rgb(47 214 181)"
                                      : "transparent",
                                  height:
                                    dropdown === `${movie.id}`
                                      ? dropdownRef?.current?.scrollHeight
                                        ? dropdownRef.current.scrollHeight
                                        : "max-content"
                                      : 0,
                                }}
                              >
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                          ${
                            movie.variant === "Watching"
                              ? "text-highlight-cyan"
                              : "text-light-100"
                          }
                          `}
                                  onClick={e => {
                                    handleAdd("watching", movie);
                                    e.stopPropagation();
                                  }}
                                >
                                  Watching
                                  {movie.variant === "Watching" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(movie.variant, movie);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="absolute right-1 w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
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
                            movie.variant === "On-Hold"
                              ? "text-highlight-cyan"
                              : "text-light-100"
                          }
                          `}
                                  onClick={e => {
                                    handleAdd("on-hold", movie);
                                    e.stopPropagation();
                                  }}
                                >
                                  On-Hold
                                  {movie.variant === "On-Hold" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(movie.variant, movie);
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
                             movie.variant === "To Watch"
                               ? "text-highlight-cyan"
                               : "text-light-100"
                           }
                           `}
                                  onClick={e => {
                                    handleAdd("to-watch", movie);
                                    e.stopPropagation();
                                  }}
                                >
                                  To Watch
                                  {movie.variant === "To Watch" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(movie.variant, movie);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="absolute right-1 w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
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
                               movie.variant === "Dropped"
                                 ? "text-highlight-cyan"
                                 : "text-light-100"
                             }
                             `}
                                  onClick={e => {
                                    handleAdd("dropped", movie);
                                    e.stopPropagation();
                                  }}
                                >
                                  Dropped
                                  {movie.variant === "Dropped" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(movie.variant, movie);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="absolute right-1 w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
                                      strokeWidth="0"
                                      viewBox="0 0 1024 1024"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-0 px-2 pb-2 duration-200 hover:bg-dark-150
                        ${
                          movie.variant === "Completed"
                            ? "text-highlight-cyan"
                            : "text-light-100"
                        }
                        `}
                                  onClick={e => {
                                    handleAdd("completed", movie);
                                    e.stopPropagation();
                                  }}
                                >
                                  Completed
                                  {movie.variant === "Completed" && (
                                    <svg
                                      onClick={e => {
                                        handleRemove(movie.variant, movie);
                                        e.stopPropagation();
                                      }}
                                      stroke="currentColor"
                                      className="absolute right-1 w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
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
                            <button
                              className="
              relative flex h-full w-full cursor-pointer items-center justify-center rounded-md  bg-highlight-pink font-[500] shadow-md duration-200 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95"
                              onClick={() => {
                                setExtraMovie(movie);
                                setExtraForm(true);
                              }}
                            >
                              Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                .reverse()}
            </div>
          ) : (
            <div className="flex h-[95.3%] w-full items-center justify-center ">
              <h3 className="text-2xl">
                You haven&apos;t added any titles to your{" "}
                <span className="text-highlight-cyan">
                  {variantTranslator(currentVariant)}
                </span>{" "}
                list
              </h3>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Watchlist;
