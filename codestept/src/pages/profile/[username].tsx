import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import Topbar from "@/components/Topbar/Topbar";
import Image from "next/image";
import { API_BASE_URL } from '@/lib/config';

interface ProblemInfo {
  _id: string;
  title: string;
}

interface ProfileUser {
  username: string;
  xp: number;
  memberSince: Date;
  starredProblems: ProblemInfo[];
  solvedProblems: ProblemInfo[];
  profilePic: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;
  const [currentUser] = useAtom(userAtom);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profilePic || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;

        const response = await fetch(`${API_BASE_URL}/api/users/${username}`);
        const data = await response.json();

        if (response.ok) {
          const formattedUser: ProfileUser = {
            username: data.username,
            xp: data.xp || 0,
            memberSince: new Date(data.memberSince || Date.now()),
            starredProblems: data.starredProblems || [],
            solvedProblems: data.solvedProblems || [],
            profilePic: data.profilePic || "",
          };

          setProfileUser(formattedUser);
          setPreviewUrl(formattedUser.profilePic || null);
          setError("");
        } else {
          setError(data.error || "Profilul nu a fost găsit");
          router.push("/404");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Eroare la încărcarea profilului");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, router]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-white text-center">Se încarcă...</div>;
  }

  if (error || !profileUser) {
    return (
      <div className="container mx-auto p-4 text-white text-center">
        <div className="text-red-500">{error || "Profilul nu există"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <Topbar />
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <motion.div
          className="bg-dark-layer-3/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Avatar & Username */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-brand-orange">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Image src="/avatar.png" alt="Avatar" fill className="object-cover" />
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-orange mt-4">{profileUser.username}</h1>
            <p className="text-gray-400 mt-1">Membru din: {profileUser.memberSince.toLocaleDateString("ro-RO")}</p>
            <p className="text-white mt-2 text-lg">
              XP Total: <span className="font-bold text-brand-orange">{profileUser.xp}</span>
            </p>
          </div>

          {/* Starred & Solved Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Probleme Favorite */}
            <div className="bg-dark-layer-2 p-5 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <Star size={20} /> Probleme Favorite
              </h2>
              {profileUser.starredProblems.length > 0 ? (
                <ul className="space-y-3">
                  {profileUser.starredProblems.map((problem) => (
                    <motion.li
                      key={problem._id}
                      className="bg-dark-layer-1 p-3 rounded-lg hover:shadow-lg hover:bg-dark-fill-2 transition cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/problems/${problem._id}`} className="text-brand-orange hover:underline font-medium flex items-center">
                        <Star size={16} className="mr-2 text-yellow-400" />
                        {problem.title}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nicio problemă favorită</p>
              )}
            </div>

            {/* Probleme Rezolvate */}
            <div className="bg-dark-layer-2 p-5 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle size={20} /> Probleme Rezolvate
              </h2>
              {profileUser.solvedProblems.length > 0 ? (
                <ul className="space-y-3">
                  {profileUser.solvedProblems.map((problem) => (
                    <motion.li
                      key={problem._id}
                      className="bg-dark-layer-1 p-3 rounded-lg hover:shadow-lg hover:bg-dark-fill-2 transition cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/problems/${problem._id}`} className="text-green-300 hover:underline font-medium flex items-center">
                        <CheckCircle size={16} className="mr-2 text-green-400" />
                        {problem.title}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nicio problemă rezolvată</p>
              )}
            </div>
          </div>

          {/* Edit button */}
          {currentUser?.username === profileUser.username && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/profile/settings">
                <button className="bg-brand-orange text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-orange-500 transition-all shadow-md hover:shadow-xl">
                  Editează Profil
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
