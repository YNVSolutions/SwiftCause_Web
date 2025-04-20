"use client";
import React, { useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebaseui/dist/firebaseui.css";
import { app } from "./firebase";
import Image from "next/image";

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
                "1014307338439-bs1a5tdftrciqjiphieqat77ub2f4dgd.apps.googleusercontent.com",
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
      <div className="flex items-center justify-center my-10 bg-black">
        <div className="flex justify-center items-center">
          <Image src="/head_image.png" width={300} height={300} alt="img" />
        </div>
        <div className="flex justify-center items-center">
          <div className="bg-gray-900 backdrop-blur-md rounded-xl p-8 sm:p-10 border-2 border-gray-700/10 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 text-center">
              Sign In to Swift Cause
            </h2>
            <div id="firebaseui-auth-container"></div>
          </div>
        </div>
      </div>
    </>
  );
}