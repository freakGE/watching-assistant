// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const search = req.query.q;

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API}&r=json&page=1&s=${search}`
    );
    const data = await response.json();

    return res.json(data);
  } catch (e) {
    console.error(e);
  }
}
