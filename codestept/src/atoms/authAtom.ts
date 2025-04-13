import { atom } from "jotai";

export const authAtom = atom<{ token: string | null; user: any | null }>({
    token: null,
    user: null,
});
