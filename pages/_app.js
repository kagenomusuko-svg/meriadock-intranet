import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <>
        {/* Head global para toda la aplicación */}
        <Head>
          <title>Meriadock Intranet</title>
          {/* Configuración del favicon */}
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Renderizamos el resto de la página */}
        <Component {...pageProps} />
      </>
    </AuthProvider>
  );
}
