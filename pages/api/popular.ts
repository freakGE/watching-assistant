import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const page = req.query.page;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API}&language=en-US&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    return res.json(data);
  } catch (e) {
    console.error(e);
  }
}
