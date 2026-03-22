import { useNavigate } from "react-router-dom";
import "./notfound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">

      <div className="notfound-card">

        <h1 className="notfound-code">404</h1>

        <h2 className="notfound-title">
          Page Not Found
        </h2>

        <p className="notfound-desc">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <div className="notfound-actions">
          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>

      </div>

    </div>
  );
}

export default NotFound;