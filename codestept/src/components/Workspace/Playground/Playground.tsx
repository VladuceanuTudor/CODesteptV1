import React, { useState, useEffect } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import useLocalStorage from "@/Hooks/useLocalStorage";
import Split from "react-split";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import EditorFooter from "./EditorFooter";
import { Extension } from "@codemirror/state"; // Import Extension type
import { LanguageSupport } from "@codemirror/language"; // Import LanguageSupport type
import { useAtom } from "jotai";
import { authModalState } from "@/atoms/authModalAtom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { API_BASE_URL } from '@/lib/config';

// Dynamically import CodeMirror with SSR disabled
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

// Load extensions and theme statically or dynamically with proper typing
const cppExtension = async (): Promise<Extension> => {
  const { cpp } = await import("@codemirror/lang-cpp");
  return cpp();
};

const vscodeDarkTheme = async (): Promise<Extension> => {
  const { vscodeDark } = await import("@uiw/codemirror-theme-vscode");
  return vscodeDark;
};

// Define the Problem interface
interface Problem {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { id: string; inputText: string; outputText: string; explanation?: string }[];
  testCases: { input: string; expectedOutput: string; _id?: string }[];
  starterCode: string;
}

interface ISettings {
  fontSize: string;
  settingsModalIsOpen: boolean;
  dropdownIsOpen: boolean;
}

type PlaygroundProps = {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

const Playground: React.FC<PlaygroundProps> = ({ setSuccess, setSolved }) => {
  const router = useRouter();
  const { pid } = router.query;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [theme, setTheme] = useState<Extension | undefined>(undefined);
  const [authMState, setAuthMState] = useAtom(authModalState);

  const [settings, setSettings] = useState<ISettings>({
    fontSize: fontSize,
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
  });

  const [userCode, setUserCode] = useState<string>(() => {
    if (typeof window !== "undefined" && pid) {
      const savedCode = localStorage.getItem(`code-${pid}`);
      return savedCode ? JSON.parse(savedCode) : "";
    }
    return "";
  });

  // Load extensions and theme once on mount
  useEffect(() => {
    const loadExtensionsAndTheme = async () => {
      const cppExt = await cppExtension();
      const vsTheme = await vscodeDarkTheme();
      setExtensions([cppExt]);
      setTheme(vsTheme);
    };
    loadExtensionsAndTheme();
  }, []);

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      if (!pid) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/problems/${pid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProblem(data);
        if (!localStorage.getItem(`code-${pid}`)) {
          setUserCode(data.starterCode);
        }
      } catch (err: unknown) {
        const error = err as Error; // Type assertion
        console.error("❌ Fetch error:", error);
        setError(error.message || "Internal server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [pid, API_BASE_URL]);

  const onChange = (value: string) => {
    setUserCode(value);
    if (typeof window !== "undefined" && pid) {
      localStorage.setItem(`code-${pid}`, JSON.stringify(value));
    }
  };

  const handleSubmit = async () => {
    if (!problem || !pid) return;
  
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (!token) {
        toast.error("Nu esti autentificat. Te rog autentifica-te.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
        setAuthMState((prev) => ({ ...prev, isOpen: true, type: "login" }));
        setTimeout(() => {
          router.push("/auth");
        }, 4500); // Redirect after 3 seconds to allow toast to show
        return; // Exit after setting up the redirect
      }
  
      const response = await fetch(`${API_BASE_URL}/api/problems/${pid}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Add token to Authorization header
        },
        body: JSON.stringify({ sourceCode: userCode }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setTestResults(data.results);
      const allPassed = data.results.every((result: any) => result.status === "passed");
      if (allPassed) {
        setSuccess(true);
        setSolved(true);
      } else {
        setSuccess(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("❌ Submission error:", error);
      setTestResults([{ status: "error", details: error.message || "Internal server error" }]);
      setSuccess(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error || !problem) {
    return <div className="text-white">{error || "Problem not found"}</div>;
  }

  return (
    <div>
      
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <Split className="h-[calc(100vh-94px)]" direction="vertical" sizes={[60, 40]} minSize={60}>
        <div className="w-full overflow-auto">
          {extensions.length > 0 && theme && (
            <CodeMirror
              value={userCode}
              theme={theme}
              onChange={onChange}
              extensions={extensions}
              style={{ fontSize: settings.fontSize }}
            />
          )}
        </div>
        <div className="w-full px-5 overflow-auto">
          <div className="flex h-10 items-center space-x-6">
            <div className="relative flex h-full flex-col justify-center cursor-pointer">
              <div className="text-sm font-medium leading-5 text-white">Testcases</div>
              <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
            </div>
          </div>

          <div className="flex">
            {problem.examples.map((example, index) => (
              <div
                className="mr-2 items-start mt-2"
                key={example.id}
                onClick={() => setActiveTestCaseId(index)}
              >
                <div className="flex flex-wrap items-center gap-y-4">
                  <div
                    className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap ${
                      activeTestCaseId === index ? "text-white" : "text-gray-500"
                    }`}
                  >
                    Case {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="font-semibold my-4">
            <p className="text-sm font-medium mt-4 text-white">Input:</p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
              {problem.examples[activeTestCaseId].inputText}
            </div>
            <p className="text-sm font-medium mt-4 text-white">Output:</p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
              {problem.examples[activeTestCaseId].outputText}
            </div>
            {testResults.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white">Test Results:</p>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`mt-2 p-2 rounded-lg ${
                      result.status === "passed" ? "bg-green-800" : "bg-red-800"
                    }`}
                  >
                    <p className="text-white">
                      Test Case {index + 1}: {result.status === "passed" ? "Passed" : "Failed"}
                    </p>
                    {result.details && (
                      <p className="text-white text-sm">{result.details}</p>
                    )}
                    {result.actual && (
                      <p className="text-white text-sm">Actual: {result.actual}</p>
                    )}
                    {result.expected && (
                      <p className="text-white text-sm">Expected: {result.expected}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
		  
        </div>
      </Split>
	  <EditorFooter handleSubmit={handleSubmit} />
    </div>
  );
};

export default Playground;