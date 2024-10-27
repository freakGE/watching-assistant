import { GetServerSideProps } from "next";
import Head from "@/components/CustomHead"
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

const Spinner = dynamic(() => import("@/components/Spinner"), {
  loading: () => <div>Loading...</div>,
});
const Slider = dynamic(() => import("@/components/Slider"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});
const ExtraModal = dynamic(() => import("@/components/ExtraModal"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

import checkTitle from "@/lib/checkTitle";
import { saveToDatabaseProps, TitleType } from "@/lib/types";
import { getSession, useSession } from "next-auth/react";
import { addToDB, removeFromDB } from "@/lib/changeDB";
import { fixVariant } from "@/lib/getMovies";

function convertToReadableDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

const TitleDetail = (props: any) => {
  const { query } = useRouter();
  const { status, data } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState(false);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);
  const queryType = query.titleId && query.titleId[0];
  const [dataTMDB, setDataTMDB] = useState<any>([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [extraForm, setExtraForm] = useState(false);

  const handleAdd = (variant: saveToDatabaseProps["variant"], title: any) => {
    addToDB(variant, title, data?.user, setDropdown)
  };

  const handleRemove = (
    variant: saveToDatabaseProps["variant"],
    title: any
  ) => {
    removeFromDB(variant, title, data?.user, setDropdown)
  };

  useEffect(() => {
    const updatedMovies = async () => {
      const session = await getSession();
      
      if (!session) return props.data;
      
      const [titleInfo, cachedVariants] = await Promise.all([
        checkTitle(props.data, "full"),
        JSON.parse(localStorage.getItem('cachedVariants') || '{}'),
      ]);
      
      const variant = typeof query.i === 'string' && query.i in cachedVariants ? fixVariant(cachedVariants[query.i].variant) : null;
      
      const updatedData = { ...props.data, variant, ...(titleInfo?.extra ? { extra: titleInfo.extra } : null) };
      
      return updatedData;
    };

    updatedMovies().then(value => startTransition(() => setDataTMDB(value)));
  }, [dropdownId, extraForm, query, status, props.data]);

  
  useEffect(() => {
    const cutLasso = 200;

    const handleMouseLeave = (event: { clientX: number; clientY: number }) => {
      const distance =
        Math.sqrt(
          Math.pow(event.clientX - trackMouse[0], 2) +
            Math.pow(event.clientY - trackMouse[1], 2)
        ) || 0;

      if (distance >= cutLasso) {
        setDropdown(false);
      }
    };

    const handleScroll = () => {
      if (trackScroll && Math.abs(scrollY - trackScroll) > cutLasso)
        setDropdown(false);
    };

    document.addEventListener("mousemove", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousemove", handleMouseLeave);
      window.addEventListener("scroll", handleScroll);
    };
  }, [dropdown, trackMouse, trackScroll]);

  const title = dataTMDB.name || dataTMDB.title || dataTMDB.Title
  const genreNames = dataTMDB?.genres?.map((item: { name: string }) => item.name).join(', ') || '';
  const releaseDate = dataTMDB.Released && dataTMDB.Released[0] === "0"
    ? dataTMDB.Released.substring(1)
    : dataTMDB.Released ||
      convertToReadableDate(dataTMDB.release_date)

  return (
    <>
        {(Math.round(dataTMDB.imdb_rating * 10) / 10 ||
                Math.round(dataTMDB.vote_average * 10) / 10 ||
                dataTMDB.imdbRating) && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Score:</h3>
                  <p className="flex items-center justify-center text-dark-100">
                    {Math.round(dataTMDB.imdb_rating * 10) / 10 ||
                      Math.round(dataTMDB.vote_average * 10) / 10 ||
                      dataTMDB.imdbRating}
                  </p>
                </div>
              )}
      <Head 
        title={title ? `${title} - WA` : "Title - WA"} 
        description={`Discover everything about ${title}${dataTMDB.release_date || dataTMDB.Released ? `, a ${dataTMDB.type === "tv" ? "TV Series".toLowerCase() : "Movie".toLowerCase()} released on ${releaseDate}` : ''}. With a score of ${Math.round(dataTMDB.imdb_rating * 10) / 10 || Math.round(dataTMDB.vote_average * 10) / 10 || dataTMDB.imdbRating}, this title falls under the genres: ${genreNames}. Status: ${dataTMDB.status}.`}
        image={dataTMDB.poster_path ? `https://image.tmdb.org/t/p/w500` + dataTMDB.poster_path: undefined}
        keywords={title ? `${title}, ${title.split(/[, &]+/).map((word: string) => word.trim()).join(", ")}, Trailer, Credits, Rating` : undefined}
      />
      {extraForm && (
        <ExtraModal
          title={dataTMDB}
          extra={dataTMDB.extra}
          onClose={() => setExtraForm(false)}
        />
      )}
      <main className="mt-[6rem] flex min-h-[calc(100vh-6rem)] w-screen flex-col items-center  sm:mt-[5rem]">
        <div className="wrapper h-full">
          <div className="flex h-full flex-col sm:flex-row sm:items-start sm:gap-x-[2rem]">
            <div className="flex w-full  flex-col items-center justify-center sm:w-[13rem] sm:items-start">
              <div className="relative h-[15.5rem] w-[13rem] lg:h-[16rem] 2xl:h-[17rem]">
                <Image
                  loading="eager"
                  quality={75}
                  unoptimized={true}
                  alt={
                    dataTMDB.name ||
                    dataTMDB.title ||
                    dataTMDB.Title ||
                    "Poster"
                  }
                  src={
                    dataTMDB.Poster ||
                    (dataTMDB.poster_path
                      ? `https://image.tmdb.org/t/p/w500` + dataTMDB.poster_path
                      : "#")
                  }
                  fill
                  className="absolute left-0 h-[17rem] w-[13rem] scale-100 items-center justify-center rounded-md bg-dark-150 text-center text-sm font-semibold
              text-dark-100 duration-[250ms]"
                  draggable={false}
                />
              </div>
              <div
                className="relative mt-5 hidden h-[3rem] w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 text-dark-100 shadow-md duration-200 hover:text-highlight-cyan sm:flex"
                onClick={e => {
                  setTrackMouse([e.clientX, e.clientY]);
                  setTrackScroll(window.pageYOffset);

                  dropdown ? setDropdown(false) : setDropdown(true);
                }}
              >
                {dataTMDB.variant ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden duration-300">
                    <span
                      className=" flex w-full items-center justify-center text-xl duration-300"
                      style={{
                        transform: dataTMDB.variant
                          ? dropdownId === dataTMDB.id
                            ? "translateY(calc(-100%))"
                            : "translateY(calc(100% - 0.25rem))"
                          : "translateY(calc(-100%))",
                      }}
                    >
                      {dataTMDB.variant}
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
                        transform: dataTMDB.variant
                          ? "translateY(100%)"
                          : "translateY(calc(-100% + 0.75rem))",
                      }}
                    >
                      <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        className="w-[2rem] duration-200 hover:opacity-90"
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
                ) : (
                  <svg
                    className="w-[2rem] duration-200 hover:opacity-90"
                    id="Layer_1"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
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
                  className="absolute top-0 z-[2] w-full overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-lg text-light-100 shadow-lg duration-1000"
                  style={{
                    borderWidth: dropdown ? "1px 1px 1px 1px" : "0px",
                    borderColor: dropdown ? "rgb(47 214 181)" : "transparent",
                    height: dropdown
                      ? dropdownRef?.current?.scrollHeight
                        ? dropdownRef.current.scrollHeight
                        : "max-content"
                      : 0,
                  }}
                >
                  <div
                    className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                            ${
                              dataTMDB.variant === "Watching"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                    onClick={e => {
                      handleAdd("watching", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Watching
                    {dataTMDB.variant === "Watching" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                              dataTMDB.variant === "On-Hold"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                    onClick={e => {
                      handleAdd("on-hold", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    On-Hold
                    {dataTMDB.variant === "On-Hold" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                               dataTMDB.variant === "To Watch"
                                 ? "text-highlight-cyan"
                                 : "text-light-100"
                             }
                             `}
                    onClick={e => {
                      handleAdd("to-watch", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    To Watch
                    {dataTMDB.variant === "To Watch" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                                 dataTMDB.variant === "Dropped"
                                   ? "text-highlight-cyan"
                                   : "text-light-100"
                               }
                               `}
                    onClick={e => {
                      handleAdd("dropped", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Dropped
                    {dataTMDB.variant === "Dropped" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                    className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 pb-2 duration-200 hover:bg-dark-150
                          ${
                            dataTMDB.variant === "Completed"
                              ? "text-highlight-cyan"
                              : "text-light-100"
                          }
                          `}
                    onClick={e => {
                      handleAdd("completed", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Completed
                    {dataTMDB.variant === "Completed" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
              {dataTMDB.variant && (
                <button
                  className="
              relative mt-5 hidden h-[3rem] w-full cursor-pointer items-center justify-center rounded-md bg-highlight-pink text-xl shadow-md duration-200 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95 sm:flex"
                  onClick={() => setExtraForm(true)}
                >
                  Notes
                </button>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center sm:items-start">
              <h3 className="my-5 text-center text-xl text-[1.4rem] font-semibold sm:mt-0 sm:text-start">
                {dataTMDB.extra && dataTMDB.extra.url ? (
                  <Link
                    href={dataTMDB.extra.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-fit flex-row-reverse items-start gap-x-1"
                  >
                    <svg
                      className="stroke-highlight-cyan"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    {title}{" "}
                  </Link>
                ) : title}
              </h3>
              {/* //! */}

              <div
                className="relative flex h-[3rem] w-[10rem] cursor-pointer items-center justify-center rounded-md bg-dark-150 text-dark-100 shadow-md duration-200 hover:text-highlight-cyan sm:hidden"
                onClick={e => {
                  setTrackMouse([e.clientX, e.clientY]);
                  setTrackScroll(window.pageYOffset);

                  dropdown ? setDropdown(false) : setDropdown(true);
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden duration-300">
                  <span
                    className=" flex w-full items-center justify-center text-xl duration-300"
                    style={{
                      transform: dataTMDB.variant
                        ? dropdownId === dataTMDB.id
                          ? "translateY(calc(-100%))"
                          : "translateY(calc(100% - 0.25rem))"
                        : "translateY(calc(-100%))",
                    }}
                  >
                    {dataTMDB.variant}
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
                      transform: dataTMDB.variant
                        ? "translateY(100%)"
                        : "translateY(calc(-100% + 0.75rem))",
                    }}
                  >
                    <svg
                      id="Layer_1"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      className="w-[2rem] duration-200 hover:opacity-90"
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

                <div
                  ref={dropdownRef}
                  className="absolute top-0 z-[2] w-full overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-lg text-light-100 shadow-lg duration-1000"
                  style={{
                    borderWidth: dropdown ? "1px 1px 1px 1px" : "0px",
                    borderColor: dropdown ? "rgb(47 214 181)" : "transparent",
                    height: dropdown
                      ? dropdownRef?.current?.scrollHeight
                        ? dropdownRef.current.scrollHeight
                        : "max-content"
                      : 0,
                  }}
                >
                  <div
                    className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150
                            ${
                              dataTMDB.variant === "Watching"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                    onClick={e => {
                      handleAdd("watching", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Watching
                    {dataTMDB.variant === "Watching" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                              dataTMDB.variant === "On-Hold"
                                ? "text-highlight-cyan"
                                : "text-light-100"
                            }
                            `}
                    onClick={e => {
                      handleAdd("on-hold", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    On-Hold
                    {dataTMDB.variant === "On-Hold" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                               dataTMDB.variant === "To Watch"
                                 ? "text-highlight-cyan"
                                 : "text-light-100"
                             }
                             `}
                    onClick={e => {
                      handleAdd("to-watch", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    To Watch
                    {dataTMDB.variant === "To Watch" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                                 dataTMDB.variant === "Dropped"
                                   ? "text-highlight-cyan"
                                   : "text-light-100"
                               }
                               `}
                    onClick={e => {
                      handleAdd("dropped", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Dropped
                    {dataTMDB.variant === "Dropped" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                    className={`flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 pb-2 duration-200 hover:bg-dark-150
                          ${
                            dataTMDB.variant === "Completed"
                              ? "text-highlight-cyan"
                              : "text-light-100"
                          }
                          `}
                    onClick={e => {
                      handleAdd("completed", dataTMDB);
                      e.stopPropagation();
                    }}
                  >
                    Completed
                    {dataTMDB.variant === "Completed" && (
                      <svg
                        onClick={e => {
                          handleRemove(dataTMDB.variant, dataTMDB);
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
                {props.data.videoURL && <div className="flex w-full mt-5 sm:mt-0 sm:mb-5 relative overflow-hidden" style={{ paddingTop: "56.25%" }}>
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full" 
                    src={props.data.videoURL}
                    frameBorder="0" 
                    allowFullScreen
                    allow="fullscreen"
                    // referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>}
              {dataTMDB.variant && (
                <button
                  className="
              relative mt-5 flex h-[3rem] w-[10rem] cursor-pointer items-center justify-center rounded-md bg-highlight-pink text-xl shadow-md duration-200 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95 sm:hidden"
                  onClick={() => setExtraForm(true)}
                >
                  Notes
                </button>
              )}
              {(dataTMDB.overview || dataTMDB.Plot) && (
                <p className="hidden max-w-[30rem] text-[0.95rem] text-dark-100 sm:block">
                  {dataTMDB.overview || dataTMDB.Plot}
                </p>
              )}
            </div>
            <div className="hidden flex-col gap-y-2 xl:flex">
              {(dataTMDB.overview || dataTMDB.Plot) && (
                <p className="text-[0.95rem] text-dark-100 sm:hidden">
                  {dataTMDB.overview || dataTMDB.Plot}        
                </p>
              )}
              {dataTMDB.type && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Type:</h3>
                  <p className="text-dark-100">
                    {dataTMDB.type === "tv" ? "TV Series" : "Movie"}
                  </p>
                </div>
              )}
              {(dataTMDB.number_of_seasons || dataTMDB.totalSeasons) && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Seasons:</h3>
                  <p className="text-dark-100">
                    {dataTMDB.number_of_seasons || dataTMDB.totalSeasons}
                  </p>
                </div>
              )}
              {dataTMDB.number_of_episodes && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Episodes:</h3>
                  <p className="text-dark-100">{dataTMDB.number_of_episodes}</p>
                </div>
              )}
              {dataTMDB.status && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Status:</h3>
                  <p className="text-dark-100">{dataTMDB.status}</p>
                </div>
              )}
              {(dataTMDB.release_date || dataTMDB.Released) && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Released:</h3>
                  <p className="text-dark-100">
                    {releaseDate}
                  </p>
                </div>
              )}
              {dataTMDB.Year && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Year:</h3>
                  <p className="text-dark-100">{dataTMDB.Year}</p>
                </div>
              )}
              {dataTMDB.first_air_date && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Released:</h3>
                  <p className="text-dark-100">
                    {convertToReadableDate(dataTMDB.first_air_date)}
                  </p>
                </div>
              )}
              {dataTMDB.last_air_date && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Ended:</h3>
                  <p className="text-dark-100">
                    {convertToReadableDate(dataTMDB.last_air_date)}
                  </p>
                </div>
              )}

              {(dataTMDB.runtime || dataTMDB.Runtime) && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Duration:</h3>
                  <p className="text-dark-100">
                    {dataTMDB.runtime || dataTMDB.Runtime.split(" ")[0]} min
                  </p>
                </div>
              )}
              {dataTMDB.episode_run_time && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Duration:</h3>
                  <p className="text-dark-100">
                    {dataTMDB?.episode_run_time[0]}
                    min
                  </p>
                </div>
              )}
              {(Math.round(dataTMDB.imdb_rating * 10) / 10 ||
                Math.round(dataTMDB.vote_average * 10) / 10 ||
                dataTMDB.imdbRating) && (
                <div className="flex flex-wrap gap-x-1">
                  <h3 className="font-semibold">Score:</h3>
                  <p className="flex items-center justify-center text-dark-100">
                    {Math.round(dataTMDB.imdb_rating * 10) / 10 ||
                      Math.round(dataTMDB.vote_average * 10) / 10 ||
                      dataTMDB.imdbRating}
                  </p>
                </div>
              )}
              {dataTMDB.genres && dataTMDB.genres.length > 0 && (
                <div className="flex h-max flex-wrap items-start gap-x-1">
                  <h3 className="pb-1.5 font-semibold">Genres:</h3>
                  <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                    {dataTMDB.genres.map((genre: any, i: number) => {
                      return (
                        <p
                          key={genre.id}
                          className="-translate-y-1 rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                        >
                          {genre.name}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
              {dataTMDB.Genre && dataTMDB.Genre.length > 0 && (
                <div className="flex h-max flex-wrap items-start gap-x-1">
                  <h3 className="pb-1.5 font-semibold">Genres:</h3>
                  <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                    {dataTMDB.Genre.split(", ").map((genre: any, i: number) => {
                      return (
                        <p
                          key={i}
                          className="-translate-y-1 rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                        >
                          {genre}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
              {dataTMDB.production_companies &&
                dataTMDB.production_companies.length > 0 && (
                  <div className="flex h-max flex-wrap items-start gap-x-1">
                    <h3 className="pb-1.5 font-semibold">Production:</h3>
                    <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                      {dataTMDB.production_companies.map(
                        (company: any, i: number) => {
                          return (
                            <p
                              key={company.id}
                              className="flex -translate-y-1 items-center justify-center rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                            >
                              {company.name}
                            </p>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              {dataTMDB.Production && dataTMDB.Production.length > 0 && (
                <div className="flex h-max flex-wrap items-start gap-x-1">
                  <h3 className="pb-1.5 font-semibold">Languages:</h3>
                  <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                    {dataTMDB.Production.split(", ").map(
                      (company: any, i: number) => {
                        return (
                          <p
                            key={i}
                            className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                          >
                            {company}
                          </p>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
              {dataTMDB.spoken_languages &&
                dataTMDB.spoken_languages.length > 0 && (
                  <div className="flex h-max flex-wrap items-start gap-x-1">
                    <h3 className="pb-1.5 font-semibold">Languages:</h3>
                    <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                      {dataTMDB.spoken_languages.map(
                        (language: any, i: number) => {
                          return (
                            <p
                              key={language.english_name + i}
                              className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                            >
                              {language.english_name}
                            </p>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              {dataTMDB.Language && dataTMDB.Language.length > 0 && (
                <div className="flex h-max flex-wrap items-start gap-x-1">
                  <h3 className="pb-1.5 font-semibold">Languages:</h3>
                  <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                    {dataTMDB.Language.split(", ").map(
                      (language: any, i: number) => {
                        return (
                          <p
                            key={i}
                            className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                          >
                            {language}
                          </p>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="wrapper mt-[1.5rem] flex h-full flex-col gap-y-[0.5rem] xl:hidden">
          {(dataTMDB.overview || dataTMDB.Plot) && (
            <p className="text-[0.95rem] text-dark-100 sm:hidden">
              {dataTMDB.overview || dataTMDB.Plot}
            </p>
          )}
          {dataTMDB.type && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Type:</h3>
              <p className="text-dark-100">
                {dataTMDB.type === "tv" ? "TV Series" : "Movie"}
              </p>
            </div>
          )}
          {(dataTMDB.number_of_seasons || dataTMDB.totalSeasons) && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Seasons:</h3>
              <p className="text-dark-100">
                {dataTMDB.number_of_seasons || dataTMDB.totalSeasons}
              </p>
            </div>
          )}
          {dataTMDB.number_of_episodes && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Episodes:</h3>
              <p className="text-dark-100">{dataTMDB.number_of_episodes}</p>
            </div>
          )}
          {dataTMDB.status && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Status:</h3>
              <p className="text-dark-100">{dataTMDB.status}</p>
            </div>
          )}
          {(dataTMDB.release_date || dataTMDB.Released) && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Released:</h3>
              <p className="text-dark-100">
                {dataTMDB.Released && dataTMDB.Released[0] === "0"
                  ? dataTMDB.Released.substring(1)
                  : dataTMDB.Released ||
                    convertToReadableDate(dataTMDB.release_date)}
              </p>
            </div>
          )}
          {dataTMDB.Year && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Year:</h3>
              <p className="text-dark-100">{dataTMDB.Year}</p>
            </div>
          )}
          {dataTMDB.first_air_date && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Released:</h3>
              <p className="text-dark-100">
                {convertToReadableDate(dataTMDB.first_air_date)}
              </p>
            </div>
          )}
          {dataTMDB.last_air_date && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Ended:</h3>
              <p className="text-dark-100">
                {convertToReadableDate(dataTMDB.last_air_date)}
              </p>
            </div>
          )}

          {(dataTMDB.runtime || dataTMDB.Runtime) && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Duration:</h3>
              <p className="text-dark-100">
                {dataTMDB.runtime || dataTMDB.Runtime.split(" ")[0]} min
              </p>
            </div>
          )}
          {dataTMDB.episode_run_time && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Duration:</h3>
              <p className="text-dark-100">
                {dataTMDB?.episode_run_time[0]}
                min
              </p>
            </div>
          )}
          {(Math.round(dataTMDB.imdb_rating * 10) / 10 ||
            Math.round(dataTMDB.vote_average * 10) / 10 ||
            dataTMDB.imdbRating) && (
            <div className="flex flex-wrap gap-x-1">
              <h3 className="font-semibold">Score:</h3>
              <p className="flex items-center justify-center text-dark-100">
                {Math.round(dataTMDB.imdb_rating * 10) / 10 ||
                  Math.round(dataTMDB.vote_average * 10) / 10 ||
                  dataTMDB.imdbRating}
              </p>
            </div>
          )}
          {dataTMDB.genres && dataTMDB.genres.length > 0 && (
            <div className="flex h-max flex-wrap items-start gap-x-1">
              <h3 className="pb-1.5 font-semibold">Genres:</h3>
              <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                {dataTMDB.genres.map((genre: any, i: number) => {
                  return (
                    <p
                      key={genre.id}
                      className="-translate-y-1 rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                    >
                      {genre.name}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
          {dataTMDB.Genre && dataTMDB.Genre.length > 0 && (
            <div className="flex h-max flex-wrap items-start gap-x-1">
              <h3 className="pb-1.5 font-semibold">Genres:</h3>
              <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                {dataTMDB.Genre.split(", ").map((genre: any, i: number) => {
                  return (
                    <p
                      key={i}
                      className="-translate-y-1 rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                    >
                      {genre}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
          {dataTMDB.production_companies &&
            dataTMDB.production_companies.length > 0 && (
              <div className="flex h-max flex-wrap items-start gap-x-1">
                <h3 className="pb-1.5 font-semibold">Production:</h3>
                <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                  {dataTMDB.production_companies.map(
                    (company: any, i: number) => {
                      return (
                        <p
                          key={company.id}
                          className="flex -translate-y-1 items-center justify-center rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                        >
                          {company.name}
                        </p>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          {dataTMDB.Production && dataTMDB.Production.length > 0 && (
            <div className="flex h-max flex-wrap items-start gap-x-1">
              <h3 className="pb-1.5 font-semibold">Languages:</h3>
              <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                {dataTMDB.Production.split(", ").map(
                  (company: any, i: number) => {
                    return (
                      <p
                        key={i}
                        className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                      >
                        {company}
                      </p>
                    );
                  }
                )}
              </div>
            </div>
          )}
          {dataTMDB.spoken_languages &&
            dataTMDB.spoken_languages.length > 0 && (
              <div className="flex h-max flex-wrap items-start gap-x-1">
                <h3 className="pb-1.5 font-semibold">Languages:</h3>
                <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                  {dataTMDB.spoken_languages.map((language: any, i: number) => {
                    return (
                      <p
                        key={language.english_name + i}
                        className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                      >
                        {language.english_name}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          {dataTMDB.Language && dataTMDB.Language.length > 0 && (
            <div className="flex h-max flex-wrap items-start gap-x-1">
              <h3 className="pb-1.5 font-semibold">Languages:</h3>
              <div className="flex flex-wrap items-start gap-1.5 font-[500] text-dark-100">
                {dataTMDB.Language.split(", ").map(
                  (language: any, i: number) => {
                    return (
                      <p
                        key={i}
                        className="-translate-y-1 whitespace-nowrap rounded-md bg-dark-150 px-2 py-1 duration-[250ms] hover:text-highlight-cyan"
                      >
                        {language}
                      </p>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
        {dataTMDB.extra && (
          <>
            <div className="wrapper relative my-[1rem] flex h-[1px] items-center  bg-dark-100 xl:mt-[1.5rem]">
              <h3 className="absolute ml-[3.1rem] bg-dark-300 px-2 font-semibold">
                Additional
              </h3>
            </div>
            <div className="wrapper">
              <div className="flex w-full flex-col gap-y-[0.5rem]">
                {dataTMDB.extra.url && (
                  <>
                    <Link
                      href={dataTMDB.extra.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-highlight-pink underline underline-offset-4 duration-200 hover:no-underline"
                    >
                      Watch Now!
                    </Link>
                  </>
                )}
                {dataTMDB.extra.season && (
                  <div className="flex flex-wrap gap-x-1">
                    <h3 className="font-semibold">Season:</h3>
                    <p className="text-dark-100">{dataTMDB.extra.season}</p>
                  </div>
                )}
                {dataTMDB.extra.episode && (
                  <div className="flex flex-wrap gap-x-1">
                    <h3 className="font-semibold">Episode:</h3>
                    <p className="text-dark-100">{dataTMDB.extra.episode}</p>
                  </div>
                )}
                {dataTMDB.extra.comment && (
                  <div className="flex flex-wrap gap-x-1">
                    <h3 className="font-semibold">Comment:</h3>
                    <p className="text-dark-100">{dataTMDB.extra.comment}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {props.data && (
          <div className="mt-[5rem] mb-[3rem] h-full w-full">
            <Slider
              id={props.data.id}
              type={
                queryType === "movie" || queryType === "tv" ? queryType : "all"
              }
              request={
                queryType === "movie" || queryType === "tv"
                  ? "similar"
                  : "trending"
              }
            />
          </div>
        )}
      </main>
    </>
  );
};

export default TitleDetail;

type ServerSideProps =
  | (any & TitleType)
  | {
      notFound: boolean;
      error: {
        message: string;
      };
    };
export const getServerSideProps: GetServerSideProps<
  ServerSideProps
> = async context => {
  try {
    const type = context.query.titleId;
    const id = context.query.i;

    const urlOMDB =
      context.query.titleId &&
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API}&i=${context.query.titleId[0]}`;

    const urlTMDB = `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API}&language=en-US`;

    const url = id ? urlTMDB : urlOMDB || "";
    const res = await fetch(url, {
      next: {
        revalidate: 60 * 60 * 4,
      },
    });
 
    const data = await res.json();

    if (data.success === false || data.Response === "False") {
      return {
        notFound: true,
      };
    }

    const detailResponse = await fetch(
      `https://api.themoviedb.org/3/find/${data.imdbID}?api_key=${process.env.TMDB_API}&language=en-US&external_source=imdb_id`
    );
    const titleDetails = await detailResponse.json();

    let safeId = id;

    for (const key in titleDetails) {
      if (titleDetails[key].length > 0) {
        const ourTitle = titleDetails[key][0];
        safeId = ourTitle.id;
        break;
      }
    }

    let safeType = type && type[0];
    if (data && data.Type) {
      if (data.Type === "movies" || data.Type === "movie") safeType = "movie";
      if (data.Type === "series") safeType = "tv";
    }

    const getId = data.id || safeId || data.imdbID
    
    const titleVideosResponse = await fetch(
      `https://api.themoviedb.org/3/${safeType}/${getId}/videos?api_key=${process.env.TMDB_API}&language=en-US&external_source=imdb_id`
    );
    const titleVideos = (await titleVideosResponse.json()).results || [];

    const possibleTypes = ['Official Trailer','Trailer', 'Teaser', 'Featurette', 'Clip', 'Behind-the-scenes', 'Interview', 'Review', 'Promo', 'Bloopers', 'Deleted Scenes', 'Making Of', 'Fan Reactions', 'Music Video', 'Sneak Peek', 'Recap', 'Highlight Reel'];

    /*
    //? Gets single, "best" video.
    const findBestVideo = (videos: any) => {
      if (!videos || videos.length === 0) return undefined

      if (videos[videos.length - 1].type.toLowerCase() === "trailer") 
        return videos[videos.length - 1]

      for (const type of possibleTypes) {
        const video = videos.find((v: { type: string; }) => v.type.toLowerCase() === type.toLowerCase());
        if (video) {
            return video;
        }
    }
      return videos ? videos[videos.length - 1] : undefined; 
    };

    const bestVideo = findBestVideos(titleVideos);

    const bestVideoURL = bestVideo?.site === 'YouTube' && `https://www.youtube.com/embed/${bestVideo.key}?cc_load_policy=1`
    */ 

    /*
    TODO:
    * Check YT video availability. 
    * Return first available video.
    */

    const findBestVideos = (videos: any[]) => {
      if (!videos || videos.length === 0) return [];
  
      const sortedVideos: any[] = [];
  
      for (const type of possibleTypes) {
          const matchingVideos = videos.filter((video: any) => {
              return video.type.toLowerCase() === type.toLowerCase();
          });
          sortedVideos.push(...matchingVideos);
  
          // Remove matched videos from the original array
          videos = videos.filter((video: any) => {
              return !matchingVideos.includes(video);
          });
      }
  
      // Add any remaining videos to the end of the sorted array
      sortedVideos.push(...videos);
  
      return sortedVideos;
  };
  
    const getBestVideo = async (videos: any[]) => {
      if (!videos || videos.length === 0) return null;
  
      const youtubeBaseUrl = 'https://www.youtube.com/embed/';
      const youtubeParams = 'cc_load_policy=1'

      //! Doesn't work as expected. 
      const checkVideoAvailability = async (url: string) => {
          try {
              const response = await fetch(url, { method: 'HEAD' });
              return response.ok;
          } catch (error) {
              return false;
          }
      };
  
      for (const video of videos) {
          if (video.site !== "YouTube") return
          const videoUrl = `${youtubeBaseUrl}${video.key}?${youtubeParams}`;
          // Check if the video URL is working
          if (await checkVideoAvailability(videoUrl)) {
              return videoUrl;
          }
      }
  
      return null; // No working video found
  };
  
    const bestVideoURL = await getBestVideo(findBestVideos(titleVideos));  
  
    return {
      props: {
        data: { ...data, type: safeType, id: getId, videoURL: bestVideoURL },
      },
    };
  } catch (e: any) {
    console.error(e.message);
    return {
      notFound: true,
      props: {
        error: {
          message: e.message,
        },
      },
    };
  }
};
