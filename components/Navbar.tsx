/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import logo from "@/public/movie-logo.png";
import Link from "next/link";
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAppState } from "./AppState";
import useWindowDimensions from "./WindowDimensions";
import dynamic from "next/dynamic";
const Spinner = dynamic(() => import("../components/Spinner"));
const LazyImage = dynamic(() => import("../components/LazyImage"), {
  loading: () => (
    <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
  ),
});

type movieTypes = {
  Title: string;
  Year: string | number;
  imdbID: string;
  Type: string;
  Poster: string;
};

const searchMovie = async (search: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/search?q=${search}`
  );

  const data = await response.json();
  return data;
};

const Navbar = () => {
  const { status, data } = useSession();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const { currentSearch, setCurrentSearch } = useAppState();
  const search = currentSearch;
  const scrollableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedInput, setFocusedInput] = useState(false);
  const [movies, setMovies] = useState<movieTypes[] | null>(null);
  const [visibleInput, setVisibleInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<boolean>(false);
  const [trackMouse, setTrackMouse] = useState<[number, number]>([0, 0]);
  const [trackScroll, setTrackScroll] = useState<number | null>(null);
  const [type, setType] = useState<string>("All");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollUp, setScrollUp] = useState(true);
  const [visibleBorder, setVisibleBorder] = useState(false);
  const [options, setOptions] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    if (search.length < 1) return;
    const spaceRemoved = search.trim().replace(/ /g, "+");
    const safeSearch = encodeURI(spaceRemoved);
    let safeType: string;
    switch (type) {
      case "TV Shows":
        safeType = "type=tv&";
        break;
      case "Movies":
        safeType = "type=movie&";
        break;
      case "People":
        safeType = "type=person&";
        break;
      default:
        safeType = "";
    }

    router.push(
      `${process.env.NEXT_PUBLIC_URL}/results?${safeType}search=${safeSearch}`
    );
    setCurrentSearch("");
    setMovies(null);
    setVisibleInput(false);
    setFocusedInput(false);
  };

  const handleClick = (id: string) => {
    router.push({
      pathname: `/title/[titleId]`,
      query: { titleId: id },
    });
    setCurrentSearch("");
    setMovies(null);
    setVisibleInput(false);
    setFocusedInput(false);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    if (!scrollableRef.current) {
      return;
    }

    event.preventDefault();
    const yDiff = startY - event.clientY;
    setScrollTop(prevScrollTop => prevScrollTop + yDiff);
    setStartY(event.clientY);
    scrollableRef.current.scrollTo(0, scrollTop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  useEffect(() => {
    const addMovies = async () => {
      const safeSearch = search.trim();
      const searchData = await searchMovie(safeSearch);

      if (searchData.Response === "True") {
        startTransition(() => {
          setMovies(searchData.Search);
        });
      }
    };
    setTimeout(() => addMovies(), 250);
  }, [search]);

  useEffect(() => {
    const threshold = 0;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      if (scrollY <= 50) {
        setScrollUp(true);
        setVisibleBorder(false);
      } else {
        if (scrollY > lastScrollY) {
          setScrollUp(false);
        } else {
          setScrollUp(true);
          setVisibleBorder(true);
        }
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollUp]);

  return (
    <div
      className={`wrapper-container fixed top-0 z-[9998] flex h-[5rem] justify-center border-b bg-dark-300 py-5  duration-200 ${
        visibleBorder && "shadow-lg"
      }`}
      style={{
        transform: scrollUp ? "translateY(0%)" : "translateY(-100%)",
        borderColor: visibleBorder ? "rgb(151 155 176)" : "transparent",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="absolute top-0  z-[4] flex h-[5rem] w-full items-center justify-center border-b border-dark-100 bg-dark-200 duration-200 sm:hidden"
        style={{
          zIndex: visibleInput ? 1 : 0,
          opacity: visibleInput ? 100 : 0,
        }}
      >
        <input
          ref={inputRef}
          value={search}
          onChange={({ target }) => {
            setCurrentSearch(target.value);
          }}
          type="text"
          onFocus={() => {
            setFocusedInput(true);
          }}
          placeholder="Search"
          className="wrapper absolute top-0 z-[1] ml-[4.5rem] h-full bg-transparent pr-[2.5rem] text-xl duration-200"
        />

        <div className="wrapper relative flex items-center">
          <div className={`absolute left-0 z-[2] w-[2rem]`}>
            <div
              className="relative flex w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 py-2 text-lg shadow-md 
              duration-200 hover:text-highlight-cyan"
              onClick={e => {
                setTrackMouse([e.clientX, e.clientY]);
                setTrackScroll(window.pageYOffset);
                setDropdown(!dropdown);
              }}
            >
              <button
                type="button"
                className="flex h-full w-full items-center justify-center hover:text-highlight-cyan"
              >
                <svg
                  stroke="currentColor"
                  className="w-[1rem] rounded-md bg-dark-150 fill-current duration-200 "
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path>
                </svg>
              </button>
              <div
                ref={dropdownRef}
                className="absolute top-[2.5rem] left-0 z-[2] w-[6rem] overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-base text-light-100 shadow-lg duration-300 2exs:text-[0.9rem] 2xs:text-sm sm:top-[0rem] sm:w-full xl:text-base"
                style={{
                  borderWidth: dropdown
                    ? visibleInput
                      ? "1px"
                      : "0px 1px 1px 1px"
                    : "0px",
                  borderColor: dropdown ? "rgb(47 214 181)" : "transparent",
                  height: dropdown
                    ? dropdownRef?.current?.scrollHeight
                      ? dropdownRef.current.scrollHeight
                      : "max-content"
                    : 0,
                }}
              >
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  All
                </div>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  TV Shows
                </div>
                <div
                  className="overflow-hidden  text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150 active:text-highlight-cyan"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  Movies
                </div>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  People
                </div>
              </div>
            </div>
          </div>
          <button
            type="reset"
            className="absolute right-0 z-[2] duration-500"
            onClick={() => {
              setCurrentSearch("");
              setFocusedInput(false);
              setVisibleInput(false);
            }}
          >
            <svg
              stroke="currentColor"
              className="w-[2rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
            </svg>
          </button>
        </div>
      </form>

      <div className="flex w-11/12 max-w-[80rem] items-center justify-between md:w-10/12">
        <Link
          href={"/"}
          scroll
          shallow
          className="relative flex w-max items-end pl-[2.15rem] text-2xl font-bold"
        >
          <Image
            priority
            src={logo}
            alt="Logo"
            placeholder="blur"
            className="absolute left-0 w-[2rem] invert"
          />
          WA
        </Link>

        <form
          className={`relative flex w-[25rem] items-center justify-center md:w-[27.5rem] ${
            status === "unauthenticated"
              ? "ml-0"
              : "mr-[0.5rem] md:ml-[1.5rem] 2md:mr-0 2md:ml-[5.75rem] lg:ml-[10rem]"
          }`}
          onSubmit={handleSubmit}
        >
          <div
            className={`absolute left-0 z-[3] hidden w-[2rem] sm:block md:left-[-1rem] md:w-[3rem] 2md:left-[-5.5rem] 2md:w-[7.5rem]`}
          >
            <div
              className="relative flex w-full cursor-pointer items-center justify-center rounded-md bg-dark-150 py-2 text-lg text-dark-100 shadow-md duration-200 hover:text-highlight-cyan"
              onClick={e => {
                setTrackMouse([e.clientX, e.clientY]);
                setTrackScroll(window.pageYOffset);
                setDropdown(!dropdown);
              }}
            >
              <span className="text-current 2md:hidden">
                <svg
                  className="h-[1rem] w-[1rem]"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path>
                </svg>
              </span>
              <h4 className="hidden flex-nowrap items-center font-[500] 2md:flex">
                {type}
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
              </h4>
              <div
                ref={dropdownRef}
                className="absolute top-[59px] z-[2] w-[7.5rem] overflow-hidden rounded-md border-highlight-cyan bg-dark-300 text-base text-light-100 shadow-lg duration-1000  sm:top-[2.75rem] 2md:top-0"
                style={{
                  borderWidth: dropdown ? "1px" : "0px",
                  borderColor: dropdown ? "rgb(47 214 181)" : "transparent",
                  height: dropdown
                    ? dropdownRef?.current?.scrollHeight
                      ? dropdownRef.current.scrollHeight
                      : "max-content"
                    : 0,
                }}
              >
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  All
                </div>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  TV Shows
                </div>
                <div
                  className="overflow-hidden  text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150 active:text-highlight-cyan"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  Movies
                </div>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-md py-1 px-2 duration-200 hover:bg-dark-150"
                  onClick={e => setType(e.currentTarget.innerText)}
                >
                  People
                </div>
              </div>
            </div>
          </div>

          <label
            className={`absolute left-0 ml-[2.5rem] hidden  translate-x-[8px] bg-dark-300 px-2 text-lg text-dark-100 text-opacity-100 duration-300 sm:block
            ${
              (search.length > 0 || focusedInput) &&
              `translate-y-[-22px] text-sm`
            }
            ${focusedInput && "text-highlight-cyan"}
            ${!focusedInput && search.length > 0 && "text-opacity-50"} 
            `}
            htmlFor="username"
            onClick={() => inputRef?.current?.focus()}
          >
            Search
          </label>

          <input
            ref={inputRef}
            value={search}
            onChange={({ target }) => {
              setCurrentSearch(target.value);
            }}
            type="text"
            onFocus={() => {
              setFocusedInput(true);
            }}
            onBlur={() => {
              setFocusedInput(false);
            }}
            className="ml-[2.5rem] hidden w-full rounded-md border border-dark-100 bg-transparent p-2 duration-200 focus:border-highlight-cyan sm:block"
          />

          <div
            ref={scrollableRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute top-[calc(2.5rem-1px)] ml-[3.2rem] w-screen cursor-grab select-none overflow-y-scroll scroll-smooth rounded-md rounded-t-none border-dark-100 bg-dark-200 duration-500
            active:cursor-grabbing xs:w-[83.5vw] sm:top-[3rem] sm:right-0 sm:ml-0 sm:w-[calc(100%-2.5rem)] sm:rounded-t-md sm:bg-dark-300"
            style={{
              height: movies && search ? "18rem" : 0,
              borderWidth: movies && search ? "1px" : 0,
            }}
          >
            <Suspense
              fallback={
                <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
              }
            >
              {movies &&
                movies.map(
                  ({ Title, Poster, Type, Year, imdbID }: movieTypes, i) => {
                    return (
                      <div
                        key={imdbID}
                        className={`flex border-dark-100 p-2 ${
                          i !== 0 && "border-t"
                        } duration-200 hover:bg-dark-200`}
                        onClick={() => handleClick(imdbID)}
                      >
                        <div className="min-[5rem] relative flex h-[5rem] w-[4rem] min-w-[4rem] items-center justify-center overflow-hidden rounded-md">
                          {search && (
                            <LazyImage
                              navbar
                              src={Poster}
                              alt={Title}
                              unoptimized={true}
                              className="absolute flex h-full w-full scale-100 items-center justify-center rounded-md bg-dark-150 text-center text-sm font-semibold text-dark-100 duration-[250ms]"
                              draggable={false}
                            />
                          )}
                        </div>
                        <div className="ml-2">
                          {search && <h3>{Title}</h3>}
                          <div className="flex items-center gap-x-1">
                            {search && (
                              <p>{Type === "series" ? "TV" : "Movie"}</p>
                            )}
                            <span className="h-[3px] w-[3px] rounded-full bg-dark-100" />
                            {search && (
                              <p>
                                {Year.toString().endsWith("–")
                                  ? Year.toString().substring(
                                      0,
                                      Year.toString().length - 1
                                    )
                                  : Year}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
            </Suspense>
          </div>

          <button
            type="reset"
            className="absolute hidden duration-500 sm:block"
            style={{
              opacity: movies && search ? 100 : 0,
              right: movies && search ? "2.5rem" : 0,
            }}
            onClick={() => {
              setCurrentSearch("");
            }}
          >
            <svg
              stroke="currentColor"
              className="w-[1.5rem] rounded-md bg-dark-150 fill-dark-100 duration-200 hover:fill-highlight-pink"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
            </svg>
          </button>

          <button
            type={
              (width && width >= 640) || focusedInput || visibleInput
                ? "submit"
                : "button"
            }
            className={`absolute flex h-[42px] w-[2rem] cursor-pointer items-center justify-center rounded-md border-0 bg-dark-300 text-dark-100 duration-200 hover:bg-dark-150 hover:text-highlight-cyan sm:w-[2.5rem]
            sm:rounded-l-none sm:border 
            sm:border-l-0 sm:hover:bg-dark-300 ${
              status === "unauthenticated"
                ? "right-1 sm:right-0"
                : "right-[-0.5rem] sm:right-0"
            }`}
            style={{
              borderColor: focusedInput
                ? "rgb(47 214 181)"
                : "rgb(151 155 176)",
            }}
            onClick={() => {
              if (!width || width >= 640) return;
              setVisibleInput(true);
              inputRef?.current?.focus();
            }}
          >
            <svg
              className="w-[1.5rem] duration-200"
              stroke={focusedInput ? "rgb(47 214 181)" : "currentColor"}
              strokeWidth="0"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                strokeMiterlimit="10"
                strokeWidth="32"
                d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z"
              ></path>
              <path
                fill="none"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="32"
                d="M338.29 338.29L448 448"
              ></path>
            </svg>
          </button>
        </form>

        {status === "unauthenticated" ? (
          <Link
            href={"/auth/signin"}
            className="z-[0] flex h-full  items-center justify-center whitespace-nowrap rounded-md bg-highlight-pink px-2 text-sm font-semibold text-light-100 sm:text-base"
          >
            Log In
          </Link>
        ) : (
          <div className="relative flex h-full items-center ">
            <Link
              href={"/watchlist"}
              className="relative z-[0] mr-[3.5rem] flex h-full items-center justify-center  whitespace-nowrap text-sm font-[500] text-light-100 duration-300 hover:text-opacity-[85%] active:text-dark-100 sm:text-base"
            >
              Watchlist
              <span
                className={`
              absolute bottom-1.5 h-0.5  bg-highlight-cyan duration-300 sm:bottom-1
              ${router.asPath === "/watchlist" ? "w-[100%]" : "w-[0%]"}
              `}
              />
            </Link>

            <button
              className={`absolute right-0 z-[0] h-[2.5rem] w-[2.5rem] overflow-hidden rounded-full bg-dark-200 text-2xl md:h-[2.75rem] md:w-[2.75rem] md:text-[1.75rem] md:leading-9 xl:text-3xl  ${
                data?.user?.image ? "ring-0" : "ring-2"
              } ring-dark-150 duration-200 hover:ring-4 `}
              // onClick={() => signOut()}
              onClick={() => setOptions(!options)}
            >
              {data?.user?.image ? (
                <Image
                  unoptimized={true}
                  alt={
                    (data?.user?.name && data?.user?.name[0].toUpperCase()) ||
                    "Profile"
                  }
                  fill
                  src={data?.user?.image}
                  className="flex scale-100 items-center justify-center bg-dark-100 duration-200 hover:scale-110"
                />
              ) : (
                data?.user?.name && data?.user?.name[0].toUpperCase()
              )}
            </button>

            <div
              className={`absolute z-[-1] flex items-center justify-center overflow-hidden whitespace-nowrap  rounded-md text-sm text-light-100 duration-300 sm:text-base ${
                options
                  ? "right-0 h-full translate-y-[125%] scale-100"
                  : "right-[-1.5rem] h-0 translate-y-[0%] scale-[25%]"
              }`}
            >
              <button
                onClick={() =>
                  signOut({
                    callbackUrl: `${process.env.NEXT_PUBLIC_URL}`,
                  })
                }
                className="rounded-md bg-highlight-pink p-2 font-semibold shadow-sm duration-300 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
