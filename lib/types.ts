export type MoviesPopularType = {
  length: number;
  poster_path: string | null;
  adult: boolean;
  overview: string;
  release_date: string;
  genre_ids: number[];
  id: number;
  original_title: string;
  original_language: string;
  title: string;
  backdrop_path: string | null;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
};

export type MoviesType = {
  popular: {
    page: number;
    results: MoviesPopularType[];
    total_results: number;
    total_pages: number;
  };
};

export type SearchMovieTypes = {
  poster_path: string | null;
  adult: boolean;
  overview: string;
  release_date: string;
  genre_ids: number[];
  id: number;
  media_type: string;
  original_title: string;
  original_language: string;
  title: string;
  backdrop_path: string | null;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
};

export type SearchTvTypes = {
  poster_path: string | null;
  popularity: number;
  id: number;
  overview: string;
  backdrop_path: string | null;
  vote_average: number;
  media_type: string;
  first_air_date: string;
  origin_country: string[];
  genre_ids: number[];
  original_language: string;
  vote_count: number;
  name: string;
  original_name: string;
};

export type SearchPersonTypes = {
  profile_path: string | null;
  adult: boolean;
  id: number;
  media_type: string;
  known_for: SearchMovieTypes | SearchTvTypes;
  name: string;
  popularity: number;
};

export type SearchMultiTypes = {
  page: number;
  results: (SearchMovieTypes | SearchTvTypes | SearchPersonTypes)[];
  total_results: number;
  total_pages: number;
};

export type TrendingTypes = {
  page: number;
  results: {
    variant: any;
    poster_path: string | null;
    adult: boolean;
    overview: string;
    release_date: string;
    first_air_date: string;
    genre_ids: number[];
    id: number;
    original_title: string;
    original_language: string;
    title: string;
    name: string;
    backdrop_path: string | null;
    popularity: number;
    vote_count: number;
    video: boolean;
    length: number;
    vote_average: number;
  }[];
  total_results: number;
  total_pages: number;
};

export type TitleType = {
  title: string;
  backdrop_path?: string;
  poster: string;
  genres?: string[];
  collection?: { id: number; name: string };
  budget?: number;
  homepage?: string; // Website
  id?: number;
  imbd_id: string;
  overview: string; // Plot
  popularity: number; // imdbVotes
  production: {
    logo_path?: string;
    name?: string;
  }[];
  released: string;
  runtime: string; // in minutes
  languages: string[];
  tagline?: string;
  director?: string[];
  writer?: string[];
  actors?: string[];
  rating: string; //vote_average || imdbRating
  type?: string;
  box_office?: string;
  success?: boolean;
  status_code?: number;
  status_message?: string;
};

export type saveToDatabaseProps = {
  variant: "watching" | "on-hold" | "to-watch" | "dropped" | "completed";
  user: any;
  title: any;
  remove?: boolean;
  extra?: {
    season?: number;
    episode?: number;
    comment?: string;
    url?: string;
  };
};
