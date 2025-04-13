import React from 'react';
import { useSetAtom } from 'jotai';
import { authModalState } from '@/atoms/authModalAtom';
import { useState } from 'react';
import { useRouter } from 'next/router'; 
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/authAtom';
import { API_BASE_URL } from '@/lib/config';

type SignupProps = {
    
};



const Signup:React.FC<SignupProps> = () => {

    //const [authState, setAuthState] = useAtom(authAtom);
    
    const setAuthModal = useSetAtom(authModalState);
    const handleClick = (type:"login" | "register"| "forgotPassword") => {
        setAuthModal((prev) => ({ ...prev, type}));
    };

    const [inputs, setInputs] = useState({
        email: '', username: '', password: ''
    });
    const [error, setError] = useState('');
    
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const router = useRouter();
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.email || !inputs.username || !inputs.password) {
            setError('Te rog să completezi toate câmpurile.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputs),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }
    
            localStorage.setItem('token', data.token); //JWT token
            //setAuthState({ token: data.token, user: data.user });
            setAuthModal((prev) => ({ ...prev, isOpen: false }));
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup.');
        }
    };
    
    
    return <form className='space-y-6 px-6 pb-4'onSubmit={handleSignup}>
    <h3 className='text-xl font-medium text-white'>Creează un cont CODeștept</h3>
   
    <div>
        <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>
            Email:
        </label>
        <input 
        onChange={handleChange}
        type='email' name='email' id='email'
        className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
        bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
        placeholder='nume@companie.com'
        />
         
    </div>
    <div>
        <label htmlFor='displayName' className='text-sm font-medium block mb-2 text-gray-300'>
            Nume utilizator:
        </label>
        <input 
        onChange={handleChange}
        type= 'username' name= 'username' id='displayName'
        className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
        bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
        placeholder='Tudor Vladuceanu'
        />
         
    </div>
    <div>
        <label htmlFor='password' className='text-sm font-medium block mb-2 text-gray-300'>
            Parola:
        </label>
        <input 
        onChange={handleChange}
        type='password' name='password' id='password'
        className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
        bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
        placeholder='********'
        />
         
    </div>
    {error && <p className='text-red-500 text-sm'>{error}</p>}
    <button type='submit' className='w-full text-white focus:ring-blue-300 font-medium rounded-lg
    text-sm px-5 py-2.5 text-center bg-lime-600 hover:bg-lime-700'>
        Creează
    </button>
    
    <div className="text-sm font-medium text-gray-500" onClick={() => handleClick("login")}>
        Ai deja un cont?
        <a href='#' className='text-blue-700 hover:underline'>
            Intră în cont
        </a>
    </div>
</form>
}
export default Signup;