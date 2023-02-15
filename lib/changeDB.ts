import { saveToDatabaseProps } from "@/lib/types";
import { signIn } from "next-auth/react";

export const changeDB = async ({
  variant,
  user,
  title,
  remove,
  extra,
}: saveToDatabaseProps) => {
  try {
    if (!user) signIn();
    const url = process.env.NEXTAUTH_URL;
    const response = await fetch(`${url}/api/update-db`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variant,
        user,
        title,
        remove,
        extra,
      }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return err;
  }
};
