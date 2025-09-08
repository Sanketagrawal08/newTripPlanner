import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./component/Register";
import Login from "./component/Login";

const App = () => {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Register />,
    },
    {
      path:"/login",
      element:<Login />
    }

  ]);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
