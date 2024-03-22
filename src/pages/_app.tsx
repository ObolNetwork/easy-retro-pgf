import "~/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Inter, VT323 } from "next/font/google";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { Providers } from "~/providers";
import { api } from "~/utils/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const heading = VT323({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-heading",
});

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <Providers session={pageProps.session}>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-heading: ${heading.style.fontFamily};
        }
      `}</style>
      <main className={`${inter.variable}  min-h-screen font-sans`}>
        <Component {...pageProps} />
      </main>
    </Providers>
  );
}

export default api.withTRPC(MyApp);
