"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSetAtom } from 'jotai';
import { authModalState } from '@/atoms/authModalAtom';

const Navbar: React.FC = () => {
  const setAuthModal = useSetAtom(authModalState);
  const handleClick = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: true }));
  };
  return (
    <div className="flex items-center justify-between sm:px-12 px-2 md:px-24 h-20 shadow-md">
      <Link href="/" className="flex items-center justify-center h-20">
      <Image src="/CODestept-decupat.png" alt="Logo" width={70} height={70} />
      </Link>
      <div className="flex items-center">
        <button
          className="bg-lime-600 hover:bg-lime-700 text-white px-2 py-1 sm:px-4 rounded-md text-sm font-medium
                  hover:border-2 hover:border-white border-2 border-transparent
                transition duration-300 ease-in-out"
                onClick={handleClick}
        >
          Intră în cont
        </button>
      </div>
    </div>
  );
};

export default Navbar;
