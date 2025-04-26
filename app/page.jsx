import "../app/globals.css";
import React from "react";
import NavBar from "./Components/NavBar";
import Main from "./Components/Main";
import Features from "./Components/Features";
import About from "./Components/About";
import Footer from "./Components/Footer";

const index = () => {
  return (
    <>
      <div className="bg-black">
        <NavBar />
        <Main />
        <About />
        <Features />
        <Footer />
      </div>
    </>
  );
};

export default index;