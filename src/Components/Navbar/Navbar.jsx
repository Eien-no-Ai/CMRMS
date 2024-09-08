import { VscAccount } from "react-icons/vsc";
import React from 'react';

function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-700 text-white p-3 flex items-center justify-between z-50">
      <div className="flex items-center">
        <span className="mr-8 ml-8 text-xl">CMRMS</span>
       
      </div>
      <div className="flex items-center space-x-20 mr-8">
        <a href="/home" className="hover:underline">Home</a>
        <a href="/patients" className="hover:underline">Patients</a>
        <a href="/patients-profile" className="hover:underline">test</a>

        <span className="flex items-center">
          <VscAccount size={24} />
        </span>
      </div>
    </div>
  );
}

export default Navbar;
