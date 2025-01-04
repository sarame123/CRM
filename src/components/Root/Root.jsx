import React from 'react'

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
export default function Root() {
  return (
    <div className="d-flex">
       <Sidebar/>
        <Navbar/>
    </div>
  )
}