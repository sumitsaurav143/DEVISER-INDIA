import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // reuse same CSS
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const firebaseUser = userCredential.user;

            // // Save extra data locally (or later DB)
            // const newUser = {
            //     uid: firebaseUser.uid,
            //     name: formData.name,
            //     email: formData.email,
            //     password: formData.password,
            //     phone: formData.phone,
            //     balance: 0,
            //     tasks: [],
            //     additionalInfo: {}
            // };

            // localStorage.setItem("register", JSON.stringify(newUser));

            await setDoc(doc(db, "userData", firebaseUser.uid), {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                balance: 0,
                tasks: [],
                additionalInfo: {},
                createdAt: new Date()
            });


            alert("Registered successfully!");

            navigate("/");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="login-page">

            {/* NAVBAR */}
            <div className="navbar">
                <div className="logo">ᗪ乇ᐯ丨丂乇尺</div>
            </div>

            <div className="login-wrapper">

                {/* LEFT SAME */}
                <div className="login-left">
                    <div className="left-content">
                        <h1>Create Account</h1>
                        <p className="subtitle">
                            Start your automation journey today.
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="login-right">

                    <div className="login-card">

                        <h2>Register</h2>

                        <form onSubmit={handleRegister}>

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="tel"
                                name="phone"
                                placeholder="WhatsApp Number"
                                onChange={handleChange}
                                required
                            />

                            <button type="submit">Register</button>

                        </form>

                        {/* 🔗 Link to login */}
                        <p style={{ marginTop: "10px" }}>
                            Already have an account?{" "}
                            <span
                                style={{ color: "#00bcd4", cursor: "pointer" }}
                                onClick={() => navigate("/")}
                            >
                                Login
                            </span>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;