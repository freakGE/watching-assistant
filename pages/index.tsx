/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState, useRef, useTransition } from "react";
import useWindowDimensions from "@/components/WindowDimensions";
import { GetServerSideProps } from "next";
import { MoviesType, MoviesPopularType } from "@/lib/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { changeDB } from "@/lib/changeDB";
import checkTitle from "@/lib/checkTitle";
import { saveToDatabaseProps } from "@/lib/types";
const Spinner = dynamic(() => import("@/components/Spinner"));
const LazyImage = dynamic(() => import("../components/LazyImage"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

import Slider from "@/components/Slider";
const Pagination = dynamic(() => import("@/components/Pagination"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

export default function Home(moviesData: {
  moviesData: MoviesType["popular"];
}) {
  const { width } = useWindowDimensions();
  const { status, data } = useSession();

  const [movies, setMovies] = useState<MoviesPopularType[]>([]);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  const [dropdownId, setDropdownId] = useState(null);

  const handleClick = async (title: any) => {
    const id = `${title.media_type}`;
    if (title.media_type === "person") {
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
    if (title.media_type === "movie") {
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
    if (title.media_type === "tv") {
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

  useEffect(() => {
    const updatedMovies = async () => {
      const session = await getSession();

      if (!session) {
        return moviesData.moviesData.results;
      }
      return await Promise.all(
        moviesData.moviesData.results.map(async movie => {
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
  }, [dropdownId, moviesData.moviesData.results, status]);

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
      <main className="wrapper-container mt-[6rem] min-h-[calc(100vh-6rem-100px)] flex-col items-center sm:mt-[5rem] sm:min-h-[calc(100vh-5rem-100px)]">
        <Slider top={true} />
        <div className="wrapper h-full duration-200">
          <div className="my-[2rem] grid grid-rows-1 gap-7 px-[2rem] 2exs:grid-cols-2 2exs:px-[0.5rem] 2xs:grid-cols-3 2xs:px-0 2md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {movies &&
              movies.map((movie: any, i: number) => {
                if (width && width > 1536) {
                  if (i >= movies.length - 2) return;
                }

                return (
                  <div
                    key={movie.id}
                    className=" flex flex-col rounded-md bg-dark-200 shadow-md duration-300 hover:shadow-xl"
                  >
                    <button
                      onClick={() => handleClick(movie)}
                      className="relative flex h-[17rem] items-center justify-center overflow-hidden rounded-t-md"
                    >
                      <LazyImage
                        src={
                          `https://image.tmdb.org/t/p/w500` + movie.poster_path
                        }
                        alt={movie.title}
                        className="absolute flex h-full w-full scale-100 items-center justify-center bg-dark-150 text-center text-sm font-semibold text-dark-100
                        duration-[250ms] hover:scale-110"
                        draggable={false}
                      />
                    </button>
                    <div className="relative w-full gap-2 rounded-md bg-dark-200 p-2">
                      <p className="flex items-center text-sm text-dark-100">
                        <svg
                          stroke="currentColor"
                          className="mr-[2px] h-[1rem] w-[1rem] fill-star"
                          strokeWidth="0"
                          viewBox="0 0 1024 1024"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>
                        </svg>
                        {Math.round(movie.vote_average * 10) / 10}
                      </p>
                      <div
                        onClick={() => handleClick(movie)}
                        className="box-orient relative my-1 h-[3rem] w-full select-text overflow-hidden text-ellipsis"
                      >
                        {movie.title || movie.name}
                      </div>
                      <div
                        className="relative flex h-[2.5rem] w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 shadow-md duration-200 hover:text-highlight-cyan"
                        onClick={e => {
                          setTrackMouse([e.clientX, e.clientY]);
                          setTrackScroll(window.pageYOffset);

                          dropdown === `${movie.id}`
                            ? setDropdown(null)
                            : setDropdown(`${movie.id}`);
                        }}
                      >
                        {movie.variant ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden duration-300">
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
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-y-[1rem] overflow-hidden duration-300">
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
                          </div>
                        )}
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
                );
              })}
          </div>
          <Pagination totalPages={moviesData.moviesData.total_pages} />
        </div>
      </main>
    </>
  );
}

type ServerSideType =
  | {
      moviesData:
        | MoviesType["popular"]
        | {
            errors: any[];
            success: boolean;
          };
    }
  | { notFound: boolean };

export const getServerSideProps: GetServerSideProps<
  ServerSideType
> = async context => {
  try {
    const page =
      context.query.page && parseInt(context.query.page.toString()) > 1000
        ? 1000
        : context.query.page || 1;

    // const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API}&language=en-US&page=${page}`;
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.TMDB_API}&language=en-US&page=${page}`;
    const res = await fetch(url, {
      next: {
        revalidate: 60 * 60 * 4,
      },
    });

    const moviesData: MoviesType["popular"] = await res.json();

    return {
      props: {
        moviesData,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        notFound: true,
      },
    };
  }
};
