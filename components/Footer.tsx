import tmdbLogo from "@/public/tmdb-logo.svg";
import githubLogo from "@/public/github-mark-white.svg";
import linkedinLogo from "@/public/linkedin-logo.png";
import emailImg from "@/public/email.png";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex w-screen justify-center bg-dark-200 py-5">
      <div className="flex w-11/12 max-w-[45rem] flex-col gap-3 2xs:w-10/12 md:flex-row">
        <p className="flex w-full items-start gap-3 text-sm">
          <Image
            alt="TMDB"
            src={tmdbLogo}
            className="hidden w-[5rem] sm:block"
            loading="lazy"
          />
          This website utilizes data from the Open Movie Database (OMDb) API and
          The Movie Database (TMDB) API to provide movie and TV show
          information.
        </p>

        <div className="flex h-full items-center justify-center gap-3 border-dark-100 md:border-l md:pl-3">
          <Image
            alt="TMDB"
            src={tmdbLogo}
            className="w-[4rem] border-r border-dark-100  pr-3 sm:hidden"
            loading="lazy"
          />
          <Link
            href={"https://github.com/freakGE"}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              alt="Github"
              src={githubLogo}
              className="w-[2.5rem] duration-200 hover:scale-105"
              loading="lazy"
            />
          </Link>
          <Link
            href={"https://www.linkedin.com/in/saba-esebua-a38352246/"}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              alt="Linked in"
              src={linkedinLogo}
              className="w-[2.5rem] duration-200 hover:scale-105"
              loading="lazy"
            />
          </Link>
          <Link
            href={"mailto:esebua154@gmail.com?Subject=Watching%20Assistant"}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              alt="Gmail"
              src={emailImg}
              className="w-[2.75rem] invert duration-200 hover:scale-105"
              loading="lazy"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
