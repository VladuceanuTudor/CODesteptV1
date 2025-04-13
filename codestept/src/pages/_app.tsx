import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Provider } from 'jotai';

export default function App({ Component, pageProps }: AppProps) {

  return (
    <Provider>
      		<Head>
				<title>CODestept</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/codestept_logo.jpg' />
				<meta
					name='description'
					content='Aplicatie web cu probleme pentru examenult de bacalaureat la info.'
				/>
			</Head>
			
      	<Component {...pageProps} />
    </Provider>
  );
  
}
