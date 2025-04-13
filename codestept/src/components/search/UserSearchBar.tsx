import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { API_BASE_URL } from '@/lib/config';

interface User {
  _id: string;
  username: string;
  profilePic: string;
}

const UserSearchBar = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/search?query=${query}`);
        const data = await response.json();
        if (response.ok) {
          setSuggestions(data.users);
        } else {
          console.error("Error fetching suggestions:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((user) => (
            <li
              key={user._id}
              onClick={() => router.push(`/profile/${user.username}`)}
              className="p-2 text-white hover:bg-gray-600 cursor-pointer"
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchBar;