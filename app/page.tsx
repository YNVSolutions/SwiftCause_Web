import React from "react";
import NavBar from "./Components/Others/NavBar";
import Main from "./Components/Others/Main";
import Features from "./Components/Others/Features";
import About from "./Components/Others/About";

const Page = () => {
  return (
    <div>
      <NavBar />
      <Main />
      <About/>
      <Features />
    </div>
  );
};

export default Page;