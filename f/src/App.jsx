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
      path: "/home",
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    { path: "/trip-form", element: <TripForm /> },
    {path:"/trip-preview", element: <TripPreview />},
    {path:"/trip-lists", element: <TripList />},
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
