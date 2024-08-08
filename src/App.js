import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import { LoginPage } from "./Pages/Loginpage/LoginPage";
import HomePage from "./Pages/HomePage";
import { ToastContainer } from "react-toastify";
import ForgotPassPage from "./Pages/ForgotPassPage";
import "react-toastify/dist/ReactToastify.css";
import RootLayout from "./Layout/RootLayout";
import FetchResume from "./Pages/Dashboard/FetchResume";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Validation from "./Pages/Dashboard/Validation";
import LinkExtraction from "./Pages/Dashboard/LinkExtraction";
import { Loader } from "./CommonComp/LoaderComponent/loader";
import errorimg from "./Utils/error.png";
import ProtectedRoute from "./Redux/protectedRoute/protectedRoute";

const theme = createTheme({
  palette: {
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App" sx={{ height: "100vh", width: "100vw" }}>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgotpass" element={<ForgotPassPage />} />
            <Route path="/load" element={<Loader />} />
            {/* <Route path="/home" element={<RootLayout />}> */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <RootLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="fetchresume" element={<FetchResume />} />
              <Route path="validation" element={<Validation />} />
              <Route path="linkextraction" element={<LinkExtraction />} />
            </Route>

            <Route
              path="*"
              element={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5rem",
                    fontSize: "2rem",
                    textAlign: "center",
                    height: "100vh",
                    width: "100vw",
                  }}
                >
                  <p>OOps! There's nothing here!</p>

                  <Box
                    component="img"
                    src={errorimg}
                    alt="Error"
                    sx={{
                      width: {
                        xs: "75%", // small screens
                        sm: "50%", // medium screens
                        md: "35%", // large screens
                      },
                      maxWidth: "500px",
                      height: "auto",
                      marginTop: "1rem",
                    }}
                  />

                  <NavLink
                    to="/login"
                    style={{
                      marginTop: "2rem",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                      color: theme.palette.primary.main,
                    }}
                  >
                    Go to Home
                  </NavLink>
                </Box>
              }
            />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
