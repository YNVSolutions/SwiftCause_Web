import React from 'react';
import NavBar from '../Components/NavBar';

const PaymentSucess = () => {
  return (
    <>
      <NavBar />
      <div className="card flex justify-center items-center h-screen">
        <div
          className="relative bg-black w-[450px] sm:w-[500px] group transition-all duration-700 aspect-[16/9] flex items-center justify-center"
        >
          <div
            className="transition-all flex flex-col items-center py-5 justify-start duration-300 group-hover:duration-1000 bg-white w-full h-full absolute group-hover:-translate-y-16"
          >
            <p className="text-2xl sm:text-3xl font-semibold text-gray-500 font-serif">
              Thank You
            </p>
            <p className="px-10 text-[12px] sm:text-[14px] text-gray-700">
              Your donation was successful.
            </p>
            <p className="font-serif text-[12px] sm:text-[14px] text-gray-700">
              Wishing you a fantastic day ahead!
            </p>
            <p className="font-sans text-[12px] text-gray-700 pt-5">SwiftCause</p>
          </div>
          <button
            className="seal bg-rose-500 text-red-800 w-12 aspect-square rounded-full z-40 text-[12px] flex items-center justify-center font-semibold [clip-path:polygon(50%_0%,_80%_10%,_100%_35%,_100%_70%,_80%_90%,_50%_100%,_20%_90%,_0_70%,_0_35%,_20%_10%)] group-hover:opacity-0 transition-all duration-1000 group-hover:scale-0 group-hover:rotate-180 border-4 border-rose-900"
            aria-label="Seal Button"
          >
            YNV
          </button>
          <div
            className="tp transition-all duration-1000 group-hover:duration-100 bg-neutral-800 absolute group-hover:[clip-path:polygon(50%_0%,_100%_0,_0_0)] w-full h-full [clip-path:polygon(50%_50%,_100%_0,_0_0)]"
          ></div>
          <div
            className="lft transition-all duration-700 absolute w-full h-full bg-neutral-900 [clip-path:polygon(50%_50%,_0_0,_0_100%)]"
          ></div>
          <div
            className="rgt transition-all duration-700 absolute w-full h-full bg-neutral-800 [clip-path:polygon(50%_50%,_100%_0,_100%_100%)]"
          ></div>
          <div
            className="btm transition-all duration-700 absolute w-full h-full bg-neutral-900 [clip-path:polygon(50%_50%,_100%_100%,_0_100%)]"
          ></div>
        </div>
      </div>
    </>
  );
};

export default PaymentSucess;