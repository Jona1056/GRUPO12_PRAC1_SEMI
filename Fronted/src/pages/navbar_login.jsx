import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black rounded-3">
      <div className="container-fluid">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">
           
            FaunaDex
          </NavLink>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              to="/"
            >
              Login
            </NavLink>
          </ul>
        </div>
      </div>
    </nav>
  );
};
