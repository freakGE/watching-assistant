import router from "next/router";
import { signIn } from "next-auth/react";
import { saveToDatabaseProps } from "@/lib/types";
import { fixVariant } from "./getMovies";

export const refreshData = () => {
  router.replace(router.asPath, undefined, { scroll: false });
};

export const changeDB = async ({
  variant,
  user,
  title,
  remove,
  extra,
}: saveToDatabaseProps) => {
  try {
    if (!user) signIn();
    const url = process.env.NEXT_PUBLIC_URL;
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
    return "An error occurred";
  }
};

export const updateCache = async (titleId: string, variant: saveToDatabaseProps["variant"]) => {
  let cachedVariants = JSON.parse(localStorage.getItem('cachedVariants') || '{}');

  const fixedVariant = fixVariant(variant)
  cachedVariants[titleId] = {
    variant: fixedVariant,
    timestamp: Date.now()
  };

  localStorage.setItem('cachedVariants', JSON.stringify(cachedVariants));
};

export const removeFromCache = async (titleId: string) => {
  let cachedVariants = JSON.parse(localStorage.getItem('cachedVariants') || '{}');

  if (cachedVariants[titleId]) {
    delete cachedVariants[titleId];
    localStorage.setItem('cachedVariants', JSON.stringify(cachedVariants));
  }
};

export const addToDB = async (
  variant: saveToDatabaseProps["variant"],
  title: any,
  user: any,
  setDropdown: (value: any) => void,
) => {
  await changeDB({
      variant,
      user,
      title,
  });

  await updateCache(title.id, variant);

  refreshData();

  setDropdown(null);

  setTimeout(() => {
      setDropdown(title.id);
      setTimeout(() => setDropdown(null), 1000);
  }, 750);
};

export const removeFromDB = async (
  variant: saveToDatabaseProps["variant"],
  title: any,
  user: any,
  setDropdown: (value: any) => void,
) => {
  await changeDB({
      variant,
      user,
      title,
      remove: true,
  });

  await removeFromCache(title.id);

  refreshData();

  setDropdown(null);

  setTimeout(() => {
      setDropdown(title.id);
      setTimeout(() => setDropdown(null), 1000);
  }, 750);
};