import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logout from "@/components/Buttons/Logout";
import { useAtom } from "jotai";
import { authModalState } from "@/atoms/authModalAtom";
import { userAtom } from "@/atoms/userAtom";
import Timer from "@/components/Timer/Timer";
import { Menu, X } from "lucide-react";
import { API_BASE_URL } from '@/lib/config';

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user, setUser] = useAtom(userAtom);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [authMState, setAuthMState] = useAtom(authModalState);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
      checkAdminStatus(token);
      fetchManager();
    }
  }, []);

  useEffect(() => {
    if (user?.profilePic) {
      setPreviewUrl(user.profilePic);
    }
  }, [user]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
    }
  };

  const checkAdminStatus = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/is-admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(data.isAdmin);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Admin status check failed:", error);
      setIsAdmin(false);
    }
  };

  // Check manager status
  const fetchManager = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/auth/is-manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.isManager) {
        setIsManager(true);
      }
    } catch (error) {
      console.error("Eroare la verificarea statutului de manager:", error);
      
    } 
  };

  const navButton = (href: string, label: string) => (
    <Link href={href}>
      <button className="bg-dark-fill-2 py-1 px-3 text-black rounded border-2 border-black hover:bg-lime-700 w-full text-left md:text-center">
        {label}
      </button>
    </Link>
  );

  return (
    <nav className="relative flex h-[60px] w-full items-center px-4 sm:px-6 bg-lime-600 bg-opacity-80 text-dark-gray-7 shadow-md z-50">
      <div className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1600px] mx-auto" : ""}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/CODestept-decupat.png" alt="Logo" height={50} width={50} />
          <span className="text-lg font-semibold hidden sm:inline text-black">CODestept</span>
        </Link>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu */}
        <div className={`flex-col lg:flex-row lg:flex items-center space-y-2 lg:space-y-0 lg:space-x-4 absolute lg:static bg-lime-600 lg:bg-transparent left-0 top-[60px] w-full lg:w-auto p-4 lg:p-0 transition-all duration-300 ease-in-out ${menuOpen ? "flex" : "hidden lg:flex"}`}>
          {user && isAdmin && navButton("/problems/create-problem", "Crează o problemă")}
          {user && isManager && navButton("/manager", "Interfata manager")}
          {user && isAdmin && navButton("/problems/ProblemeleMele", "Problemele mele")}
          {user && !isAdmin && navButton("/problems/tema", "Temele mele")}
          {user && navButton("/users", "Utilizatori")}
          {navButton("/contact", "Contact")}


          {/* Timer (only on problem page) */}
          {user && problemPage && <Timer />}

          {/* Login or profile/avatar */}
          {!user ? (
            <Link
              href="/auth"
              onClick={() => setAuthMState((prev) => ({ ...prev, isOpen: true, type: "login" }))}
              className="w-full md:w-auto"
            >
              <button className="bg-dark-fill-2 py-1 px-2 text-black rounded border-2 border-black hover:bg-lime-700 w-full">
                Intră în cont
              </button>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Profile Avatar */}
              <Link href={`/profile/${user.username}`}>
                <div className="relative group cursor-pointer">
                  <img
                    src={previewUrl || "/avatar.png"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-black"
                  />
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
              </Link>
              <Logout />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
