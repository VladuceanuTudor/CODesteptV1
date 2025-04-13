import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Login from './Login';
import Signup from './Signup';
import ResetPasswd from './ResetPasswd';
import { useAtomValue, useSetAtom } from 'jotai';
import { authModalState } from '@/atoms/authModalAtom';

type AuthMProps = {};

const AuthM: React.FC<AuthMProps> = () => {
	const authModel = useAtomValue(authModalState);
	const closeModal = useCloseModal();

	return (
		<>
			{/* Modal Overlay */}
			<div
				className="fixed inset-0 z-40 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center"
				onClick={closeModal}
			></div>

			{/* Modal Container */}
			<div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md px-4 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out">
				<div
					className="relative bg-gradient-to-br from-lime-600 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white border-opacity-20"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Close Button */}
					<div className="flex justify-end p-3">
						<button
							type="button"
							className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition"
							onClick={closeModal}
						>
							<IoClose className="w-6 h-6" />
						</button>
					</div>

					{/* Auth Content */}
					<div className="px-6 pb-6">
						{authModel.type === 'login' ? (
							<Login />
						) : authModel.type === 'register' ? (
							<Signup />
						) : (
							<ResetPasswd />
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default AuthM;

// Custom hook for closing modal
function useCloseModal() {
	const setAuthModal = useSetAtom(authModalState);

	const closeModal = () => {
		setAuthModal((prev) => ({ ...prev, isOpen: false, type: 'login' }));
	};

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, []);

	return closeModal;
}
