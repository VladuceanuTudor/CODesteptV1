// src/components/manager/ProblemsTab.tsx
import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from '@/lib/config';

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

interface Props {
  problems: Problem[];
  fetchProblems: () => Promise<void>;
  setActionError: (error: string) => void;
}

const ProblemsTab = ({ problems, fetchProblems, setActionError }: Props) => {
  const [problemModalOpen, setProblemModalOpen] = useState<boolean>(false);
  const [problemForm, setProblemForm] = useState<Problem>({
    _id: "",
    title: "",
    description: "",
    difficulty: "Easy",
    category: "",
    author: { _id: "", username: "" },
    examples: [{ id: 1, inputText: "", outputText: "", explanation: "" }],
    constraints: [""],
    starterCode: "",
    handlerFunction: "",
    starterFunctionName: "",
    testCases: [{ input: "", expectedOutput: "" }],
  });

  // Create or update problem
  const saveProblem = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const method = problemForm._id ? "PUT" : "POST";
      const url = problemForm._id
        ? `${API_BASE_URL}/api/manager/problems/${problemForm._id}`
        : `${API_BASE_URL}/api/manager/problems`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(problemForm),
      });
      const data = await response.json();
      if (response.ok) {
        alert(problemForm._id ? "Problemă actualizată cu succes!" : "Problemă creată cu succes!");
        setProblemModalOpen(false);
        setProblemForm({
          _id: "",
          title: "",
          description: "",
          difficulty: "Easy",
          category: "",
          author: { _id: "", username: "" },
          examples: [{ id: 1, inputText: "", outputText: "", explanation: "" }],
          constraints: [""],
          starterCode: "",
          handlerFunction: "",
          starterFunctionName: "",
          testCases: [{ input: "", expectedOutput: "" }],
        });
        fetchProblems();
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la salvarea problemei:", error);
      setActionError("Nu s-a putut salva problema.");
    }
  };

  // Delete problem
  const deleteProblem = async (problemId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această problemă?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/problems/${problemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Problemă ștearsă cu succes!");
        fetchProblems();
      } else {
        setActionError(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error("Eroare la ștergerea problemei:", error);
      setActionError("Nu s-a putut șterge problema.");
    }
  };

  // Helper functions for dynamic fields
  const handleExampleChange = (index: number, field: string, value: string) => {
    const updatedExamples = [...(problemForm.examples || [])];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setProblemForm({ ...problemForm, examples: updatedExamples });
  };

  const addExample = () => {
    setProblemForm({
      ...problemForm,
      examples: [
        ...(problemForm.examples || []),
        { id: (problemForm.examples?.length || 0) + 1, inputText: "", outputText: "", explanation: "" },
      ],
    });
  };

  const removeExample = (index: number) => {
    setProblemForm({
      ...problemForm,
      examples: (problemForm.examples || []).filter((_, i) => i !== index),
    });
  };

  const handleConstraintChange = (index: number, value: string) => {
    const updatedConstraints = [...(problemForm.constraints || [])];
    updatedConstraints[index] = value;
    setProblemForm({ ...problemForm, constraints: updatedConstraints });
  };

  const addConstraint = () => {
    setProblemForm({
      ...problemForm,
      constraints: [...(problemForm.constraints || []), ""],
    });
  };

  const removeConstraint = (index: number) => {
    setProblemForm({
      ...problemForm,
      constraints: (problemForm.constraints || []).filter((_, i) => i !== index),
    });
  };

  const handleTestCaseChange = (index: number, field: string, value: string) => {
    const updatedTestCases = [...(problemForm.testCases || [])];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setProblemForm({ ...problemForm, testCases: updatedTestCases });
  };

  const addTestCase = () => {
    setProblemForm({
      ...problemForm,
      testCases: [...(problemForm.testCases || []), { input: "", expectedOutput: "" }],
    });
  };

  const removeTestCase = (index: number) => {
    setProblemForm({
      ...problemForm,
      testCases: (problemForm.testCases || []).filter((_, i) => i !== index),
    });
  };

  const openProblemModal = () => {
    setProblemForm({
      _id: "",
      title: "",
      description: "",
      difficulty: "Easy",
      category: "",
      author: { _id: "", username: "" },
      examples: [{ id: 1, inputText: "", outputText: "", explanation: "" }],
      constraints: [""],
      starterCode: "",
      handlerFunction: "",
      starterFunctionName: "",
      testCases: [{ input: "", expectedOutput: "" }],
    });
    setProblemModalOpen(true);
  };

  const openEditProblemModal = (problem: Problem) => {
    setProblemForm({
      ...problem,
      examples: Array.isArray(problem.examples) && problem.examples.length > 0
        ? problem.examples
        : [{ id: 1, inputText: "", outputText: "", explanation: "" }],
      constraints: Array.isArray(problem.constraints) && problem.constraints.length > 0
        ? problem.constraints
        : [""],
      testCases: Array.isArray(problem.testCases) && problem.testCases.length > 0
        ? problem.testCases
        : [{ input: "", expectedOutput: "" }],
      author: problem.author && problem.author._id && problem.author.username
        ? problem.author
        : { _id: "", username: "" },
    });
    setProblemModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestionare Probleme</h2>
        <button
          onClick={openProblemModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Adaugă Problemă
        </button>
      </div>
      {problems.length > 0 ? (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex-1">
                <Link href={`/problems/${problem._id}`}>
                  <p className="text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                    {problem.title}
                  </p>
                </Link>
                <p className="text-gray-400 text-sm">Dificultate: {problem.difficulty}</p>
                <p className="text-gray-400 text-sm">Categorie: {problem.category}</p>
                <p className="text-gray-500 text-sm">
                  Autor: {problem.author?.username || "Necunoscut"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditProblemModal(problem)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Editează
                </button>
                <button
                  onClick={() => deleteProblem(problem._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">Nicio problemă găsită.</div>
      )}

      {/* Problem Create/Edit Modal */}
      {problemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-4">
              {problemForm._id ? "Editează Problemă" : "Adaugă Problemă"}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-1">Titlu</label>
                <input
                  type="text"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Descriere</label>
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Dificultate</label>
                <select
                  value={problemForm.difficulty}
                  onChange={(e) =>
                    setProblemForm({ ...problemForm, difficulty: e.target.value as Problem["difficulty"] })
                  }
                  className="w-full p-2 bg-gray-800 rounded text-white"
                >
                  <option value="Easy">Ușor</option>
                  <option value="Medium">Mediu</option>
                  <option value="Hard">Greu</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Categorie</label>
                <input
                  type="text"
                  value={problemForm.category}
                  onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Exemple</label>
                {problemForm.examples && problemForm.examples.length > 0 ? (
                  problemForm.examples.map((example, index) => (
                    <div key={index} className="space-y-2 mb-4 relative">
                      <input
                        type="text"
                        placeholder="Input"
                        value={example.inputText}
                        onChange={(e) => handleExampleChange(index, "inputText", e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                      />
                      <input
                        type="text"
                        placeholder="Output"
                        value={example.outputText}
                        onChange={(e) => handleExampleChange(index, "outputText", e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                      />
                      <textarea
                        placeholder="Explicație"
                        value={example.explanation || ""}
                        onChange={(e) => handleExampleChange(index, "explanation", e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                        rows={2}
                      />
                      {problemForm.examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExample(index)}
                          className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Niciun exemplu definit.</p>
                )}
                <button
                  type="button"
                  onClick={addExample}
                  className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
                >
                  Adaugă exemplu
                </button>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Constrângeri</label>
                {problemForm.constraints && problemForm.constraints.length > 0 ? (
                  problemForm.constraints.map((constraint, index) => (
                    <div key={index} className="relative mb-2">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => handleConstraintChange(index, e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                      />
                      {problemForm.constraints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConstraint(index)}
                          className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Nicio constrângere definită.</p>
                )}
                <button
                  type="button"
                  onClick={addConstraint}
                  className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
                >
                  Adaugă constrângere
                </button>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Cod de pornire</label>
                <textarea
                  value={problemForm.starterCode}
                  onChange={(e) => setProblemForm({ ...problemForm, starterCode: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  rows={4}
                  placeholder="ex. funcție inițială"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Funcție de gestionare</label>
                <textarea
                  value={problemForm.handlerFunction}
                  onChange={(e) => setProblemForm({ ...problemForm, handlerFunction: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Nume funcție de start</label>
                <input
                  type="text"
                  value={problemForm.starterFunctionName}
                  onChange={(e) => setProblemForm({ ...problemForm, starterFunctionName: e.target.value })}
                  className="w-full p-2 bg-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Cazuri de test</label>
                {problemForm.testCases && problemForm.testCases.length > 0 ? (
                  problemForm.testCases.map((testCase, index) => (
                    <div key={index} className="space-y-2 mb-4 relative">
                      <input
                        type="text"
                        placeholder="Input"
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                      />
                      <input
                        type="text"
                        placeholder="Output așteptat"
                        value={testCase.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-white"
                      />
                      {problemForm.testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Niciun caz de test definit.</p>
                )}
                <button
                  type="button"
                  onClick={addTestCase}
                  className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
                >
                  Adaugă caz de test
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setProblemModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Anulează
              </button>
              <button
                onClick={saveProblem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={
                  !problemForm.title ||
                  !problemForm.description ||
                  !problemForm.category ||
                  !problemForm.examples?.some((ex) => ex.inputText && ex.outputText) ||
                  !problemForm.testCases?.some((tc) => tc.input && tc.expectedOutput)
                }
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemsTab;