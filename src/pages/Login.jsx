import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";


function Login() {

  const navigate = useNavigate();

  const texts = ["Innovate.", "Automate.", "Dominate."];

  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    let speed = isDeleting ? 50 : 150;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);

        if (charIndex + 1 === currentText.length) {
          setIsDeleting(true);
          speed = 2500;
        }
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  /* 🔐 Login */
  const [formData, setFormData] = useState({
    email: "admin@mail.com",
    password: "123456"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const firebaseUser = userCredential.user;
      console.log("Logged in user:", firebaseUser.uid);


      const docRef = doc(db, "userData", firebaseUser.uid);
      console.log("Document reference:", docRef);
      const docSnap = await getDoc(docRef);
      console.log("Document snapshot:", docSnap);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        localStorage.setItem("user", JSON.stringify({
          uid: firebaseUser.uid,
          ...userData
        }));
      }

      localStorage.setItem("token", firebaseUser.accessToken);

      navigate("/dashboard");

    } catch (error) {
      alert("Invalid credentials");
      console.error("ERROR CODE:", error.code);
      console.error("ERROR MSG:", error.message);
    }
  };

  return (
    <div className="login-page">

      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">ᗪ乇ᐯ丨丂乇尺</div>
      </div>

      <div className="login-wrapper">

        {/* LEFT */}
        <div className="login-left">
          <div className="left-content">

            <h1 className="typewriter">{displayText}</h1>

            <p className="subtitle">
              Transform workflows into intelligent systems.
            </p>

          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">

          <div className="login-card">

            <h2>Welcome Back</h2>

            <form onSubmit={handleLogin}>

              <input
                type="email"
                name="email"
                placeholder="Email address"
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

              <button type="submit">Login</button>

              <p style={{ marginTop: "10px" }}>
                Don’t have an account?{" "}
                <span
                  style={{ color: "#00bcd4", cursor: "pointer" }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </p>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;