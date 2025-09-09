import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Register from "./component/Register";
import Login from "./component/Login";
import Home from "./component/Home";
import ProtectedRoute from "./component/ProtectedRoute";
import useAuthStore from "./store/authStore";
import TripForm from "./component/TripForm";
import TripPreview from "./component/TripPreview";
import TripList from "./component/TripList";
import Layout from "./component/Layout";
import EmergencyContacts from "./component/EmergencyContacts";

const App = () => {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <p>Loading...</p>;

const routes = createBrowserRouter([
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },

  {
    element: (
      <ProtectedRoute>
        <Layout />   {/* 👈 Navbar humesha visible inside protected layout */}
      </ProtectedRoute>
    ),
    children: [
      { path: "/home", element: <Home /> },
      { path: "/trip-form", element: <TripForm /> },
      { path: "/trip-preview", element: <TripPreview /> },
      { path: "/trip-lists", element: <TripList /> },
      {path:"/emergency-contacts", element : <EmergencyContacts />}
    ],
  },

  {
    path: "/",
    element: isAuthenticated ? (
      <Navigate to="/home" />
    ) : (
      <Navigate to="/login" />
    ),
  },
]);


  return <RouterProvider router={routes} />;
};

export default App;
