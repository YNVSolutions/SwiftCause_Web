import "../app/globals.css";
import React from "react";
import NavBar from "./Components/Others/NavBar";
import Main from "./Components/Others/Main";
import Features from "./Components/Others/Features";
import About from "./Components/Others/About";
import Footer from "./Components/Others/Footer";
import Login from "./Components/Auth/Login";
// app\Components\Auth\Login.jsx
// import UserDashboard from "./Components/UserDashboard";

const index = () => {
  return (
    <>
      <div className="bg-black">
        <NavBar />
        <Main />
        <About />
        <Features />
        <Login />
        <Footer />
        {/* <UserDashboard/> */}
      </div>
    </>
  );
};

export default index;