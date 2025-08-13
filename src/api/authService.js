import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export async function loginWithEmailPassword(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  await signOut(auth);
}


