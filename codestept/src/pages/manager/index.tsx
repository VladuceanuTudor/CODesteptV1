// src/pages/manager/index.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Topbar from "@/components/Topbar/Topbar";
import UsersTab from "@/components/manager/UsersTab";
import ProblemsTab from "@/components/manager/ProblemsTab";
import { API_BASE_URL } from '@/lib/config';


interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePic?: string;
  xp: number;
  role: "user" | "admin" | "manager";
  createdAt: string;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  author: { _id: string; username: string };
  examples: Array<{ id: number; inputText: string; outputText: string; explanation?: string }>;
  constraints: string[];
  starterCode: string;
  handlerFunction: string;
  starterFunctionName: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
}

const ManagerPage = () => {
  const router = useRouter();
  const [isManager, setIsManager] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<"users" | "problems">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [actionError, setActionError] = useState<string>("");

  // Check manager status
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Niciun token găsit. Te rugăm să te autentifici.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/is-manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.isManager) {
        setIsManager(true);
      } else {
        setError("Acces neautorizat. Doar managerii pot accesa această pagină.");
        router.push("/");
      }
    } catch (error) {
      console.error("Eroare la verificarea statutului de manager:", error);
      setError("Eroare la verificarea statutului de manager.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setActionError(`Eroare la obținerea utilizatorilor: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la obținerea utilizatorilor:", error);
      setActionError("Nu s-a putut obține lista de utilizatori.");
    }
  };

  // Fetch problems
  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setProblems(data.problems || []);
      } else {
        setActionError(`Eroare la obținerea problemelor: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la obținerea problemelor:", error);
      setActionError("Nu s-a putut obține lista de probleme.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (isManager) {
      fetchUsers();
      fetchProblems();
    }
  }, [isManager]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!isManager) {
    return null;
  }

  return (
    <div>
      <Topbar />
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Panou de Manager</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded-md">{error}</div>
        )}
        {actionError && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded-md">{actionError}</div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-md ${
              tab === "users" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            Utilizatori
          </button>
          <button
            onClick={() => setTab("problems")}
            className={`px-4 py-2 rounded-md ${
              tab === "problems" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            Probleme
          </button>
        </div>

        {/* Render Tabs */}
        {tab === "users" && (
          <UsersTab
            users={users}
            problems={problems}
            fetchUsers={fetchUsers}
            setActionError={setActionError}
          />
        )}
        {tab === "problems" && (
          <ProblemsTab
            problems={problems}
            fetchProblems={fetchProblems}
            setActionError={setActionError}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerPage;