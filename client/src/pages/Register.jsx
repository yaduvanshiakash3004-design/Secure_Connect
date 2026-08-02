// ======================================================
// SecureConnect
// Register Page
// Developed By : Akash Yadav
// ======================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ======================================================
    // HANDLE INPUT
    // ======================================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // ======================================================
    // REGISTER USER
    // ======================================================

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setMessage(data.message || "Registration failed");
                setLoading(false);
                return;

            }

            // Save JWT token
            localStorage.setItem(
                "secureconnect_token",
                data.token
            );

            // Save user information
            localStorage.setItem(
                "secureconnect_user",
                JSON.stringify(data.user)
            );

            // Go to dashboard
            navigate("/dashboard");

        } catch (error) {

            console.error("Registration Error:", error);

            setMessage(
                "Unable to connect to SecureConnect server"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="register-page">

            <div className="register-container">

                <div className="register-logo">
                    🛡️
                </div>

                <h1>SecureConnect</h1>

                <p className="register-subtitle">
                    Create your secure account
                </p>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {message && (
                        <p className="register-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="login-link">

                    Already have an account?{" "}

                    <Link to="/">
                        Login
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Register;