import Head from 'next/head';

interface CustomHeadProps {
  title?: string,
  description?: string,
  image?: string,
  keywords?: string,
}
const SITE_NAME = "Watching Assistant"
const KEYWORDS = "Watching Assistant, Watchlist, Manage Watchlist, watching, assistant, movies, tv shows, "

const CustomHead = ({ 
    title = SITE_NAME,
    description = "Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode.",
    image = `${process.env.NEXT_PUBLIC_URL}/thumbnail.png`,
    keywords = "Movie Watchlist, TV Show Watchlist, Track Movies and TV Shows, Personalized Watchlist, Watchlist Management Tool, Movie Tracker, TV Show Tracker, Currently Watching Movies, Currently Watching TV Shows, Movies I Am Watching, TV Shows I Am Watching, On-Hold Movies, On-Hold TV Shows, Movies to Watch, TV Shows to Watch, Movies I've Dropped, TV Shows I've Dropped, Completed Movies, Completed TV Shows, How to Track Movies and TV Shows, Best Movie Watchlist Management Tools"
}: CustomHeadProps): JSX.Element => {
  return (
    <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
            name="description"
            content={description}
        />
        <meta
            name="keywords"
            content={KEYWORDS + keywords}
        />
        <meta property="og:title" content={title} />
        <meta
            property="og:description"
            content={description}
        />
        <meta
            property="og:image"
            content={image}
        />
        <meta property="og:type" content="website" />
        <meta property="og:domain" content={process.env.NEXT_PUBLIC_URL} />
        <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default CustomHead;
