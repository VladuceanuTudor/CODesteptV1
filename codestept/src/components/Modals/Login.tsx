import React from 'react';
import { useSetAtom } from 'jotai';
import { authModalState } from '@/atoms/authModalAtom';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/authAtom';
import { API_BASE_URL } from '@/lib/config';


type LoginProps = {
    
};

const Login:React.FC<LoginProps> = () => {

    //const [authState, setAuthState] = useAtom(authAtom);

    const setAuthModal = useSetAtom(authModalState);
    const handleClick = (type:"login" | "register"| "forgotPassword") => {
        setAuthModal((prev) => ({ ...prev, type}));
    }

    const [inputs, setInputs] = useState({
            email: '',  password: ''
        });
        const [error, setError] = useState('');
        
        const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
            setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        };
        const router = useRouter();

        const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!inputs.email || !inputs.password) {
                setError('Te rog să completezi toate câmpurile.');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inputs),
                });
        
                const data = await response.json();
        
                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }
        
                localStorage.setItem('token', data.token); //JWT token
                //console.log(data.token);
                //console.log(localStorage.token);
                //setAuthState({ token: data.token, user: null });

                setAuthModal((prev) => ({ ...prev, isOpen: false }));
                //console.log(localStorage.token);
                router.push('/');
            } catch (err: any) {
                setError(err.message || 'An error occurred during login.');
            }
        };
        
    return <form className='space-y-6 px-6 pb-4' onSubmit={handleLogin}>
        <h3 className='text-xl font-medium text-white'>Intră în contul de CODeștept</h3>
        <div>
            <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>
                Email:
            </label>
            <input  type='email' name='email' id='email'
            className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
            placeholder='nume@companie.com'
            onChange={handleChange}
            />
             
        </div>
        <div>
            <label htmlFor='password' className='text-sm font-medium block mb-2 text-gray-300'>
                Parola:
            </label>
            <input  type='password' name='password' id='password'
            className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
            placeholder='********'
            onChange={handleChange}
            />
             
        </div>

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        <button type='submit' className='w-full text-white focus:ring-blue-300 font-medium rounded-lg
        text-sm px-5 py-2.5 text-center bg-lime-600 hover:bg-lime-700'>
            Intră
        </button>
        <button  className='flex w-full justify-end' onClick={() => handleClick("forgotPassword")}>
            <a href='#' className='text-sm block text-lime-400 hover:underline w-full text-right'>
                Ai uitat parola?
            </a>
        </button>
        <div className="text-sm font-medium text-gray-500" onClick={() => handleClick("register")}>
            Nu ai cont?
            <a href='#' className='text-blue-700 hover:underline'>
                Creează un cont
            </a>
        </div>
    </form>
}
export default Login;