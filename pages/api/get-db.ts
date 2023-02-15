import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("users");

  const userId = session && session.user && (session.user as any).id;
  const title = req.body.title;
  const full = req.query.full;

  const objectId = new ObjectId(userId);
  const user = await collection.findOne({ _id: objectId });

  if (!user) {
    return res.json({
      ok: false,
      error: "User not found",
      variant: null,
    });
  }

  if (full) {
    return res.json(user);
  }

  const variantsArray = [
    "watching",
    "on-hold",
    "to-watch",
    "dropped",
    "completed",
  ];

  for (const variant of variantsArray) {
    if (!user[variant]) {
      continue;
    }

    const index = user[variant].findIndex(
      (item: { id: any }) => item.id === title.id
    );
    if (index !== -1) {
      return res.json(user[variant][index]);
    }
  }

  return res.json(null);
}
