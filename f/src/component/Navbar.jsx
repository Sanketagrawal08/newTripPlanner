import React from "react";
import useAuthStore from "../store/authStore";
import { NavLink, useNavigate } from "react-router";
import { User, CalendarDays, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const goToTrips = () => navigate("/trip-lists");
  const goHome = () => navigate("/home");

  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div
        onClick={goHome}
        className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-800 transition"
      >
        LOGO
      </div>

      {/* Welcome / User Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <User className="w-5 h-5 text-gray-500" />
          Hello, {user?.name || "User"}
        </div>

      

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-1 rounded-xl hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        <NavLink to={"/emergency-contacts"}>
          <button >
          Emergency Contacts
        </button>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
