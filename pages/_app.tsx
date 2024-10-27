import "@/styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { AppStateProvider } from "@/components/AppState";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ['Arial', 'sans-serif']
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const layoutArray = ["/auth/signin", "/signup"];
  const showLayout = !layoutArray.includes(router.pathname);
  return (
    <AppStateProvider>
      <SessionProvider session={pageProps.session}>
        <main className={montserrat.className}>
          {showLayout && <Header />}
          <Component {...pageProps} />
          {showLayout && <Footer />}
        </main>
      </SessionProvider>
    </AppStateProvider>
  );
}
