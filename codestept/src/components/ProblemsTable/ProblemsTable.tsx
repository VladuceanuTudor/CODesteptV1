import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import YouTube from "react-youtube";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillLike, AiFillDislike, AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { TiStarFullOutline } from "react-icons/ti";
import ProblemSearchBar from "@/components/search/ProblemSearchBar";
import UserSearchBar from "@/components/search/UserSearchBar";
import { Problem } from "@/utils/types/problem";
import { API_BASE_URL } from '@/lib/config';

const ProblemsTable = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [youtubePlayer, setYoutubePlayer] = useState<{
    isOpen: boolean;
    videoId: string;
  }>({
    isOpen: false,
    videoId: "",
  });
  const [starredProblems, setStarredProblems] = useState<string[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]); // New state for solved problems
  const [authorPreviews, setAuthorPreviews] = useState<{ [key: string]: string }>({});
  const [isSearchResult, setIsSearchResult] = useState<boolean>(false);
  const router = useRouter();

  const fetchProblems = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/problems?page=${page}`);
      const data = await response.json();
      if (response.ok) {
        const fetchedProblems = data.problems as Problem[];
        setProblems(fetchedProblems);
        if (!isSearchResult) {
          setFilteredProblems(fetchedProblems);
        }
        setHasMore(data.hasMore as boolean);

        const previews: { [key: string]: string } = {};
        fetchedProblems.forEach((problem) => {
          if (problem.author && problem.author._id) {
            previews[problem.author._id] = problem.author.profilePic || "/avatar.png";
          } else {
            previews[`unknown_${problem._id}`] = "/avatar.png";
          }
        });
        setAuthorPreviews(previews);
      } else {
        console.error("Error fetching problems:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verifyAndFetchUser = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setStarredProblems(data.user.starredProblems.map((id: any) => id.toString())); // Normalize to strings
            setSolvedProblems(data.user.solvedProblems.map((id: any) => id.toString())); // Fetch and normalize solvedProblems
          } else {
            setStarredProblems([]);
            setSolvedProblems([]);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          setStarredProblems([]);
          setSolvedProblems([]);
        }
      };
      verifyAndFetchUser();
    } else {
      setStarredProblems([]);
      setSolvedProblems([]);
    }
  }, []);

  useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage]);

  const handleProblemSearch = (searchedProblems: Problem[]) => {
    const filtered = selectedCategory === "All"
      ? searchedProblems
      : searchedProblems.filter((p) => p.category === selectedCategory);
    setFilteredProblems(filtered);
    setIsSearchResult(true);
  };

  const handleBackToMain = () => {
    setFilteredProblems(problems);
    setIsSearchResult(false);
  };

  const categories = ["All", ...new Set(problems.map((p) => p.category))];

  const closeModal = () => {
    setYoutubePlayer({ isOpen: false, videoId: "" });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="w-full p-4 bg-gray-900 min-h-screen">
      <div className="mb-6 flex flex-col space-y-4 px-2">
        <div className="flex space-x-4">
          <ProblemSearchBar onSearch={handleProblemSearch} />
          <select
            className="p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {isSearchResult && (
          <button
            onClick={handleBackToMain}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
          >
            Inapoi la toate problemele
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      ) : filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {filteredProblems.map((doc) => {
            const difficultyColor =
              doc.difficulty === "Easy"
                ? "text-green-400 border-green-400"
                : doc.difficulty === "Medium"
                ? "text-yellow-400 border-yellow-400"
                : "text-red-400 border-red-400";

            const authorKey = doc.author?._id || `unknown_${doc._id}`;

            return (
              <div
                key={doc._id}
                className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 flex flex-col justify-between hover:bg-gray-700 transition-colors duration-200 min-h-[250px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {solvedProblems.includes(doc._id) && ( // Show BsCheckCircle only if solved
                      <BsCheckCircle fontSize={20} className="text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${difficultyColor}`}>
                      {doc.difficulty}
                    </span>
                  </div>
                  <Link
                    href={`/problems/${doc._id}`}
                    className="text-blue-400 hover:text-blue-300 text-xl font-semibold transition-colors duration-200"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-gray-300 text-base mt-2">{doc.category}</p>
                  <div
                    className="flex items-center mt-2 cursor-pointer"
                    onClick={() => doc.author?._id && router.push(`/profile/${doc.author.username}`)}
                  >
                    <img
                      src={authorPreviews[authorKey] || "/avatar.png"}
                      alt={`${doc.author?.username || "Unknown"}'s avatar`}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                    />
                    <p className="text-gray-400 text-sm hover:text-gray-200 transition-colors duration-200">
                      Author: {doc.author?.username || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-400">
                      <AiFillLike className="mr-1 text-blue-500" />
                      <span>{doc.likes || 0}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <AiFillDislike className="mr-1 text-red-500" />
                      <span>{doc.dislikes || 0}</span>
                    </div>
                  </div>
                  {starredProblems.includes(doc._id) && (
                    <TiStarFullOutline className="text-yellow-400" />
                  )}
                </div>
                <div className="mt-6">
                  {doc.videoId ? (
                    <button
                      onClick={() =>
                        setYoutubePlayer({
                          isOpen: true,
                          videoId: doc.videoId as string,
                        })
                      }
                      className="flex items-center text-red-500 hover:text-red-400 transition-colors duration-200"
                    >
                      <AiFillYoutube fontSize={30} className="mr-2" />
                      <span className="text-base">Watch Solution</span>
                    </button>
                  ) : (
                    <p className="text-gray-400 italic text-base">
                      Video coming soon
                    </p>
                  )}
                </div>
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
          disabled={!hasMore || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
        >
          Next
        </button>
      </div>

      {youtubePlayer.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={closeModal}
          ></div>
          <div className="relative w-full max-w-4xl p-4">
            <IoClose
              fontSize={35}
              className="absolute top-0 right-0 m-4 text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
              onClick={closeModal}
            />
            <YouTube
              videoId={youtubePlayer.videoId}
              loading="lazy"
              iframeClassName="w-full h-[500px] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemsTable;