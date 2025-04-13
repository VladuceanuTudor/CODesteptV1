// pages/users.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar/Topbar";
import { API_BASE_URL } from '@/lib/config';

interface User {
  _id: string;
  username: string;
  profilePic?: string;
  xp: number;
  createdAt: string;
  role: string;
}

interface LeaderboardUser {
  _id: string;
  username: string;
  profilePic?: string;
  xp: number;
}

interface Problem {
  _id: string;
  title: string;
}

interface Homework {
  problemId: string;
  title: string;
  assignedAt: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminCheckError, setAdminCheckError] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [homeworkModalOpen, setHomeworkModalOpen] = useState<boolean>(false);
  const [homework, setHomework] = useState<Homework[]>([]);

  // Check if logged-in user is admin
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAdminCheckError("Niciun token găsit. Te rugăm să te autentifici.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/is-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("fetchUserProfile response (is-admin):", data);

      if (response.ok) {
        setIsAdmin(data.isAdmin || false);
      } else {
        setAdminCheckError("Eroare la verificarea statutului de admin: " + data.error);
      }
    } catch (error) {
      console.error("Eroare la verificarea statutului de admin:", error);
      setAdminCheckError("Eroare la verificarea statutului de admin: " + error);
    }
  };

  // Fetch users (with search)
  const fetchUsers = async (page: number, query: string = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Niciun token găsit");
        return;
      }

      const url = query
        ? `${API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/users?page=${page}&limit=10`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(query ? data.users : data.users);
        setHasMore(query ? true : data.hasMore);
      } else {
        console.error("Eroare la obținerea utilizatorilor:", data.error);
      }
    } catch (error) {
      console.error("Eroare la fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Niciun token găsit pentru clasament");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/leaderboard?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeaderboardUsers(data.users || []);
      } else {
        console.error("Eroare la obținerea clasamentului:", data.error);
      }
    } catch (error) {
      console.error("Eroare la fetch clasament:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Fetch problems for assign homework modal
  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/problems`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProblems(data.problems);
      }
    } catch (error) {
      console.error("Eroare la obținerea problemelor:", error);
    }
  };

  // Assign homework
  const assignHomework = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/homework/assign/${selectedUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemIds: selectedProblems }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Temă atribuită cu succes!");
        setModalOpen(false);
        setSelectedProblems([]);
      } else {
        alert(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la atribuirea temei:", error);
      alert("Nu s-a putut atribui tema.");
    }
  };

  // View homework
  const viewHomework = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/homework/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setHomework(data.homework);
        setHomeworkModalOpen(true);
      } else {
        alert(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la obținerea temelor:", error);
      alert("Nu s-a putut obține tema.");
    }
  };

  // Promote to admin
  const promoteToAdmin = async (userId: string) => {
    if (!confirm("Ești sigur că vrei să faci acest utilizator admin?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/promote/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Utilizator promovat la admin!");
        fetchUsers(currentPage, searchQuery);
      } else {
        alert(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la promovarea utilizatorului:", error);
      alert("Nu s-a putut promova utilizatorul.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUsers(currentPage);
    fetchLeaderboard();
  }, [currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  return (
    <div>
      <Topbar />
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Utilizatori</h1>

        {/* Leaderboard Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Clasament Top 10:</h2>
          {loadingLeaderboard ? (
            <div className="text-center text-gray-400 py-4">Se încarcă...</div>
          ) : leaderboardUsers.length > 0 ? (
            <div className="space-y-4">
              {leaderboardUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="w-8 text-lg font-bold text-yellow-400 mr-4">
                    {index + 1}
                  </span>
                  <Link href={`/profile/${user.username}`}>
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={`${user.username}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover mr-4 cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${user.username}`}>
                      <p className="text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                        {user.username}
                      </p>
                    </Link>
                    <p className="text-gray-400 text-sm">XP: {user.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">Niciun utilizator în clasament.</div>
          )}
        </div>

        {/* Admin Error */}
        {adminCheckError && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded-md">
            {adminCheckError}
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută utilizatori..."
              className="w-full max-w-md px-4 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors duration-200"
            >
              Caută
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Se încarcă...</div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <Link href={`/profile/${user.username}`}>
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={`${user.username}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-4 cursor-pointer"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${user.username}`}>
                    <p className="text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                      {user.username}
                    </p>
                  </Link>
                  <p className="text-gray-400 text-sm">XP: {user.xp}</p>
                  <p className="text-gray-500 text-sm">
                    Membru din: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-sm">Rol: {user.role}</p>
                </div>
                {isAdmin && user.role === "user" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUserId(user._id);
                        fetchProblems();
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                      Atribuie Temă
                    </button>
                    <button
                      onClick={() => viewHomework(user._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Vezi Teme
                    </button>
                    <button
                      onClick={() => promoteToAdmin(user._id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                    >
                      Fă Admin
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">Niciun utilizator găsit.</div>
        )}

        {!searchQuery && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
            >
              Anterior
            </button>
            <span className="text-gray-300">Pagina {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasMore || loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
            >
              Următor
            </button>
          </div>
        )}

        {/* Assign Homework Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Atribuie Temă</h2>
              <div className="max-h-64 overflow-y-auto">
                {problems.map((problem) => (
                  <div key={problem._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={problem._id}
                      checked={selectedProblems.includes(problem._id)}
                      onChange={() => {
                        setSelectedProblems((prev) =>
                          prev.includes(problem._id)
                            ? prev.filter((id) => id !== problem._id)
                            : [...prev, problem._id]
                        );
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={problem._id} className="text-gray-300">
                      {problem.title}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedProblems([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Anulează
                </button>
                <button
                  onClick={assignHomework}
                  disabled={selectedProblems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600"
                >
                  Atribuie
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Homework View Modal */}
        {homeworkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Teme Atribuite</h2>
              {homework.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {homework.map((hw) => (
                    <div key={hw.problemId} className="mb-2">
                      <Link href={`/problems/${hw.problemId}`}>
                        <p className="text-gray-300 hover:text-blue-300 cursor-pointer">{hw.title}</p>
                      </Link>
                      <p className="text-gray-500 text-sm">
                        Atribuit: {new Date(hw.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Nicio temă atribuită.</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setHomeworkModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;