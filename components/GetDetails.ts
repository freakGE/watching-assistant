export const getDetails = async (type: string, id: string) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/api/details?type=${type}&id=${id}`;
  const res = await fetch(url);
  return await res.json();
};
