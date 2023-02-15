import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const type = req.query.type;
    const id = req.query.id;

    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API}&language=en-US`
    );
    const data = await response.json();

    return res.json(data);
  } catch (e) {
    console.error(e);
  }
}
