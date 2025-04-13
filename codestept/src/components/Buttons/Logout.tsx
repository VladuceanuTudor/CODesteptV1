import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/router";

const Logout: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
        // Remove token from localStorage
        localStorage.removeItem("token");

        // Optionally clear other stored user data (if any)
        localStorage.removeItem("user");

        // Redirect to login page
        router.push("/auth");
    };

    return (
        <button
            className="bg-dark-fill-2 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-divider-border-2"
            onClick={handleLogout}
        >
            <FiLogOut color="black" />
        </button>
    );
};

export default Logout;
