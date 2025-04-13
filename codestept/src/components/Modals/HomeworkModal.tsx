// src/components/manager/HomeworkModal.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from '@/lib/config';

interface Homework {
  problemId: string;
  title: string;
  assignedAt: string;
}

interface Problem {
  _id: string;
  title: string;
}

interface Props {
  userId: string;
  problems: Problem[];
  viewMode: boolean;
  setHomeworkModalOpen: (open: boolean) => void;
  setSelectedUserId: (id: string) => void;
  setActionError: (error: string) => void;
}

const HomeworkModal = ({ userId, problems, viewMode, setHomeworkModalOpen, setSelectedUserId, setActionError }: Props) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  // Debug: Verify props
  console.log("HomeworkModal props:", { setHomeworkModalOpen: typeof setHomeworkModalOpen });

  // Fetch homework
  const fetchHomework = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/homework/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setHomework(data.homework || []);
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la obținerea temelor:", error);
      setActionError("Nu s-a putut obține tema.");
    }
  };

  // Assign homework
  const assignHomework = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/homework/assign/${userId}`, {
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
        if (typeof setHomeworkModalOpen === "function") {
          setHomeworkModalOpen(false);
        }
        setSelectedProblems([]);
        setSelectedUserId("");
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la atribuirea temei:", error);
      setActionError("Nu s-a putut atribui tema.");
    }
  };

  // Fetch homework when in view mode
  useEffect(() => {
    if (viewMode) {
      fetchHomework();
    } else {
      setHomework([]);
      setSelectedProblems([]);
    }
  }, [viewMode, userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{viewMode ? "Teme Atribuite" : "Atribuie Temă"}</h2>
        {viewMode ? (
          homework.length > 0 ? (
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
          )
        ) : (
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
        )}
        <div className="mt-4 flex justify-end space-x-2">
          {viewMode ? (
            <button
              onClick={() => {
                if (typeof setHomeworkModalOpen === "function") {
                  setHomeworkModalOpen(false);
                }
                setSelectedUserId("");
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Închide
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  if (typeof setHomeworkModalOpen === "function") {
                    setHomeworkModalOpen(false);
                  }
                  setSelectedProblems([]);
                  setSelectedUserId("");
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkModal;