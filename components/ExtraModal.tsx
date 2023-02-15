import { changeDB } from "@/lib/changeDB";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { saveToDatabaseProps } from "@/lib/types";
import { useSession } from "next-auth/react";

type ExtraModalProps = {
  title: any;
  extra?: saveToDatabaseProps["extra"];
  onClose: () => void;
};

const isUrl = (str: string): boolean => {
  const pattern =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})/;

  return pattern.test(str);
};

const ExtraModal = ({
  title,
  extra,
  onClose,
}: ExtraModalProps): JSX.Element => {
  const { status, data } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const seasonRef = useRef<HTMLInputElement>(null);
  const episodeRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [extraForm, setExtraForm] = useState<
    saveToDatabaseProps["extra"] | undefined
  >(extra || undefined);
  const [focusedInput, setFocusedInput] = useState<
    "season" | "episode" | "comment" | "url" | null
  >(null);
  const [invalidURL, setInvalidURL] = useState(false);
  const [URLErrorHover, setURLErrorHover] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();

    if (extraForm?.url && extraForm.url.length > 0) {
      const validURL = isUrl(extraForm?.url || "");

      if (!validURL) {
        setInvalidURL(true);
        return;
      }
    }

    if (extraForm && extraForm !== extra) {
      let variant:
        | "watching"
        | "on-hold"
        | "to-watch"
        | "dropped"
        | "completed" = "watching";
      if (title.variant === "Watching") variant = "watching";
      if (title.variant === "On-Hold") variant = "on-hold";
      if (title.variant === "To Watch") variant = "to-watch";
      if (title.variant === "Dropped") variant = "dropped";
      if (title.variant === "Completed") variant = "completed";

      changeDB({
        variant,
        user: data?.user,
        title,
        extra: extraForm,
      });
    }

    setIsVisible(false);
    setTimeout(() => onClose(), 500);
  };

  useEffect(() => {
    if (!isVisible) return;
    const handleClick = (event: MouseEvent) => {
      const form = formRef.current;
      if (!form || !form.contains(event.target as Node)) {
        setIsVisible(false);
        setTimeout(() => onClose(), 500);
      }
    };

    document.body.addEventListener("click", handleClick);
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [isVisible]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 z-[50] flex h-screen w-screen items-center justify-center duration-300
    ${isVisible ? "backdrop-blur-[2px]" : "backdrop-blur-[0px]"}
    `}
    >
      <form
        ref={formRef}
        className={`z-[1] flex h-auto max-h-[525px] w-11/12 max-w-[25rem]  flex-col justify-center rounded-md border border-dark-100 bg-dark-200 py-[4rem] px-[2.5rem] shadow-lg duration-500
        ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}
        
        `}
        onSubmit={handleSubmit}
      >
        <h1
          className={`border-dark-100 text-center text-2xl
        ${
          title.type === "movie" || title.Type === "movie"
            ? "mb-[1rem] border-b-0 pb-[0rem]"
            : "mb-[0.5rem] border-b pb-[0.5rem]"
        }
        `}
        >
          {title.name || title.title || title.Title}
        </h1>

        {(title.type === "tv" || title.Type === "series") && (
          <div className="mb-5 flex h-full w-full items-center justify-center text-3xl">
            <div className="flex items-center justify-center gap-x-[0.5rem]">
              <label htmlFor="season" className="w-[0.6rem]">
                S
              </label>
              <input
                ref={seasonRef}
                value={extraForm?.season}
                onChange={({ target }) =>
                  setExtraForm({ ...extraForm, season: parseInt(target.value) })
                }
                type="number"
                name="season"
                placeholder="0"
                onFocus={() => {
                  setFocusedInput("season");
                }}
                onBlur={() => {
                  setFocusedInput(null);
                }}
                className="w-[2rem] border-b border-dark-100 bg-dark-200  text-center duration-200 focus:border-highlight-cyan"
              />
            </div>
            {/* <span className="mx-2 h-[2rem] w-[2px] rotate-12 bg-dark-100" /> */}
            <div className="flex items-center justify-center gap-x-[0.5rem]">
              <label htmlFor="episode" className="w-[0.6rem]">
                E
              </label>
              <input
                ref={episodeRef}
                value={extraForm?.episode}
                placeholder="0"
                onChange={({ target }) =>
                  setExtraForm({
                    ...extraForm,
                    episode: parseInt(target.value),
                  })
                }
                type="number"
                name="episode"
                onFocus={() => {
                  setFocusedInput("episode");
                }}
                onBlur={() => {
                  setFocusedInput(null);
                }}
                className="w-[2rem] border-b border-dark-100 bg-dark-200  text-center duration-200 focus:border-highlight-cyan"
              />
            </div>
          </div>
        )}

        <div className="relative mb-5 flex items-center justify-center gap-x-[0.5rem] text-xl">
          <label
            htmlFor="url"
            className={`top[10px] absolute left-0 translate-x-[8px]  bg-dark-200 px-2  text-dark-100 text-opacity-100 duration-300 
      ${
        (extraForm?.url && extraForm.url.length > 0) || focusedInput === "url"
          ? `translate-y-[-22px] text-sm`
          : "text-base"
      }
      ${invalidURL && "text-highlight-pink"}
      ${focusedInput === "url" && "text-highlight-cyan"}
   
      ${
        focusedInput !== "url" &&
        extraForm?.url !== "" &&
        !invalidURL &&
        "text-opacity-50"
      } 
      `}
            onClick={() => urlRef.current?.focus()}
          >
            Add a URL
          </label>
          <input
            ref={urlRef}
            value={extraForm?.url}
            onChange={({ target }) =>
              setExtraForm({ ...extraForm, url: target.value })
            }
            name="url"
            onFocus={() => {
              setInvalidURL(false);
              setFocusedInput("url");
            }}
            onBlur={() => {
              if (extraForm?.url && extraForm.url.length > 0) {
                const validURL = isUrl(extraForm?.url || "");
                validURL ? setInvalidURL(false) : setInvalidURL(true);
              }
              setFocusedInput(null);
            }}
            className="w-full rounded-md border border-dark-100 bg-dark-200 p-2 text-base duration-300 focus:border-highlight-cyan"
          />
          <span
            className={`border-md absolute right-0 mr-1 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-highlight-pink duration-300 ${
              invalidURL ? "scale-100" : "scale-0"
            }`}
            onClick={() => {
              setURLErrorHover(true);
              setTimeout(() => setURLErrorHover(false), 2500);
            }}
            onMouseEnter={() => setURLErrorHover(true)}
            onMouseLeave={() => setURLErrorHover(false)}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z"></path>
              <path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path>
            </svg>
          </span>
          <span
            className="absolute right-0 translate-y-[0px] translate-x-[-35px] overflow-hidden whitespace-nowrap rounded-md border border-highlight-pink bg-dark-200 px-2 py-1 text-base  duration-500"
            style={{
              width: URLErrorHover ? "112.5px" : "0px",
              opacity: URLErrorHover ? "100" : "0",
            }}
          >
            Invalid URL
          </span>
        </div>
        <div className="relative mb-5 flex items-center justify-center gap-x-[0.5rem] text-xl">
          <label
            htmlFor="comment"
            className={`absolute left-0 top-1 translate-x-[8px]  bg-dark-200 px-2  text-dark-100 text-opacity-100 duration-300 
      ${
        (extraForm?.comment && extraForm.comment.length > 0) ||
        focusedInput === "comment"
          ? `translate-y-[-15px] text-sm`
          : " text-base"
      }
      ${focusedInput === "comment" && "text-highlight-cyan"}
   
      ${
        focusedInput !== "comment" &&
        extraForm?.comment !== "" &&
        "text-opacity-50"
      } 
      `}
            onClick={() => commentRef.current?.focus()}
          >
            Add a comment
          </label>
          <textarea
            ref={commentRef}
            value={extraForm?.comment}
            onChange={({ target }) =>
              setExtraForm({ ...extraForm, comment: target.value })
            }
            name="comment"
            onFocus={() => {
              setFocusedInput("comment");
            }}
            onBlur={() => {
              setFocusedInput(null);
            }}
            className="h-[5rem] max-h-[15rem] min-h-[5rem] w-full rounded-md border border-dark-100 bg-dark-200 p-2 text-base duration-300 focus:border-highlight-cyan"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-highlight-pink py-2 text-2xl text-light-100 shadow-sm duration-300 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default ExtraModal;
