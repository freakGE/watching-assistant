import { NextPage } from "next";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import {
  ValidateEmail,
  ValidateUsername,
  ValidatePassword,
} from "@/components/ValidateForm";

import { signIn, useSession } from "next-auth/react";
import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

type AccountType = {
  email: string;
  name: string;
  password: string;
};

const createAccount = async ({ email, name, password }: AccountType) => {
  try {
    const url = process.env.NEXT_PUBLIC_URL;
    const response = await fetch(`${url}/api/create-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        password,
        accountType: "form",
        emailVerified: false,
      }),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
};

const SignUp: NextPage = (userEmails: any): JSX.Element => {
  const router = useRouter();
  const { status, data } = useSession();
  const validateUsername = ValidateUsername;
  const validateEmail = ValidateEmail;
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
  });

  const [emailExist, setEmailExist] = useState(false);
  const [modalTranslateY, setModalTranslateY] = useState(240);
  const [modalIndex, setModalIndex] = useState(1);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [invalidRepeatPassword, setInvalidRepeatPassword] = useState(false);

  const [emailErrorHover, setEmailErrorHover] = useState(false);
  const [usernameErrorHover, setUsernameErrorHover] = useState(false);
  const [passwordErrorHover, setPasswordErrorHover] = useState(false);
  const [repeatPasswordErrorHover, setRepeatPasswordErrorHover] =
    useState(false);

  const [focusedInput, setFocusedInput] = useState<
    "password" | "repeatPassword" | "email" | "username" | null
  >(null);

  useEffect(() => {
    if (emailExist === true) {
      setModalTranslateY(300);
      setTimeout(() => {
        setModalIndex(2);
        setTimeout(() => {
          setModalTranslateY(240);
          setTimeout(() => {
            setModalTranslateY(300);
            setTimeout(() => {
              setModalIndex(1);
              setTimeout(() => {
                setModalTranslateY(240);
                setTimeout(() => setEmailExist(false), 750);
              }, 150);
            }, 500);
          }, 1950);
        }, 150);
      }, 500);
    }
  }, [emailExist]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    const email = validateEmail(userInfo.email);
    const username = validateUsername(userInfo.username);
    const password = ValidatePassword(userInfo.password);

    const arrayOfEmails = userEmails.userEmails;

    if (username.status === "failed") setInvalidUsername(true);
    if (password.status === "failed") setInvalidPassword(true);
    if (
      userInfo.repeatPassword.length === 0 ||
      userInfo.repeatPassword !== userInfo.password
    )
      setInvalidRepeatPassword(true);

    setInvalidEmail(false);

    email
      ? setUserInfo({ ...userInfo, email: email[0] })
      : setInvalidEmail(true);

    setEmailExist(() => {
      const emailFinder = arrayOfEmails.find(
        (email: string) => email === userInfo.email
      );
      return emailFinder ? true : false;
    });

    const emailAlreadyExists: string | null = arrayOfEmails.find(
      (email: string) => email === userInfo.email
    );

    if (
      email &&
      username.status === "success" &&
      password.status === "success" &&
      userInfo.repeatPassword === userInfo.password &&
      typeof emailAlreadyExists !== "string"
    ) {
      createAccount({
        email: userInfo.email,
        name: userInfo.username,
        password: userInfo.password,
      }).then(res => {
        if (res.acknowledged) signIn();
      });
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status]);

  return (
    <>
      <Head>
        <title>Watching Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Description */}
        <meta
          name="description"
          content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
        />
        <meta
          name="keywords"
          content="watching, watching assistant, watchlist"
        />
        {/* Open Graph data */}
        <meta property="og:title" content="Watching Assistant" />
        <meta
          property="og:description"
          content="Watching Assistant is a website for tracking movies and TV shows. Users can create watchlists, mark titles as watched or currently watching, and track their progress through TV shows by season and episode."
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/thumbnail.png`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen w-screen items-center justify-center">
        {emailExist && (
          <div
            className="absolute rounded-md bg-highlight-pink p-2 text-lg shadow-md duration-500"
            style={{
              zIndex: modalIndex,
              transform: `translateY(-${modalTranslateY}px)`,
            }}
          >
            Email already exists in database
          </div>
        )}
        <form
          className="z-[1] flex h-full max-h-[525px] w-full max-w-[25rem] flex-col justify-center gap-y-5 rounded-md bg-dark-200 py-[4rem] px-[2.5rem] shadow-lg 2xs:h-auto"
          onSubmit={handleSubmit}
        >
          <h1 className="text-center text-4xl uppercase">Sign Up</h1>
          <div className="relative flex items-center justify-center">
            <label
              className={`absolute left-0 translate-x-[8px]  bg-dark-200 px-2 text-lg text-dark-100 text-opacity-100 duration-300 
            ${
              (userInfo.email.length > 0 || focusedInput === "email") &&
              `translate-y-[-22px] text-sm`
            }
            ${focusedInput === "email" && "text-highlight-cyan"}
            ${invalidEmail && "text-highlight-pink"}
            ${
              focusedInput !== "email" &&
              userInfo.email !== "" &&
              !invalidEmail &&
              "text-opacity-50"
            } 
            `}
              htmlFor="email"
              onClick={() => emailRef.current?.focus()}
            >
              Email
            </label>
            <input
              ref={emailRef}
              value={userInfo.email}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, email: target.value })
              }
              type="email"
              onFocus={() => {
                setInvalidEmail(false);
                setFocusedInput("email");
              }}
              onBlur={() => {
                const email = validateEmail(userInfo.email);
                setInvalidEmail(false);
                email
                  ? setUserInfo({ ...userInfo, email: email[0] })
                  : userInfo.email && setInvalidEmail(true);

                setFocusedInput(null);
              }}
              className="w-full rounded-md border border-dark-100 bg-dark-200 p-2 duration-200 focus:border-highlight-cyan"
            />
            <span
              className={`border-md absolute right-0 mr-1 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-highlight-pink duration-300 ${
                invalidEmail ? "scale-100" : "scale-0"
              }`}
              onClick={() => {
                setEmailErrorHover(true);
                setTimeout(() => setEmailErrorHover(false), 2500);
              }}
              onMouseEnter={() => setEmailErrorHover(true)}
              onMouseLeave={() => setEmailErrorHover(false)}
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
              className="absolute right-0 translate-y-[0px] translate-x-[-35px] overflow-hidden whitespace-nowrap rounded-md border border-highlight-pink bg-dark-200 px-2 py-1 duration-500"
              style={{
                width: emailErrorHover
                  ? userInfo.email.length > 0
                    ? "191px"
                    : "153px"
                  : "0px",
                opacity: emailErrorHover ? "100" : "0",
              }}
            >
              {userInfo.email.length > 0
                ? `Invalid Email Address`
                : `Email is required`}
            </span>
          </div>
          <div className="relative flex items-center justify-center">
            <label
              className={`absolute left-0 translate-x-[8px]  bg-dark-200 px-2 text-lg text-dark-100 text-opacity-100 duration-300 
            ${
              (userInfo.username.length > 0 || focusedInput === "username") &&
              `translate-y-[-22px] text-sm`
            }
            ${focusedInput === "username" && "text-highlight-cyan"}
            ${invalidUsername && "text-highlight-pink"}
            ${
              focusedInput !== "username" &&
              userInfo.username !== "" &&
              !invalidUsername &&
              "text-opacity-50"
            } 
            `}
              htmlFor="username"
              onClick={() => usernameRef.current?.focus()}
            >
              Username
            </label>
            <input
              ref={usernameRef}
              value={userInfo.username}
              onChange={({ target }) => {
                setUserInfo({ ...userInfo, username: target.value });
              }}
              type="text"
              onFocus={() => {
                setInvalidUsername(false);
                setFocusedInput("username");
              }}
              onBlur={() => {
                const username = validateUsername(userInfo.username);
                setInvalidUsername(false);
                if (username.status === "failed" && userInfo.username)
                  setInvalidUsername(true);

                setFocusedInput(null);
              }}
              className="w-full rounded-md border border-dark-100 bg-dark-200 p-2 duration-200 focus:border-highlight-cyan"
            />
            <span
              className={`border-md absolute right-0 mr-1 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-highlight-pink duration-300 ${
                invalidUsername ? "scale-100" : "scale-0"
              }`}
              onClick={() => {
                setUsernameErrorHover(true);
                setTimeout(() => setUsernameErrorHover(false), 2500);
              }}
              onMouseEnter={() => setUsernameErrorHover(true)}
              onMouseLeave={() => setUsernameErrorHover(false)}
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
              className="absolute right-0 translate-y-[0px] translate-x-[-35px] overflow-hidden whitespace-nowrap rounded-md border border-highlight-pink bg-dark-200 px-2 py-1 duration-500  "
              style={{
                width: usernameErrorHover
                  ? userInfo.username.length > 0
                    ? userInfo.username.length < 5
                      ? "292.5px"
                      : "300px"
                    : "191px"
                  : "0px",
                opacity: usernameErrorHover ? "100" : "0",
              }}
            >
              {validateUsername(userInfo.username).message}
            </span>
          </div>

          <div className="relative flex items-center justify-center">
            <label
              className={`absolute left-0 translate-x-[8px]  bg-dark-200 px-2 text-lg text-dark-100 text-opacity-100 duration-300 
               ${
                 (userInfo.password.length > 0 ||
                   focusedInput === "password") &&
                 `translate-y-[-22px] text-sm`
               }
               ${focusedInput === "password" && "text-highlight-cyan"}
               ${invalidPassword && "text-highlight-pink"}
               ${
                 focusedInput !== "password" &&
                 userInfo.password !== "" &&
                 !invalidPassword &&
                 "text-opacity-50"
               } 
               `}
              htmlFor="password"
              onClick={() => passwordRef.current?.focus()}
            >
              Password
            </label>

            <input
              ref={passwordRef}
              value={userInfo.password}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, password: target.value })
              }
              onFocus={() => {
                setInvalidPassword(false);
                setFocusedInput("password");
              }}
              onBlur={() => {
                const password = ValidatePassword(userInfo.password);
                setInvalidPassword(false);
                if (password.status === "failed" && userInfo.password)
                  setInvalidPassword(true);

                setFocusedInput(null);
              }}
              type={!passwordVisible ? "password" : "text"}
              className="w-full rounded-md border border-dark-100 bg-dark-200  p-2 duration-200 focus:border-highlight-cyan"
            />
            <span
              className={`border-md absolute right-0 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-dark-100 duration-300`}
              style={{
                marginRight: !invalidPassword ? "0.25rem" : "0rem",
                transform: !invalidPassword
                  ? "translateX(0px)"
                  : "translateX(2.25rem)",
              }}
              onClick={() => {
                setPasswordVisible(!passwordVisible);
              }}
            >
              {!passwordVisible ? (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"></path>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"></path>
                </svg>
              ) : (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"></path>
                  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"></path>
                  <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"></path>
                </svg>
              )}
            </span>

            <span
              className={`border-md absolute right-0 mr-1 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-highlight-pink duration-300 ${
                invalidPassword ? "scale-100" : "scale-0"
              }`}
              onClick={() => {
                setPasswordErrorHover(true);
                setTimeout(() => setPasswordErrorHover(false), 2500);
              }}
              onMouseEnter={() => setPasswordErrorHover(true)}
              onMouseLeave={() => setPasswordErrorHover(false)}
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
              className="absolute right-0 translate-y-[0px] translate-x-[-35px] overflow-hidden whitespace-nowrap rounded-md border border-highlight-pink bg-dark-200 px-2 py-1 duration-500  "
              style={{
                width: passwordErrorHover
                  ? userInfo.password.length > 0
                    ? userInfo.password.length < 5
                      ? "292.5px"
                      : "300px"
                    : "157.5px"
                  : "0px",
                opacity: passwordErrorHover ? "100" : "0",
              }}
            >
              {ValidatePassword(userInfo.password).message}
            </span>
          </div>

          <div className="relative flex items-center justify-center">
            <label
              className={`absolute left-0 translate-x-[8px]  bg-dark-200 px-2 text-lg text-dark-100 text-opacity-100 duration-300 
            ${
              (userInfo.repeatPassword.length > 0 ||
                focusedInput === "repeatPassword") &&
              `translate-y-[-22px] text-sm`
            }
            ${focusedInput === "repeatPassword" && "text-highlight-cyan"}
            ${invalidRepeatPassword && "text-highlight-pink"}
            ${
              focusedInput !== "repeatPassword" &&
              userInfo.repeatPassword !== "" &&
              !invalidRepeatPassword &&
              "text-opacity-50"
            } 
            `}
              htmlFor="repeatPassword"
              onClick={() => repeatPasswordRef.current?.focus()}
            >
              Repeat Password
            </label>

            <input
              ref={repeatPasswordRef}
              value={userInfo.repeatPassword}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, repeatPassword: target.value })
              }
              onFocus={() => {
                setInvalidRepeatPassword(false);
                setFocusedInput("repeatPassword");
              }}
              onBlur={() => {
                setInvalidRepeatPassword(false);
                if (userInfo.repeatPassword !== userInfo.password)
                  setInvalidRepeatPassword(true);

                setFocusedInput(null);
              }}
              type={!repeatPasswordVisible ? "password" : "text"}
              className="w-full rounded-md border border-dark-100 bg-dark-200  p-2 duration-200 focus:border-highlight-cyan"
            />
            <span
              className={`border-md absolute right-0 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-dark-100 duration-300`}
              style={{
                marginRight: !invalidRepeatPassword ? "0.25rem" : "0rem",
                transform: !invalidRepeatPassword
                  ? "translateX(0px)"
                  : "translateX(2.25rem)",
              }}
              onClick={() => {
                setRepeatPasswordVisible(!repeatPasswordVisible);
              }}
            >
              {!repeatPasswordVisible ? (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"></path>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"></path>
                </svg>
              ) : (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"></path>
                  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"></path>
                  <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"></path>
                </svg>
              )}
            </span>
            <span
              className={`border-md absolute right-0 mr-1 flex cursor-pointer items-center justify-center overflow-hidden bg-dark-200 pl-1 text-3xl text-highlight-pink duration-300 ${
                invalidRepeatPassword ? "scale-100" : "scale-0"
              }`}
              onClick={() => {
                setRepeatPasswordErrorHover(true);
                setTimeout(() => setRepeatPasswordErrorHover(false), 2500);
              }}
              onMouseEnter={() => setRepeatPasswordErrorHover(true)}
              onMouseLeave={() => setRepeatPasswordErrorHover(false)}
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
              className="absolute right-0 translate-y-[0px] translate-x-[-35px] overflow-hidden whitespace-nowrap rounded-md border border-highlight-pink bg-dark-200 px-2 py-1 duration-500  "
              style={{
                width: repeatPasswordErrorHover
                  ? userInfo.repeatPassword.length > 0
                    ? "215px"
                    : "179px"
                  : "0px",
                opacity: repeatPasswordErrorHover ? "100" : "0",
              }}
            >
              {userInfo.repeatPassword.length > 0
                ? "Passwords do not match"
                : "This field is required"}
            </span>
          </div>

          <button
            type="submit"
            className="rounded-md bg-highlight-pink py-2 text-2xl text-light-100 shadow-sm duration-300 hover:bg-opacity-90 active:bg-opacity-80 active:text-opacity-95"
          >
            Sign Up
          </button>

          <div className="itesm-center flex w-full justify-center whitespace-nowrap">
            <p>Already have an account? </p>
            <Link
              href={"auth/signin"}
              className="ml-1.5 text-highlight-pink underline underline-offset-4 duration-200 hover:no-underline "
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignUp;

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const data = await db
      .collection("users")
      .find({})
      .project({ email: 1 })
      .toArray();

    const parsedData = JSON.parse(JSON.stringify(data));

    const userEmails: string[] = [];

    parsedData.forEach((u: any) => {
      userEmails.push(u.email);
    });

    return {
      props: {
        userEmails,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        ok: false,
      },
    };
  }
}
