
// }
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import style from "../Sidebar/Sidebar.module.css";
import axios from "axios";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [name, setName] = useState();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role")); 

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setLoading(true);
      axios
        .get(`http://localhost/backend/fetch_user.php?id=${userId}`)
        .then((response) => {
          setName(response.data.name);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, []);

 
  const commonLinks = [
    { to: "/Calender", icon: "bi-calendar3", text: "Calendar" },
    { to: "/messages", icon: "bi-chat-dots", text: "Messages" },
    { to: "/tasks", icon: "bi-clipboard-check", text: "Tasks" },
    { to: "/settings", icon: "bi-gear-fill", text: "Settings" }
  ];


  const adminLinks = [
    { to: "/dashboard", icon: "bi-grid", text: "Dashboard" },
    { to: "/users", icon: "bi-people", text: "Customers" },
    { to: "/contract", icon: "bi bi-journal-check", text: "Contracts" }
  ];

 
  const userLinks = [
    { to: "/user-dashboard", icon: "bi-house-door", text: "User Dashboard" }
  ];

  return (
    <div
      className={`bg-dark text-white position-fixed h-100 d-flex flex-column ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
      style={{
        width: isSidebarOpen ? "250px" : "70px",
        zIndex: isSidebarOpen ? 1000 : 1, 
        boxShadow: isSidebarOpen
          ? "5px 0 10px rgba(112, 206, 35, 0.527)"
          : "none",
        transition: "width 0.3s ease-in-out",
        borderRadius: "0 20px 20px 0",
        overflow: "hidden"
      }}
    >
      <div className="d-flex flex-column align-items-center py-3">
        <button
          className="btn btn-light"
          onClick={toggleSidebar}
          style={{ borderRadius: "50%", transition: "all 0.3s ease-in-out" }}
        >
          {isSidebarOpen ? (
            <i className="bi bi-arrow-left"></i>
          ) : (
            <i className="bi bi-list"></i>
          )}
        </button>
      </div>
      <div
        style={{
          padding: "10px",
          boxShadow: "0 4px 6px var(--main-color)",
          marginBottom: "10px"
        }}
      >
        {loading ? (
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          isSidebarOpen && (
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center"
              }}
            >
              Welcome{" "}
              <span className="ps-2" style={{ color: "var(--main-color)" }}>
                {name ? name.split(" ")[0] : "no name"}
              </span>
            </h2>
          )
        )}
      </div>

      <ul className="nav flex-column w-100 pt-1">

        {role === "admin" &&
          adminLinks.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => window.innerWidth <= 768 && toggleSidebar()}
                className={`nav-link d-flex align-items-center ${style.links}`}
              >
                <i className={`bi ${link.icon} fs-5 me-3`}></i>
                {isSidebarOpen && <span>{link.text}</span>}
              </NavLink>
            </li>
          ))}

     
        {role === "user" &&
          userLinks.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => window.innerWidth <= 768 && toggleSidebar()}
                className={`nav-link d-flex align-items-center ${style.links}`}
              >
                <i className={`bi ${link.icon} fs-5 me-3`}></i>
                {isSidebarOpen && (
                  <span style={{ whiteSpace: "noWrap" }}>{link.text}</span>
                )}
              </NavLink>
            </li>
          ))}
        
        {commonLinks.map((link) => (
          <li className="nav-item" key={link.to}>
            <NavLink
              to={link.to}
              onClick={() => window.innerWidth <= 768 && toggleSidebar()}
              className={`nav-link d-flex align-items-center ${style.links}`}
            >
              <i className={`bi ${link.icon} fs-5 me-3`}></i>
              {isSidebarOpen && <span>{link.text}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}