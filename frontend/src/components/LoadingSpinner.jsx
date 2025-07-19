import React from "react";

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-60 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
    <p className="text-gray-700 text-lg font-medium">{text}</p>
  </div>
);

export default LoadingSpinner;