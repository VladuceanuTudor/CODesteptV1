import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CommentCard from "@/components/Comments/CommentCard";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Topbar from "@/components/Topbar/Topbar";

interface Comment {
  _id: string;
  text: string;
  problemId: string;
  userId: { _id: string; username: string };
  createdAt: string;
}

export default function ProblemCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [problemTitle, setProblemTitle] = useState<string>(""); // New state for problem title
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { pid } = router.query;

  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const redirectToHome = (message: string) => {
    toast.warning(message);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const fetchComments = async (problemId: string): Promise<{ comments: Comment[]; problemTitle: string }> => {
    const API_BASE_URL = process.env.API_URL || "http://localhost:5000";
    const response = await fetch(`${API_BASE_URL}/api/comments/${problemId}/comments`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch comments");
    }

    return response.json();
  };

  const postComment = async (problemId: string, text: string): Promise<Comment> => {
    const API_BASE_URL = process.env.API_URL || "http://localhost:5000";
    const response = await fetch(`${API_BASE_URL}/api/comments/${problemId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized");
      if (response.status === 400) throw new Error("Comment text is required");
      if (response.status === 404) throw new Error("Problem not found");
      throw new Error("Failed to post comment");
    }

    return response.json();
  };

  useEffect(() => {
    if (!pid) return;

    const loadComments = async () => {
      if (!isAuthenticated()) {
        redirectToHome("You must be logged in to view comments.");
        return;
      }

      try {
        const data = await fetchComments(pid as string);
        setComments(data.comments);
        setProblemTitle(data.problemTitle); // Set the problem title
      } catch (err: any) {
        if (err.message === "Unauthorized") {
          redirectToHome("Your session has expired. Please log in.");
        } else {
          setError("Failed to load comments. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [pid]);

  useEffect(() => {
    const warning = router.query.warning;
    if (warning) {
      toast.warning(typeof warning === "string" ? warning : warning[0]);
    }
  }, [router.query.warning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid) return;

    if (!newComment.trim()) {
      setSubmitError("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const postedComment = await postComment(pid as string, newComment);
      setComments([postedComment, ...comments]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        redirectToHome("Your session has expired. Please log in.");
      } else {
        setSubmitError(err.message || "Failed to post comment.");
        toast.error(err.message || "Failed to post comment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-400 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div>
        <Topbar />
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto py-12 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-white">
          💬 Commentarii la problema: <span className="text-indigo-400">{problemTitle || "Loading..."}</span>
        </h1>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y transition duration-300 leading-relaxed"
            rows={5}
            disabled={isSubmitting}
          />
          {submitError && (
            <p className="text-red-400 text-sm">{submitError}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Posting...
                </span>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="mt-12">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-center text-lg italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition duration-200"
                >
                  <CommentCard comment={comment} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}