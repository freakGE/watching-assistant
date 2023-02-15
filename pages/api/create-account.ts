// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
clientPromise;
import bcryptOperation from "@/lib/Bcrypt";

type Account = {
  email: string;
  name: string;
  password: string;
  accountType: string;
  emailVerified: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("users");

    const data = req.body as Account;

    const password = data.password;
    const hashedPassword = await bcryptOperation({ type: "hash", password });
    data.password = hashedPassword.toString();

    const response = await collection.insertOne(data);

    return res.json(response);
  } catch (e) {
    console.error(e);
  }
}
