// src/components/manager/UsersTab.tsx
import HomeworkModal from "@/components/Modals/HomeworkModal";
// src/components/manager/UsersTab.tsx
import { useState } from "react";
import Link from "next/link";
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
}

interface Props {
  users: User[];
  problems: Problem[];
  fetchUsers: () => Promise<void>;
  setActionError: (error: string) => void;
}

const UsersTab = ({ users, problems, fetchUsers, setActionError }: Props) => {
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [userForm, setUserForm] = useState<Partial<User>>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [homeworkModalOpen, setHomeworkModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [homeworkViewMode, setHomeworkViewMode] = useState<boolean>(false);

  // Debug: Verify setHomeworkModalOpen
  console.log("setHomeworkModalOpen type:", typeof setHomeworkModalOpen);

  // Create or update user
  const saveUser = async () => {
    console.log("saveUser called with userForm:", userForm); // Debug
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage"); // Debug
        setActionError("Te rugăm să te autentifici din nou.");
        return;
      }

      // Validate fields
      if (!userForm.username || !userForm.email || (!userForm._id && !userForm.password)) {
        console.error("Missing required fields:", {
          username: userForm.username,
          email: userForm.email,
          password: userForm.password,
        }); // Debug
        setActionError("Completează toate câmpurile obligatorii.");
        return;
      }

      const method = userForm._id ? "PUT" : "POST";
      const url = userForm._id
        ? `${API_BASE_URL}/api/manager/users/${userForm._id}`
        : `${API_BASE_URL}/api/manager/users`;

      const payload: Partial<User> = {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role || "user",
      };
      if (!userForm._id) {
        payload.password = userForm.password;
      }

      console.log("Sending payload:", payload); // Debug

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("API response:", data); // Debug

      if (response.ok) {
        alert(userForm._id ? "Utilizator actualizat cu succes!" : "Utilizator creat cu succes!");
        setUserModalOpen(false);
        setUserForm({ username: "", email: "", password: "", role: "user" });
        fetchUsers();
      } else {
        setActionError(`Eroare: ${data.error || "Eroare necunoscută la salvarea utilizatorului"}`);
      }
    } catch (error) {
      console.error("Eroare la salvarea utilizatorului:", error);
      setActionError("Nu s-a putut salva utilizatorul. Verifică conexiunea sau încearcă din nou.");
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi acest utilizator?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setActionError("Te rugăm să te autentifici din nou.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/manager/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Utilizator șters cu succes!");
        fetchUsers();
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la ștergerea utilizatorului:", error);
      setActionError("Nu s-a putut șterge utilizatorul.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestionare Utilizatori</h2>
        <button
          onClick={() => {
            console.log("Opening add user modal"); // Debug
            setUserForm({ username: "", email: "", password: "", role: "user" });
            setUserModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Adaugă Utilizator
        </button>
      </div>
      {users.length > 0 ? (
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
                <p className="text-gray-400 text-sm">Email: {user.email}</p>
                <p className="text-gray-400 text-sm">XP: {user.xp}</p>
                <p className="text-gray-500 text-sm">
                  Membru din: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm">Rol: {user.role}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedUserId(user._id);
                    setHomeworkViewMode(false); // Assign mode
                    setHomeworkModalOpen(true);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Atribuie Temă
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(user._id);
                    setHomeworkViewMode(true); // View mode
                    setHomeworkModalOpen(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Vezi Teme
                </button>
                <button
                  onClick={() => {
                    console.log("Opening edit user modal for:", user); // Debug
                    setUserForm({
                      _id: user._id,
                      username: user.username,
                      email: user.email,
                      role: user.role,
                    });
                    setUserModalOpen(true);
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Editează
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={user.role === "manager"}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">Niciun utilizator găsit.</div>
      )}

      {/* User Create/Edit Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {userForm._id ? "Editează Utilizator" : "Adaugă Utilizator"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Nume utilizator</label>
                <input
                  type="text"
                  value={userForm.username || ""}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email || ""}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>
              {!userForm._id && (
                <div>
                  <label className="block text-gray-300 mb-1">Parolă</label>
                  <input
                    type="password"
                    value={userForm.password || ""}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-300 mb-1">Rol</label>
                <select
                  value={userForm.role || "user"}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as User["role"] })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                >
                  <option value="user">Utilizator</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  console.log("Closing user modal"); // Debug
                  setUserModalOpen(false);
                  setUserForm({ username: "", email: "", password: "", role: "user" });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Anulează
              </button>
              <button
                onClick={saveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!userForm.username || !userForm.email || (!userForm._id && !userForm.password)}
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Homework Modal */}
      {homeworkModalOpen && selectedUserId && (
        <HomeworkModal
          userId={selectedUserId}
          problems={problems}
          viewMode={homeworkViewMode}
          setHomeworkModalOpen={setHomeworkModalOpen}
          setSelectedUserId={setSelectedUserId}
          setActionError={setActionError}
        />
      )}
    </div>
  );
};

export default UsersTab;