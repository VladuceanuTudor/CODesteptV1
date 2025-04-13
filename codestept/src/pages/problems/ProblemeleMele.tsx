import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillLike, AiFillDislike, AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { TiStarFullOutline } from "react-icons/ti";
import ProblemSearchBar from "@/components/search/ProblemSearchBar";
import { Problem } from "@/utils/types/problem";
import Topbar from "@/components/Topbar/Topbar";
import { API_BASE_URL } from '@/lib/config';

const ProblemeleMele: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);  // Added error state
  const router = useRouter();

  const fetchProblems = async (page: number) => {
    setLoading(true);
    setError(null);  // Reset error state before each fetch
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/problems/myProblems?page=${page}&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("You don't have permission to access these problems.");
        } else {
          setError("An error occurred while fetching problems.");
        }
      } else {
        const data = await response.json();
        setProblems(data);
      }
    } catch (error) {
      setError("Error fetching problems: " +error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage]);

  return (
    <div >
      <Topbar  />
      <div className="w-full p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl text-white font-bold mb-6">Problemele create de mine:</h1>
  {loading ? (
    <div className="text-center text-gray-400 py-10">Loading...</div>
  ) : error ? (
    <div className="text-center text-red-400 py-10">{error}</div> // Show error if there is any
  ) : problems.length > 0 ? (
    <div className="space-y-6 px-2"> {/* Changed from grid to vertical list */}
      {problems.map((doc) => {
        const difficultyColor =
          doc.difficulty === "Easy"
            ? "text-green-400 border-green-400"
            : doc.difficulty === "Medium"
            ? "text-yellow-400 border-yellow-400"
            : "text-red-400 border-red-400";

        return (
          <div
            key={doc._id}
            className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 flex flex-col justify-between hover:bg-gray-700 transition-colors duration-200"
          >
            <Link
              href={`/problems/edit/${doc._id}`}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <BsCheckCircle fontSize={20} className="text-green-500" />
                <span className={`text-sm font-medium ${difficultyColor}`}>
                  {doc.difficulty}
                </span>
              </div>
              <p className="text-blue-400 hover:text-blue-300 text-xl font-semibold transition-colors duration-200">
                {doc.title}
              </p>
              <p className="text-gray-300 text-base mt-2">{doc.category}</p>

              <div className="mt-4 text-right text-blue-400 hover:text-blue-300 cursor-pointer">
                Edit
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="text-center text-gray-400 py-10">
      No problems found.
    </div>
  )}

  <div className="mt-6 flex justify-between items-center px-2">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1 || loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
    >
      Previous
    </button>
    <span className="text-gray-300">Page {currentPage}</span>
    <button
      onClick={() => setCurrentPage((prev) => prev + 1)}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
    >
      Next
    </button>
  </div>
</div>

    </div>
  );
};

export default ProblemeleMele;
