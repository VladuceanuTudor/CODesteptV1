import React from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h1 className="text-4xl font-bold mb-4">404 - Pagina nu a fost găsită</h1>
      <Link href="/" className="text-brand-orange hover:underline">
        Înapoi la pagina principală
      </Link>
    </div>
  );
};

export default NotFoundPage;