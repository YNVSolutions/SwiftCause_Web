import React from 'react'

const PaymentHeader = () => {
  return (
    <>
        <header className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-3xl text-white font-bold text-center">Payment</h1>
            <p className="mt-2 text-lg text-gray-400">Please complete your payment to proceed.</p>

        </header>
    </>
  )
}

export default PaymentHeader