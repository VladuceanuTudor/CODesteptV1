import { atom } from 'jotai';

export const authModalState = atom({
  isOpen: false,
  type: 'login' as 'login' | 'register' | 'forgotPassword',
});

export const userAtom = atom<{
  email: string;
  username: string;
  xp: number;
  starredProblems: string[];  // Changed to array of strings
  solvedProblems: string[];   // Added solvedProblems
  createdAt?: Date;           // Optional since it's coming from backend
  profilePic?: string;        // Added profilePic
} | null>(null);