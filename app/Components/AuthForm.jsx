"use client";

import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { app } from "@/firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Console logged-in user info
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("🔐 Logged-in user:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } else {
    console.log("🚪 User logged out");
  }
});

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("🎉 Account created!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("🔵 Logged in with Google!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-2 text-indigo-600">
        SwiftCause
      </h1>
      <h2 className="text-lg font-medium text-center mb-6">
        {isLogin ? "Login to your account" : "Create a new account"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 text-sm text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sign in with Google
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <p className="text-sm mt-6 text-center">
        {isLogin ? "New here?" : "Already a member?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-indigo-600 underline font-medium"
        >
          {isLogin ? "Create an account" : "Login"}
        </button>
      </p>
    </div>
  );
}
