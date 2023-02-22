import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const NotFound = () => {
  const router = useRouter();
  const [animationValue, setAnimationValue] = useState(0);
  const [isFlashing, setIsFlashing] = useState(true);

  const handleClick = () => router.push("/");

  const startAnimation = (index: number) => {
    let interval = setInterval(() => {
      index++;
      if (index > 10) {
        index = 1;
      }
      setAnimationValue(index);
      if (index >= 10) {
        clearInterval(interval);
        setIsFlashing(true);
      }
    }, Math.floor(Math.random() * 1001) + 250);
  };

  useEffect(() => {
    if (!isFlashing) return;
    setTimeout(() => {
      setAnimationValue(1);
      setIsFlashing(false);
      setTimeout(() => {
        setAnimationValue(2);
        setTimeout(() => {
          startAnimation(animationValue);
        }, 750);
      }, 500);
    }, 500);
  }, [isFlashing]);
  return (
    <>
      <Head>
        <title>404 - Page Not found</title>
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
      <main className="wrapper-container mt-[6rem] min-h-[calc(100vh-6rem-100px)] sm:mt-[5rem] sm:min-h-[calc(100vh-5rem-100px)]">
        <div className="absolute z-[-1] h-[40%] w-full max-w-[40rem] md:w-2/3">
          <div className="relative h-full w-full">
            <span
              className={`absolute left-[50%] z-[3] h-[2.5rem] w-[5.5rem] translate-x-[-50%] rounded-b-md bg-gradient-to-b from-dark-300 via-dark-200 to-dark-150 duration-150 ${
                animationValue > 0
                  ? "translate-y-0"
                  : "translate-y-[-150%] md:translate-y-[-100%]"
              }`}
            />
            <span className="absolute z-[2] h-full w-1/2 translate-x-[-66%] translate-y-[-60%] rotate-[35deg] scale-[200%] bg-dark-300" />
            <span className="absolute right-0 z-[2] h-full w-1/2 translate-x-[66%] translate-y-[-60%] rotate-[-35deg] scale-[200%] bg-dark-300" />
            <span
              className={`absolute left-0 z-[1] w-full bg-gradient-to-b from-highlight-pink to-dark-300 duration-[250ms] ${
                animationValue > 1
                  ? animationValue % 2 == 0
                    ? "h-full animate-pulse"
                    : "h-full"
                  : "h-0"
              }`}
            />
            <span className="absolute z-[3] w-full translate-y-[47.5%] text-center text-[12.5rem] text-dark-300">
              404
            </span>
          </div>
        </div>
        <div className="wrapper relative flex items-center justify-center">
          {/* <span className="absolute z-[-1] animate-pulse text-[17.5rem] text-highlight-pink text-opacity-[75%]">
            404
          </span> */}
          <button
            className="absolute left-0 top-0 z-[5] rounded-full text-highlight-cyan duration-[250ms] hover:text-opacity-[85%] active:text-opacity-[95%] 3xs:hidden"
            onClick={handleClick}
          >
            <svg
              className="h-[2.5rem] w-[2.5rem] rounded-full border-2 border-current"
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
          <p className="max-w-[40rem] text-center text-2xl">
            <span className="relative inline font-semibold text-highlight-cyan">
              Oops!
              <button
                className="absolute left-0 z-[5] hidden translate-x-[-111%] translate-y-[-11%] rounded-full text-highlight-cyan duration-[250ms] hover:text-opacity-[85%] active:text-opacity-[95%] 3xs:inline"
                onClick={handleClick}
              >
                <svg
                  className="h-[2.5rem] w-[2.5rem] rounded-full border-2 border-current"
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
            </span>{" "}
            This is awkward... You are looking for something that doesn&apos;t
            actualy exist.
          </p>
        </div>
      </main>
    </>
  );
};

export default NotFound;
