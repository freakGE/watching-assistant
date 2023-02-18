import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";

const Spinner = dynamic(() => import("@/components/Spinner"), {
  loading: () => <div>Loading...</div>,
});

// const Slider = dynamic(() => import("@/components/Slider"), {
//   loading: () => (
//     <Spinner className="z-[1] w-[3.5rem] animate-spin text-dark-100" />
//   ),
// });
import Slider from "@/components/Slider";

function convertToReadableDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

const nameDetails = (props: any) => {
  const person = props.data;
  return (
    <>
      <Head>
        {person.name ? (
          <title>{person.name} - WA</title>
        ) : (
          <title>Watching Assistant</title>
        )}
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
      <main className="mt-[6rem] flex min-h-[calc(100vh-6rem)] w-screen flex-col items-center  sm:mt-[5rem]">
        <div className="wrapper mt-[1rem] flex h-full justify-center">
          <div className="flex h-full flex-col sm:flex-row sm:items-start sm:gap-x-[2rem]">
            <div className="flex w-full  flex-col items-center justify-center sm:w-[13rem] sm:items-start">
              <div className="relative h-[15.5rem] w-[13rem] lg:h-[16rem] 2xl:h-[17rem]">
                <Image
                  loading="lazy"
                  quality={100}
                  unoptimized={true}
                  alt={person.name}
                  src={
                    person.profile_path
                      ? `https://image.tmdb.org/t/p/w500` + person.profile_path
                      : "#"
                  }
                  fill
                  className="absolute left-0 h-[17rem] w-[13rem] scale-100 items-center justify-center rounded-md bg-dark-150 text-center text-sm font-semibold
              text-dark-100 duration-[250ms]"
                  draggable={false}
                />
              </div>
              <div className="flex w-full flex-col items-center justify-center  sm:items-start">
                <h3 className="my-2.5 hidden text-center text-xl text-[1.4rem] font-semibold sm:block sm:text-start">
                  {person.name}
                </h3>
                <div className="hidden flex-col sm:flex">
                  {person.birthday && (
                    <div className="flex flex-wrap gap-x-1">
                      <h3 className="font-semibold">Born:</h3>
                      <p className="text-dark-100">
                        {convertToReadableDate(person.birthday)}
                      </p>
                    </div>
                  )}
                  {person.deathday && (
                    <div className="hidden flex-wrap gap-x-1 sm:flex">
                      <h3 className="font-semibold">Died:</h3>
                      <p className="text-dark-100">
                        {convertToReadableDate(person.deathday)}
                      </p>
                    </div>
                  )}
                  {person.known_for_department && (
                    <div className="hidden flex-wrap gap-x-1 sm:flex">
                      <h3 className="font-semibold">Known for:</h3>
                      <p className="text-dark-100">
                        {person.known_for_department}
                      </p>
                    </div>
                  )}
                  {Math.round(person.popularity * 10) / 10 && (
                    <div className="hidden flex-wrap gap-x-1 sm:flex">
                      <h3 className="font-semibold">Score:</h3>
                      <p className="flex items-center justify-center text-dark-100">
                        {Math.round(person.popularity * 10) / 10}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center  sm:items-start">
              <h3 className="my-2.5 text-center text-xl text-[1.4rem] font-semibold sm:mt-0 sm:hidden sm:text-start">
                {person.name}
              </h3>
              <div className="flex flex-col sm:hidden">
                {person.birthday && (
                  <div className="flex flex-wrap gap-x-1">
                    <h3 className="font-semibold">Born:</h3>
                    <p className="text-dark-100">
                      {convertToReadableDate(person.birthday)}
                    </p>
                  </div>
                )}
                {person.deathday && (
                  <div className="flex flex-wrap gap-x-1 sm:hidden">
                    <h3 className="font-semibold">Died:</h3>
                    <p className="text-dark-100">
                      {convertToReadableDate(person.deathday)}
                    </p>
                  </div>
                )}
                {person.known_for_department && (
                  <div className="flex flex-wrap gap-x-1 sm:hidden">
                    <h3 className="font-semibold">Known for:</h3>
                    <p className="text-dark-100">
                      {person.known_for_department}
                    </p>
                  </div>
                )}
                {Math.round(person.popularity * 10) / 10 && (
                  <div className="flex flex-wrap gap-x-1 sm:hidden">
                    <h3 className="font-semibold">Score:</h3>
                    <p className="flex items-center justify-center text-dark-100">
                      {Math.round(person.popularity * 10) / 10}
                    </p>
                  </div>
                )}
              </div>

              {person.biography && (
                <div className="flex flex-col  gap-y-1 text-[0.95rem] text-dark-100">
                  {person.biography.split("\n").map((str: any, i: number) => {
                    let text = str.trim();
                    return (
                      <p
                        key={i}
                        className="mt-2 max-w-[50rem] indent-4 text-[0.95rem] text-dark-100 sm:mt-0"
                      >
                        {text}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-[5rem] mb-[3rem] w-full">
          <Slider />
        </div>
      </main>
    </>
  );
};

export default nameDetails;

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const id = context.query.nameId;

    const url = `https://api.themoviedb.org/3/person/${id}?api_key=${process.env.TMDB_API}&language=en-US`;

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

    return {
      props: {
        data,
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
