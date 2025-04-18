import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from '@/lib/config';

interface Problem {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problemStatement: string;
  description: string;
  examples: { inputText: string; outputText: string; explanation?: string }[];
  constraints?: string[];
  likes: number;
  dislikes: number;
  likedBy: string[]; // Array of user IDs
  dislikedBy: string[]; // Array of user IDs
}

const ProblemDescription: React.FC = () => {
  const router = useRouter();
  const { pid } = router.query;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [user, setUser] = useState<any>(null); // Store authenticated user data

  // Verify token and set user (runs once on mount)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verifyToken = async () => {
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (verifyResponse.ok) {
            const userData = await verifyResponse.json();
            setUser(userData.user);
          } else {
            setUser(null);
          }
        } catch (err) {
          setUser(null);
        }
      };
      verifyToken();
    } else {
      setUser(null);
    }
  }, []);

  // Fetch problem data (independent of authentication)
  useEffect(() => {
    const fetchProblem = async () => {
      if (!pid) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/problems/${pid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        setError((err as Error).message || "Internal server error");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [pid]);

  // Set interaction states based on problem and user
  useEffect(() => {
    if (problem && user) {
      setIsLiked(problem.likedBy.includes(user._id));
      setIsDisliked(problem.dislikedBy.includes(user._id));
      setIsStarred(user.starredProblems.includes(pid));
    } else {
      setIsLiked(false);
      setIsDisliked(false);
      setIsStarred(false);
    }
  }, [problem, user]);

  // Handle like button click
  const handleLike = async () => {
    if (!user) {
      toast.error("Nu esti autentificat. Te rog autentifica-te.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/problems/${pid}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to like problem");
      const data = await response.json();
      setProblem((prev) =>
        prev ? { ...prev, likes: data.likes, likedBy: data.likedBy, dislikedBy: data.dislikedBy } : null
      );
      setIsLiked(data.likedBy.includes(user._id));
      setIsDisliked(data.dislikedBy.includes(user._id));
    } catch (err) {
      console.error("Error liking problem:", err);
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    if (!user) {
      toast.error("Nu esti autentificat. Te rog autentifica-te.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/problems/${pid}/dislike`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to dislike problem");
      const data = await response.json();
      setProblem((prev) =>
        prev ? { ...prev, dislikes: data.dislikes, likedBy: data.likedBy, dislikedBy: data.dislikedBy } : null
      );
      setIsLiked(data.likedBy.includes(user._id));
      setIsDisliked(data.dislikedBy.includes(user._id));
    } catch (err) {
      console.error("Error disliking problem:", err);
    }
  };

  // Handle star button click
  const handleStar = async () => {
    if (!user) {
      toast.error("Nu esti autentificat. Te rog autentifica-te.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/star/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to star problem");
      const data = await response.json();
      setIsStarred(data.starredProblems.includes(pid));
    } catch (err) {
      console.error("Error starring problem:", err);
    }
  };

  // Rendering logic
  if (loading) {
    return <div className="bg-dark-layer-1 h-[calc(100vh-94px)] flex items-center justify-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-dark-layer-1 h-[calc(100vh-94px)] flex items-center justify-center text-white">{error}</div>;
  }

  if (!problem) {
    return <div className="bg-dark-layer-1 h-[calc(100vh-94px)] flex items-center justify-center text-white">Problem not found</div>;
  }

  const difficultyColor =
    problem.difficulty === "Easy"
      ? "text-olive bg-olive"
      : problem.difficulty === "Medium"
      ? "text-yellow-400 bg-yellow-400"
      : "text-red-400 bg-red-400";

  return (
    <div className="bg-dark-layer-1">
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden">
        <div className="bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer">Description</div>
      </div>

      <div className="flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto">
        <div className="px-5">
          <div className="w-full">
            <div className="flex space-x-4">
              <div className="flex-1 mr-2 text-lg text-white font-medium">{problem.title}</div>
            </div>
            <div className="flex items-center mt-3">
              <div
                className={`${difficultyColor} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize`}
              >
                {problem.difficulty}
              </div>
              {/* <div className="rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s">
                <BsCheck2Circle />
              </div> */}
              <div
                onClick={handleLike}
                className={`flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px] ml-4 text-lg transition-colors duration-200 ${
                  isLiked ? "text-blue-500" : "text-dark-gray-6"
                }`}
              >
                <AiFillLike />
                <span className="text-xs">{problem.likes}</span>
              </div>
              <div
                onClick={handleDislike}
                className={`flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px] ml-4 text-lg transition-colors duration-200 ${
                  isDisliked ? "text-red-500" : "text-dark-gray-6"
                }`}
              >
                <AiFillDislike />
                <span className="text-xs">{problem.dislikes}</span>
              </div>
              <div
                onClick={handleStar}
                className="cursor-pointer hover:bg-dark-fill-3 rounded p-[3px] ml-4 text-xl transition-colors duration-200 text-dark-gray-6"
              >
                {isStarred ? <TiStarFullOutline className="text-yellow-400" /> : <TiStarOutline />}
              </div>
            </div>

            <div className="text-white text-sm">
              <p className="mt-3" dangerouslySetInnerHTML={{ __html: problem.problemStatement }} />
            </div>

            <div className="text-white text-sm">
              <p className="mt-3" dangerouslySetInnerHTML={{ __html: problem.description }} />
            </div>

            <div className="mt-4">
              {problem.examples.map((example, index) => (
                <div key={index}>
                  <p className="font-medium text-white">Example {index + 1}: </p>
                  <div className="example-card">
                    <pre>
                      <strong className="text-white">Input: </strong> {example.inputText} <br />
                      <strong>Output: </strong> {example.outputText} <br />
                      {example.explanation && (
                        <>
                          <strong>Explanation: </strong> {example.explanation}
                        </>
                      )}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5">
              <div className="text-white text-sm font-medium">Constraints:</div>
              <ul className="text-white ml-5 list-disc">
                {Array.isArray(problem.constraints) && problem.constraints.length > 0 ? (
                  problem.constraints.map((constraint, index) => (
                    <li key={index} className="mt-2">
                      <code>{constraint}</code>
                    </li>
                  ))
                ) : (
                  <li className="mt-2 text-gray-400">No constraints provided</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;