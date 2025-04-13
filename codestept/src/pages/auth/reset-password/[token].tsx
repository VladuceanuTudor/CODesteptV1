import { useRouter } from "next/router";
import { useState } from "react";
import { API_BASE_URL } from '@/lib/config';

const ResetPassword = () => {
	const router = useRouter();
	const { token } = router.query; // Get the token from the URL

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Pasrolele nu se potrivesc.");
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ newPassword: password }), // Match backend field name
			});
		
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Resetare nereusita"); // Fix error message handling
		
			setSuccess("Parola resetata cu succes. te rog sa te loghezi cu noua parola.");
			setTimeout(() => router.push("/auth"), 3000); // Keep redirect
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
			<h2 className="text-2xl font-bold mb-4">Reseteaza parola</h2>

			<form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-6 rounded-lg">
				{error && <p className="text-red-500">{error}</p>}
				{success && <p className="text-green-500">{success}</p>}

				<label className="block mb-2">Parola noua:</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
				/>

				<label className="block mb-2">Confirma parola:</label>
				<input
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full p-2 bg-blue-600 hover:bg-blue-500 rounded"
				>
					{loading ? "Se reseteaza..." : "Resetare parola"}
				</button>
			</form>
		</div>
	);
};

export default ResetPassword;
