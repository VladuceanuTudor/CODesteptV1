import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, ChevronLeft, ChevronRight, User, Mail, UserMinus } from "lucide-react";
import Topbar from "@/components/Topbar/Topbar";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/config";

interface ProblemInfo {
  _id: string;
  title: string;
}

interface UserInfo {
  userId: string;
  username: string;
  email: string;
  profilePic?: string | null;
}

interface FriendRequest {
  userId: string;
  username: string;
  email: string;
  profilePic?: string | null;
}

interface ProfileUser {
  username: string;
  xp: number;
  memberSince: Date;
  starredProblems: ProblemInfo[];
  solvedProblems: ProblemInfo[];
  profilePic: string;
  isActive: boolean;
}

const ITEMS_PER_PAGE = 5; // Number of items per page

// Component 1: Profile Header
const ProfileHeader: React.FC<{ profileUser: ProfileUser; previewUrl: string | null }> = ({ profileUser, previewUrl }) => (
  <motion.div
    className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-orange-500">
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Image src="/avatar.png" alt="Avatar" fill className="object-cover" />
        )}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-orange-400 mt-4">{profileUser.username}</h1>
      {!profileUser.isActive && (
        <p className="text-red-400 font-semibold mt-2 bg-red-900/50 px-3 py-1 rounded-full">Cont dezactivat</p>
      )}
      <p className="text-gray-300 mt-1">Membru din: {profileUser.memberSince.toLocaleDateString("ro-RO")}</p>
      <p className="text-gray-200 mt-2 text-lg">
        XP Total: <span className="font-bold text-orange-400">{profileUser.xp}</span>
      </p>
    </div>
  </motion.div>
);

