import React, { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { authModalState } from "@/atoms/authModalAtom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from '@/lib/config';


const ResetPasswd: React.FC = () => {
	const setAuthModal = useSetAtom(authModalState);
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleClick = (type: "login" | "register" | "forgotPassword") => {
		setAuthModal((prev) => ({ ...prev, type }));
	};

	useEffect(() => {
		if (error) {
			alert(error);
		}
	}, [error]);

	const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
	
		try {
			const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
	
			// ✅ Ensure response is valid JSON
			const data = await response.json().catch(() => null);
			console.log("API Response:", data); // ✅ Debugging
	
			// ✅ Check if data is valid and has 'success' or 'error'
			if (!response.ok || !data) {
				throw new Error(data?.error || "Ceva nu a mers bine, te rog incearca din nou.");
			}
			
			toast.success("Email de resetare a parolei trimis.", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		} catch (err: any) {
			console.error("Error:", err); // ✅ Debugging
			setError(err.message);
	
			toast.error(err.message, {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		} finally {
			setLoading(false);
		}
	};	
	

	return (
		<form className="space-y-6 px-6 lg:px-8 pb-4 sm:pb-6 xl:pb-8" onSubmit={handleReset}>
			<h3 className="text-xl font-medium text-white">Resetează parola</h3>
			<p className="text-sm text-white">
				Ți-ai uitat parola? Îți putem trimite un mail prin intermediul căruia să o resetezi.
			</p>
			<div>
				<label htmlFor="email" className="text-sm font-medium block mb-2 text-gray-300">
					Adresa ta de email:
				</label>
				<input
					type="email"
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					id="email"
					className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
					placeholder="nume@companie.com"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-lime-600 hover:bg-lime-700 ${
					loading ? "opacity-50 cursor-not-allowed" : ""
				}`}
			>
				{loading ? "Se trimite..." : "Resetează parola"}
			</button>

			<div className="text-sm font-medium text-gray-500" onClick={() => handleClick("login")}>
				<a href="#" className="text-blue-700 hover:underline">
					Înapoi la autentificare
				</a>
			</div>
		</form>
	);
};

export default ResetPasswd;
