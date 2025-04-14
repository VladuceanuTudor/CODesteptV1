// src/components/manager/ProblemCommentsModal.tsx
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";

interface Comment {
  _id: string;
  text: string;
  problemId: string;
  userId: { _id: string; username: string };
  createdAt: string;
}

interface Props {
  problemId: string;
  problemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  setActionError: (error: string) => void;
}

const ProblemCommentsModal = ({ problemId, problemTitle, isOpen, onClose, setActionError }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null); // Track which comment is being deleted

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/comments/${problemId}/comments`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la încărcarea comentariilor:", error);
      setActionError("Nu s-a putut încărca lista de comentarii.");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi acest comentariu?")) return;
    try {
      setDeleting(commentId);
      const response = await fetch(`${API_BASE_URL}/api/comments/comments/${commentId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId));
        alert("Comentariu șters cu succes!");
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la ștergerea comentariului:", error);
      setActionError("Nu s-a putut șterge comentariul.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (isOpen && problemId) {
      fetchComments();
    }
  }, [isOpen, problemId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Comentarii pentru: <span className="text-blue-400">{problemTitle}</span>
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-start"
              >
                <div>
                  <p className="text-gray-200">{comment.text}</p>
                  <p className="text-gray-400 text-sm">
                    Postat de: {comment.userId.username} la{" "}
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(comment._id)}
                  disabled={deleting === comment._id}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed"
                >
                  {deleting === comment._id ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      Ștergere...
                    </span>
                  ) : (
                    "Șterge"
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Niciun comentariu găsit.</p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemCommentsModal;