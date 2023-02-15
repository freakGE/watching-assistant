// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
clientPromise;
import bcryptOperation from "@/lib/Bcrypt";

type Account = {
  email: string;
  password: string;
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

    let response: {
      wrongEmail: boolean;
      wrongPassword: boolean | string;
    };

    const accFound = await collection.findOne({ email: data.email });

    if (!accFound) {
      response = { wrongEmail: true, wrongPassword: true };
      return res.json(response);
    }
    response = { wrongEmail: false, wrongPassword: true };

    const password = data.password;
    const hashedPassword = await bcryptOperation(
      { type: "compare", password },
      accFound.password
    );
    response = { ...response, wrongPassword: !hashedPassword };
    return res.json(response);
  } catch (e) {
    console.error(e);
  }
}