// Component 2: Solved Problems (Paginated)
const SolvedProblems: React.FC<{ solvedProblems: ProblemInfo[] }> = ({ solvedProblems }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(solvedProblems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProblems = solvedProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
        <CheckCircle size={20} /> Probleme Rezolvate
      </h2>
      {solvedProblems.length > 0 ? (
        <>
          <ul className="space-y-3">
            {paginatedProblems.map((problem) => (
              <motion.li
                key={problem._id}
                className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/problems/${problem._id}`} className="text-green-300 hover:underline font-medium flex items-center">
                  <CheckCircle size={16} className="mr-2 text-green-400" />
                  {problem.title}
                </Link>
              </motion.li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" /> Înapoi
              </button>
              <span className="text-gray-200 self-center">Pagina {currentPage} din {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                Înainte <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Nicio problemă rezolvată</p>
      )}
    </motion.div>
  );
};

// Component 3: Friends List (Paginated, for any user)
const Friends: React.FC<{ username: string; isOwner: boolean }> = ({ username, isOwner }) => {
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends?username=${encodeURIComponent(username)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Friends fetch response:", data);

      if (response.ok) {
        setFriends(data.friends || []);
        setError(null);
      } else {
        setError(data.error || "Eroare la obținerea prietenilor");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setError("A apărut o eroare la obținerea prietenilor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends/unfriend/${friendId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Unfriend response:", data);

      if (response.ok) {
        alert("Prieten eliminat cu succes!");
        fetchFriends(); // Refresh friends list
      } else {
        alert(`Eroare: ${data.error || "Eroare necunoscută"}`);
      }
    } catch (error) {
      console.error("Error unfriending:", error);
      alert("A apărut o eroare la eliminarea prietenului");
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [username]);

  const totalPages = Math.ceil(friends.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFriends = friends.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <User size={20} /> Prieteni
      </h2>
      {isLoading ? (
        <p className="text-gray-400">Se încarcă prietenii...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : friends.length > 0 ? (
        <>
          <ul className="space-y-3">
            {paginatedFriends.map((friend) => (
              <motion.li
                key={friend.userId}
                className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${friend.username}`} className="flex items-center text-blue-300 hover:underline font-medium">
                    <img
                      src={friend.profilePic || "/avatar.png"}
                      alt={`${friend.username}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span>{friend.username}</span>
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => handleUnfriend(friend.userId)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                    >
                      <UserMinus size={16} className="mr-1" /> Elimină
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" /> Înapoi
              </button>
              <span className="text-gray-200 self-center">Pagina {currentPage} din {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                Înainte <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Niciun prieten adăugat</p>
      )}
    </motion.div>
  );
};

// Component 4: Friend Requests (Paginated, for profile owner)
const FriendRequests: React.FC<{ isOwner: boolean }> = ({ isOwner }) => {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return null;

  const fetchFriendRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("FriendRequests fetch response:", data);

      if (response.ok) {
        setReceivedRequests(data.friendRequests || []);
        setError(null);
      } else {
        setError(data.error || "Eroare la obținerea cererilor de prietenie");
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      setError("A apărut o eroare la obținerea cererilor de prietenie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends/accept/${senderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Accept friend request response:", data);

      if (response.ok) {
        alert("Cerere de prietenie acceptată!");
        fetchFriendRequests(); // Refresh requests
      } else {
        alert(`Eroare: ${data.error || "Eroare necunoscută"}`);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("A apărut o eroare la acceptarea cererii");
    }
  };

  const handleRejectRequest = async (senderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends/reject/${senderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Reject friend request response:", data);

      if (response.ok) {
        alert("Cerere de prietenie respinsă!");
        fetchFriendRequests(); // Refresh requests
      } else {
        alert(`Eroare: ${data.error || "Eroare necunoscută"}`);
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("A apărut o eroare la respingerea cererii");
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const totalPages = Math.ceil(receivedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = receivedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <Mail size={20} /> Cereri de Prietenie
      </h2>
      {isLoading ? (
        <p className="text-gray-400">Se încarcă cererile...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : receivedRequests.length > 0 ? (
        <>
          <ul className="space-y-3">
            {paginatedRequests.map((request) => (
              <motion.li
                key={request.userId}
                className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${request.username}`}
                    className="flex items-center text-purple-300 hover:underline font-medium"
                  >
                    <img
                      src={request.profilePic || "/avatar.png"}
                      alt={`${request.username}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span>{request.username} (Primită)</span>
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.userId)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Acceptă
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.userId)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Respinge
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" /> Înapoi
              </button>
              <span className="text-gray-200 self-center">Pagina {currentPage} din {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                Înainte <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Nicio cerere de prietenie</p>
      )}
    </motion.div>
  );
};

// Component 5: Starred Problems (Paginated, only for profile owner)
const StarredProblems: React.FC<{ starredProblems: ProblemInfo[]; isOwner: boolean }> = ({ starredProblems, isOwner }) => {
  if (!isOwner) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(starredProblems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProblems = starredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
        <Star size={20} /> Probleme Favorite
      </h2>
      {starredProblems.length > 0 ? (
        <>
          <ul className="space-y-3">
            {paginatedProblems.map((problem) => (
              <motion.li
                key={problem._id}
                className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/problems/${problem._id}`} className="text-orange-300 hover:underline font-medium flex items-center">
                  <Star size={16} className="mr-2 text-yellow-400" />
                  {problem.title}
                </Link>
              </motion.li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" /> Înapoi
              </button>
              <span className="text-gray-200 self-center">Pagina {currentPage} din {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-600 hover:bg-orange-600 transition flex items-center"
              >
                Înainte <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Nicio problemă favorită</p>
      )}
    </motion.div>
  );
};

// Component 6: Profile Settings (only for profile owner)
const ProfileSettings: React.FC<{ isOwner: boolean; user: ProfileUser | null; setPreviewUrl: (url: string | null) => void }> = ({
  isOwner,
  user,
  setPreviewUrl,
}) => {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(user?.profilePic || null);
  const [, setUser] = useAtom(userAtom);
  const router = useRouter();

  if (!isOwner) return null;

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ ...user, username: data.user.username });
        router.push(`/profile/${data.user.username}`);
      } else {
        setUsernameError(data.error || "Eșec la actualizarea numelui de utilizator.");
      }
    } catch (error) {
      console.error("Actualizare eșuată:", error);
      setUsernameError("A apărut o eroare neașteptată.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setLocalPreviewUrl(reader.result as string);
        setPreviewUrl(reader.result as string);
      };
    }
  };

  const handleUpload = async () => {
    if (!localPreviewUrl) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile-pic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ profilePic: localPreviewUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ ...user, profilePic: data.profilePic });
        setPreviewUrl(localPreviewUrl); // Update parent state
        setUploadError(null);
      } else {
        setUploadError(data.error || "Eșec la încărcarea pozei de profil.");
      }
    } catch (error) {
      console.error("Eroare la încărcarea pozei de profil:", error);
      setUploadError("A apărut o eroare la încărcarea pozei de profil.");
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-orange-400 mb-6">Setări Profil</h2>
      <div className="space-y-6">
        {/* Username Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nume utilizator</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {usernameError && <p className="text-red-400 mt-1 text-sm">{usernameError}</p>}
          <button
            onClick={handleUpdate}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Salvează modificări
          </button>
        </div>

        {/* Profile Picture Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Poză de profil</label>
          {localPreviewUrl && (
            <div className="mb-4">
              <img
                src={localPreviewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover mx-auto shadow-md"
              />
            </div>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm text-gray-300 file:bg-orange-500 file:border-none file:px-3 file:py-2 file:rounded file:text-white hover:file:bg-orange-600 cursor-pointer"
          />
          {uploadError && <p className="text-red-400 mt-1 text-sm">{uploadError}</p>}
          <button
            onClick={handleUpload}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Încarcă poza
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Profile Page
const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;
  const [currentUser] = useAtom(userAtom);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profilePic || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentComponent, setCurrentComponent] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;

        const response = await fetch(`${API_BASE_URL}/api/users/${username}`);
        const data = await response.json();
        console.log("Profile fetch response:", data);

        if (response.ok) {
          const formattedUser: ProfileUser = {
            username: data.username,
            xp: data.xp || 0,
            memberSince: new Date(data.memberSince || Date.now()),
            starredProblems: data.starredProblems || [],
            solvedProblems: data.solvedProblems || [],
            profilePic: data.profilePic || "",
            isActive: data.isActive || false,
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
    return <div className="container mx-auto p-4 text-gray-200 text-center">Se încarcă...</div>;
  }

  if (error || !profileUser) {
    return (
      <div className="container mx-auto p-4 text-gray-200 text-center">
        <div className="text-red-400">{error || "Profilul nu există"}</div>
      </div>
    );
  }

  const isOwner = currentUser?.username === profileUser.username;

  // Define available components based on isActive and isOwner
  const components = [
    { name: "Profil", component: <ProfileHeader profileUser={profileUser} previewUrl={previewUrl} /> },
    ...(profileUser.isActive
      ? [
          { name: "Rezolvate", component: <SolvedProblems solvedProblems={profileUser.solvedProblems} /> },
          { name: "Prieteni", component: <Friends username={profileUser.username} isOwner={isOwner} /> },
          ...(isOwner
            ? [
                { name: "Favorite", component: <StarredProblems starredProblems={profileUser.starredProblems} isOwner={isOwner} /> },
                { name: "Cereri Prietenie", component: <FriendRequests isOwner={isOwner} /> },
                { name: "Setări", component: <ProfileSettings isOwner={isOwner} user={profileUser} setPreviewUrl={setPreviewUrl} /> },
              ]
            : []),
        ]
      : []),
  ];

  const handlePrev = () => {
    setCurrentComponent((prev) => (prev === 0 ? components.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentComponent((prev) => (prev === components.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      <Topbar />
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl relative">
          {/* Carousel Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrev}
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition disabled:bg-gray-600"
              disabled={components.length <= 1}
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold text-orange-400">{components[currentComponent].name}</h2>
            <button
              onClick={handleNext}
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition disabled:bg-gray-600"
              disabled={components.length <= 1}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Carousel Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentComponent}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {components[currentComponent].component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;