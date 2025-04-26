"use client";
import React, { useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebaseui/dist/firebaseui.css";
import { app } from "./firebase";
import Image from "next/image";
import NavBar from "../Components/NavBar";

export default function Login() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("firebaseui").then((firebaseui) => {
        const ui =
          firebaseui.auth.AuthUI.getInstance() ||
          new firebaseui.auth.AuthUI(getAuth(app));

        ui.start("#firebaseui-auth-container", {
          signInSuccessUrl: "/",
          signInOptions: [
            {
              provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              clientId:
                "373490483164-o6ggs2k0c6i9a14mgfqtdhv6biucttti.apps.googleusercontent.com",
            },
            {
              provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            },
          ],
          credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
        });
      });
    }
  }, []);

  return (
    <>
      <NavBar />
      <main className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        {/* Left Section: Image */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-4">
          <Image
            src="/head_image.png"
            width={400}
            height={400}
            alt="Login Illustration"
            className="rounded-2xl shadow-2xl object-contain"
            priority
          />
        </div>

        {/* Right Section: Login Form */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 border border-blue-600 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Welcome Back
            </h2>
            <div id="firebaseui-auth-container"></div>
          </div>
        </div>
      </main>
    </>
  );
}
