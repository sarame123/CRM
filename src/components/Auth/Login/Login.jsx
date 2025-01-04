import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import style from "../Login/Login.module.css";
import img from "../../images/image 1.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  let navigate = useNavigate();

  let validateSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email Required"),
    password: Yup.string().required("Password is required")
  });

  let formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: validateSchema,
    onSubmit: async function Signin(values) {
      try {
       
        const response = await fetch(
          "http://localhost/backend/login/login.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(values),
            mode: "cors" // Explicitly enable CORS
          }
        );
        //   const data = await response.json();
        // console.log(data)
        //   if (!response.ok) {
        //      throw new Error(`HTTP error! status: ${response.status}`);

        //   }
        const data = await response.json();
        if (data.success) {
          const userId = data.id;
          const role = data.role;
          const token = data.token;
          // localStorage.setItem("authToken", token);
          localStorage.setItem("userId", userId);
          localStorage.setItem("role", role);
          localStorage.setItem("activeUser", JSON.stringify(data.id));
           localStorage.setItem("token", token);
          toast.success("You are logged In successfully!", {
            position: "top-right",
            autoClose: 2000
          });
          if (data.role === "admin") {
            navigate("/dashboard");
            localStorage.setItem("userId", data.id);
            console.log("Admin User ID stored in localStorage:", data.id);
          } else {
            navigate("/user-dashboard");
            console.log(data.role);
          }
        } else {
          toast.error(`Login failed: ${data.message} `, {
            position: "top-right",
            autoClose: 2000
          });
          console.log(
            "User ID from localStorage:",
            localStorage.getItem("userId")
          );
        }
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
  });

  return (
    <>
      <section
        className={`${style.background} d-flex align-items-center justify-content-center`}
      >
        <img src={img} alt="" className={`${style.logo} d-flex `} />
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className=" col-md-6">
              <div className={`p-4 ${style.box}`}>
                <h1 className="text-center fw-bold fs-1">Login</h1>
                <p className="text-center">Enter Your email and password</p>
                <form className={`mx-1 mx-md-4`} onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      placeholder="Your Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  {formik.errors.email && formik.touched.email ? (
                    <p className={`${style.error}`}>{formik.errors.email}</p>
                  ) : (
                    ""
                  )}

                  <div className="mb-2">
                    <input
                      type="password"
                      id="Password"
                      name="password"
                      className="form-control"
                      placeholder="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  {formik.errors.password && formik.touched.password ? (
                    <p className={`${style.error}`}>{formik.errors.password}</p>
                  ) : (
                    ""
                  )}

                  <button
                    type="submit"
                    disabled={!(formik.dirty && formik.isValid)}
                    className="btn btn-success btn-block w-100 mt-3 mb-3"
                  >
                    Login
                  </button>

                
                  <div className={`d-flex flex-wrap justify-content-between text-center  align-items-center mt-2 `}>
                    <p className="w-sm-100 m-auto fw-bold text-muted ">
                      Don't Have an account?{" "}
                      <Link to="/register" className="fw-bold" style={{color:"var(--main-color)"}}>
                        <u>Sign Up here</u>
                      </Link>
                    </p>
                    <p className="w-sm-100 m-auto fw-bold text-muted">
                      Forgot your password?{" "}
                      <Link to="/forgot-password" className="fw-bold" style={{color:"var(--main-color)"}}>
                        <u>Click here</u>
                      </Link>
                    </p>
                  </div>
 


                


                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}