import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { CheckToken } from "../../axios/api";
import { authenticate, logout } from "../AuthSlice/authSlice";
import { Loader } from "../../CommonComp/LoaderComponent/loader";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      dispatch(logout());
      setLoading(false);
      return;
    }

    CheckToken()
      .then((res) => {
        if (res.status === "Success") {
          dispatch(authenticate({ user: res.data }));
        } else {
          dispatch(logout());
        }
      })
      .catch((err) => {
        dispatch(logout());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    ); // You can replace this with a loading spinner or component
  }

  return auth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
