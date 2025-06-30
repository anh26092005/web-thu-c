import { Mic, Camera } from "lucide-react";
import React from "react";

const SearchBar = () => {
  return (
    <div className=" mx-auto flex items-center w-full max-lg:w-1/2 max-md:w-full max-w-xl bg-white border border-blue-300 rounded-full px-6 py-2 shadow-sm focus-within:border-blue-400 transition">
      <input
        type="text"
        placeholder="Mua trước trả sau 0% lãi suất"
        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-base"
      />
      <button type="button" className="ml-2 text-blue-600 hover:text-blue-800">
        <Mic size={20} />
      </button>
      <button type="button" className="ml-2 text-blue-600 hover:text-blue-800">
        <Camera size={20} />
      </button>
    </div>
  );
};

export default SearchBar;
