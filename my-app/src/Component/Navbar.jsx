import React, { useEffect, useRef, useState } from "react";
import "../css/App.css";
import axios from "axios";
import Register from "./Register";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

function Navbar() {
  const images = [
    "/image/Screenshot 2026-06-08 124821.png",
    "/image/82273b2079180329ce2a7b67559e5649.jpg",
    "/image/ee8372374d8292842d9d72f35e7934c4.jpg",
    "/image/a0e4833ce6c9d9425e2fab7e2c77059d.jpg",
  ];

  // clone first slide at the end so the loop feels seamless
  const slides = [...images, images[0]];

  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [login, setlogin] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setlogin({
      ...login,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(
        "http://localhost:5000/testuser/Login",
        {
          email: login.email,
          password: login.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      console.log("Success:", response.data);

      setMessage({
        text: "Login successful!",
        type: "success",
      });
setlogin({
        email: "",
        password: "",
      });
console.log(login.data);
      navigate("/home");
    } catch (error) {
      console.error(error);

      setMessage({
        text:
          error.response?.data?.message || "Login failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // when we land on the cloned slide, silently snap back to the real first slide
  const handleTransitionEnd = () => {
    if (index === images.length) {
      setWithTransition(false);
      setIndex(0);
    }
  };

  // re-enable the smooth transition on the next tick after a silent snap
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setWithTransition(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  const goTo = (i) => {
    setWithTransition(true);
    setIndex(i);
    startTimer();
  };

  const activeDot = index % images.length;

  return (
    <div className="page">
      <div className="container">
        {/* Left Panel - login form, now wrapped in its own card */}
        <div className="left-panel transition-transform duration-500 hover:scale-110">
          <div className="login-card">
            <div className="brand">
              <div className="brand-icon">🪶</div>
              <span className="brand-name">smiley</span>
            </div>

            <h2 className="heading">Discover nearby products instantly</h2>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="email">
                  Email address
                </label>
                <input
                  className="field-input"
                  type="email"
                  id="email"
                  onChange={handleChange}
                  value={login.email}
                  placeholder="you@example.com"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="field-input"
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={login.password}
                />
              </div>

              {message.text && (
                <p
                  className={
                    message.type === "success"
                      ? "message-success"
                      : "message-error"
                  }
                >
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>

            <a href="" className="forgot-link">
              Forgot password?
            </a>
            <p className="register-text">
              Don't have an account? <Link to="/Register">Register</Link>
            </p>
          </div>
        </div>

        {/* Right Panel - image slider, centered and NOT filling the whole panel */}
        <div
          className="right-panel"
          data-aos="fade-left"
          data-aos-offset="400"
          data-aos-duration="900"
        >
          <div className="slider-outer  transition-transform duration-500 hover:scale-110">
            <div className="slider-frame">
              <div
                className="slider-track"
                style={{
                  transform: `translateX(-${index * (100 / slides.length)}%)`,
                  width: `${slides.length * 100}%`,
                  transition: withTransition
                    ? "transform 700ms cubic-bezier(0.65, 0, 0.35, 1)"
                    : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {slides.map((src, i) => (
                  <div
                    key={i}
                    className="slide"
                    style={{ width: `${100 / slides.length}%` }}
                  >
                    <img src={src} alt={`slide-${i}`} className="slide-image" />
                  </div>
                ))}
              </div>
            </div>

            {/* dots */}
            <div className="dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`dot ${activeDot === i ? "dot-active" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;