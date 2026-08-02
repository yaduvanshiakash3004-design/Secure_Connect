// ======================================================
// SecureConnect
// Login Page
// Developed By : Akash Yadav
// ======================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

function Login() {

    const navigate = useNavigate();

    // ======================================================
    // FORM DATA
    // ======================================================

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ======================================================
    // HANDLE INPUT CHANGE
    // ======================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    // ======================================================
    // LOGIN USER
    // ======================================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await fetch(
                "https://secure-connect-6e84.onrender.com/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            // ==================================================
            // LOGIN FAILED
            // ==================================================

            if (!response.ok) {

                setMessage(
                    data.message || "Login failed"
                );

                return;
            }

            // ==================================================
            // SAVE JWT TOKEN
            // ==================================================

            localStorage.setItem(
                "secureconnect_token",
                data.token
            );

            // ==================================================
            // SAVE LOGGED-IN USER
            // ==================================================

            localStorage.setItem(
                "secureconnect_user",
                JSON.stringify(data.user)
            );

            // ==================================================
            // REDIRECT TO DASHBOARD
            // ==================================================

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            setMessage(
                "Unable to connect to SecureConnect server"
            );

        } finally {

            setLoading(false);

        }

    };

    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="login-container">

            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <div className="left-panel">

                <h1>SecureConnect</h1>

                <h2>
                    Connect.
                    <br />
                    Communicate.
                    <br />
                    Collaborate.
                </h2>

                <p>
                    A secure platform where you can chat privately
                    and collaborate with your teams in real time.
                </p>

                <ul>

                    <li>✔ Real-Time Messaging</li>

                    <li>✔ Private Conversations</li>

                    <li>✔ Group Collaboration</li>

                    <li>✔ End-to-End Encryption</li>

                </ul>

            </div>

            {/* =================================================
                RIGHT PANEL
            ================================================= */}

            <div className="right-panel">

                <div className="login-card">

                    <h2>Welcome Back 👋</h2>

                    <p>
                        Login to continue
                    </p>

                    {/* ==========================================
                        LOGIN FORM
                    ========================================== */}

                    <form onSubmit={handleLogin}>

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="akash@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {/* ======================================
                            ERROR MESSAGE
                        ====================================== */}

                        {message && (

                            <p className="login-message">

                                {message}

                            </p>

                        )}

                        {/* ======================================
                            LOGIN BUTTON
                        ====================================== */}

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {
                                loading
                                    ? "Logging in..."
                                    : "Login"
                            }

                        </button>

                    </form>

                    {/* ==========================================
                        REGISTER LINK
                    ========================================== */}

                    <p className="register">

                        Don't have an account?{" "}

                        <Link to="/register">

                            Register

                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );

}

export default Login;