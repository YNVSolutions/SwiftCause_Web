import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';

export async function loginWithEmailPassword(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}


export async function signOutUser(): Promise<void> {
  await signOut(auth);
}


