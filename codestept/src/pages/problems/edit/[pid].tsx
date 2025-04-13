import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Topbar from "@/components/Topbar/Topbar";
import { API_BASE_URL } from '@/lib/config';

const EditProblem: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    description: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    category: "",
    examples: [{ inputText: "", outputText: "", explanation: "" }],
    constraints: [""],
    starterCode: "",
    handlerFunction: "",
    starterFunctionName: "",
    testCases: [{ input: "", expectedOutput: "" }],
  });
  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (pid) {
      const fetchProblem = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You must be logged in to edit a problem.");
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/problems/edit/${pid}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            setFormData(data); // Assuming backend returns problem directly
          } else {
            alert(`Error: ${data.error}`);
          }
        } catch (error) {
          console.error("Error fetching problem:", error);
          alert("An error occurred while fetching the problem.");
        }
      };

      fetchProblem();
    }
  }, [pid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExampleChange = (index: number, field: string, value: string) => {
    const updatedExamples = [...formData.examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setFormData((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const handleConstraintChange = (index: number, value: string) => {
    const updatedConstraints = [...formData.constraints];
    updatedConstraints[index] = value;
    setFormData((prev) => ({ ...prev, constraints: updatedConstraints }));
  };

  const handleTestCaseChange = (index: number, field: string, value: string) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setFormData((prev) => ({ ...prev, testCases: updatedTestCases }));
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { inputText: "", outputText: "", explanation: "" }],
    }));
  };

  const removeExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };
  const handleBackToMain = () => {
    router.push("/problems/ProblemeleMele"); // Redirect to the main problems page
  };

  const addConstraint = () => {
    setFormData((prev) => ({ ...prev, constraints: [...prev.constraints, ""] }));
  };

  const removeConstraint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  };

  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expectedOutput: "" }],
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update a problem.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/problems/edit/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Problem updated successfully!");
        router.push("/"); // Redirect to home or problems list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("An error occurred while updating the problem.");
    }
  };

  if (!pid) return <div>Loading...</div>;

  return (
    <div>
        <Topbar />
    <div className="min-h-screen bg-gray-900 p-6 text-white">
        <button
            onClick={handleBackToMain}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
          >
            Inapoi la toate problemele
          </button>
      <h1 className="text-3xl font-bold mb-6">Editează problema</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Form fields remain unchanged */}
        <div>
          <label className="block mb-1">Titlu</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Enunț problemă</label>
          <textarea
            name="problemStatement"
            value={formData.problemStatement}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Descriere</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Dificultate</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Categorie</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Exemple</label>
          {formData.examples.map((example, index) => (
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
                placeholder="Explanation"
                value={example.explanation}
                onChange={(e) => handleExampleChange(index, "explanation", e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white"
                rows={2}
              />
              {formData.examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                >
                  Șterge
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExample}
            className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
          >
            Adaugă exemplu
          </button>
        </div>
        <div>
          <label className="block mb-1">Constrângeri</label>
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="relative mb-2">
              <input
                type="text"
                value={constraint}
                onChange={(e) => handleConstraintChange(index, e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white"
              />
              {formData.constraints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConstraint(index)}
                  className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                >
                  Șterge
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addConstraint}
            className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
          >
            Adaugă constrângere
          </button>
        </div>
        <div>
          <label className="block mb-1">Cod inițial</label>
          <textarea
            name="starterCode"
            value={formData.starterCode}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
            rows={4}
            placeholder="e.g., ListNode* mergeKLists(vector<ListNode*>& lists) { }"
          />
        </div>
        <div>
          <label className="block mb-1">Cazuri de test</label>
          {formData.testCases.map((testCase, index) => (
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
                placeholder="Expected Output"
                value={testCase.expectedOutput}
                onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white"
              />
              {formData.testCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTestCase(index)}
                  className="absolute top-0 right-0 bg-red-600 py-1 px-2 rounded text-white hover:bg-red-700"
                >
                  Șterge
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="bg-blue-600 py-1 px-3 rounded text-white hover:bg-blue-700"
          >
            Adaugă caz de test
          </button>
        </div>
        <button
          type="submit"
          className="bg-lime-600 py-2 px-4 rounded text-black hover:bg-lime-700"
        >
          Actualizează problema
        </button>
      </form>
    </div>
    </div>
  );
};

export default EditProblem;