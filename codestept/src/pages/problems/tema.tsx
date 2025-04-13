// pages/tema.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar/Topbar";
import { API_BASE_URL } from '@/lib/config';

interface Homework {
  problemId: string;
  title: string;
  assignedAt: string;
}

const Tema = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchHomework = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Nu a fost furnizat niciun token. Te rugăm să te autentifici.");
        return;
      }

      // Step 1: Fetch user ID from verify endpoint
      const profileResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        setError(profileData.error || "Eroare la obținerea profilului utilizatorului.");
        return;
      }
      const userId = profileData.user._id;

      // Step 2: Fetch homework
      const homeworkResponse = await fetch(`${API_BASE_URL}/api/homework/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const homeworkData = await homeworkResponse.json();
      if (homeworkResponse.ok) {
        setHomework(homeworkData.homework || []);
      } else {
        setError(homeworkData.error || "Eroare la obținerea temelor.");
      }
    } catch (error) {
      console.error("Eroare la obținerea temelor:", error);
      setError("A apărut o eroare la obținerea temelor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  return (
    <div>
      <Topbar />
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Temele Mele</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-10">Se încarcă...</div>
        ) : homework.length > 0 ? (
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw.problemId}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <Link href={`/problems/${hw.problemId}`}>
                  <p className="text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                    {hw.title}
                  </p>
                </Link>
                <p className="text-gray-500 text-sm">
                  Atribuit: {new Date(hw.assignedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            Nicio temă atribuită.
          </div>
        )}
      </div>
    </div>
  );
};

export default Tema;