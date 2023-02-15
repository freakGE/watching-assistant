import "@/styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { AppStateProvider } from "@/components/AppState";
import { useRouter } from "next/router";

const Header = dynamic(() => import("../components/Header"));
const Footer = dynamic(() => import("../components/Footer"));

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const layoutArray = ["/auth/signin", "/signup"];
  const showLayout = !layoutArray.includes(router.pathname);
  return (
    <AppStateProvider>
      <SessionProvider session={pageProps.session}>
        {showLayout && <Header />}
        <Component {...pageProps} />
        {showLayout && <Footer />}
      </SessionProvider>
    </AppStateProvider>
  );
}
