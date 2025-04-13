import { useState, useEffect } from "react";
import { Problem } from "@/utils/types/problem"; // Import the shared Problem type
import { API_BASE_URL } from '@/lib/config';

interface ProblemSearchBarProps {
  onSearch: (problems: Problem[]) => void;
}

const ProblemSearchBar = ({ onSearch }: ProblemSearchBarProps) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Problem[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/problems/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.problems)) {
          setSuggestions(data.problems);
        } else {
          console.error("Error fetching suggestions:", data.error || "Invalid response");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (selectedProblem?: Problem) => {
    if (selectedProblem) {
      onSearch([selectedProblem]);
      setQuery(selectedProblem.title);
    } else if (suggestions.length > 0) {
      onSearch(suggestions);
    } else if (query) {
      fetchSuggestionsAndSearch();
    }
    setSuggestions([]);
  };

  const fetchSuggestionsAndSearch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/problems/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.problems)) {
        onSearch(data.problems);
      } else {
        console.error("Error fetching suggestions:", data.error || "Invalid response");
        onSearch([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      onSearch([]);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search by title, category, or author"
        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {query.length >= 2 && (
        suggestions.length > 0 ? (
          <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">
            {suggestions.map((problem) => (
              <li
                key={problem._id}
                onClick={() => handleSearch(problem)}
                className="p-2 text-white hover:bg-gray-600 cursor-pointer"
              >
                {problem.title} ({problem.difficulty}) - {problem.category} - {problem.author?.username || "Unknown"}
              </li>
            ))}
          </ul>
        ) : (
          <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 p-2 text-white">
            No results found
          </div>
        )
      )}
    </div>
  );
};

export default ProblemSearchBar;