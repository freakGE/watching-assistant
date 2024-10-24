import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

type PaginationProps = {
  totalPages?: number | undefined;
};
const Pagination = ({ totalPages = 500 }: PaginationProps): JSX.Element => {
  const router = useRouter();
  const page = Number(router.query.page || 1);
  
  const handleClick = () => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 325);
  };

  return (
    <>
      {Number(page) > totalPages && (
        <h1 className="my-[3rem] flex w-full items-center justify-center text-xl font-semibold">
          Page must be less than or equal to{" "}
          <span className="indent-1 italic text-highlight-cyan">
            {totalPages}
          </span>
        </h1>
      )}
      {Number(page) <= 0 && (
        <h1 className="my-[3rem] flex w-full items-center justify-center text-xl font-semibold">
          Page must be greater than{" "}
          <span className="indent-1 italic text-highlight-cyan">zero</span>
        </h1>
      )}
        {totalPages && totalPages > 1 && (
        <div className="my-[3rem] flex items-center justify-center gap-x-[1rem] font-semibold">
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page > totalPages ? totalPages : page - 1,
              },
            }}
            scroll={false}
            onClick={e =>handleClick()}
            className={`${
              page <= 1 && "hidden"
            } h-[3rem] w-[3rem] rounded-full bg-dark-150 duration-300 hover:text-highlight-cyan flex justify-center items-center`}
          >
            <svg
              className="h-full w-full"
              fill="currentcolor"
              stroke="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
            </svg>
          </Link>
          <Link        
            href={{
                pathname: router.pathname,
                query: {
                  ...router.query,
                  page: page > totalPages ? totalPages - 1 : page - 2,
                },
            }}
            scroll={false}
            onClick={e =>handleClick()}
            className={`${page - 2 <= 0 && "hidden"}
        h-[3rem] w-[3rem] rounded-full bg-dark-150 duration-300 hover:text-highlight-cyan flex justify-center items-center
        `}
          >
            {page > totalPages ? totalPages - 1 : page - 2}
          </Link>
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page > totalPages ? totalPages : page - 1,
              },
            }}
            scroll={false}
            onClick={e =>handleClick()}
            className={`${page - 1 <= 0 && "hidden"}
        h-[3rem] w-[3rem] rounded-full bg-dark-150 duration-300 hover:text-highlight-cyan flex justify-center items-center
        `}
          >
            {page > totalPages ? totalPages : page - 1}
          </Link>
          <Link
          href={{
            pathname: router.pathname,
            query: {
              ...router.query,
              page: page
            }
          }}
          scroll={false}
          onClick={e =>handleClick()}
          className="h-[3rem] w-[3rem] rounded-full bg-highlight-cyan text-lg text-dark-150 duration-300 hover:bg-opacity-[92.5%] flex justify-center items-center">
            {page}
          </Link>
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page <= 0 ? 1 : Number(page) - 1 + 2,
              },
            }}
            scroll={false}
            onClick={e =>handleClick()}          
            className={`${
              totalPages && Number(page) - 1 + 2 > totalPages && "hidden"
            }
        h-[3rem] w-[3rem] rounded-full bg-dark-150 duration-300 hover:text-highlight-cyan flex justify-center items-center
        `}
          >
            {page <= 0 ? 1 : Number(page) - 1 + 2}
          </Link>
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page <= 0 ? 2 : Number(page) - 1 + 3,
              },
            }}
            scroll={false}
            onClick={e =>handleClick()}           
            className={`${
              totalPages && Number(page) - 1 + 3 > totalPages && "hidden"
            }
        h-[3rem] w-[3rem] rounded-full bg-dark-150  duration-300 hover:text-highlight-cyan flex justify-center items-center
        `}
          >
            {page <= 0 ? 2 : Number(page) - 1 + 3}
          </Link>
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page <= 0 ? 1 : Number(page) - 1 + 2,
              },
            }}
            scroll={false}
            onClick={e =>handleClick()}              
            className={`${
              totalPages && Number(page) - 1 + 2 >= totalPages && "hidden"
            }
            h-[3rem] w-[3rem] rounded-full bg-dark-150 duration-300 hover:text-highlight-cyan flex justify-center items-center
        `}
          >
            <svg
              className="h-full w-full"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            </svg>
          </Link>
        </div>
      )}
    </>
  );
};

export default Pagination;
