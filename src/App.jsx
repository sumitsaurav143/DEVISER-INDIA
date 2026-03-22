import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/notfound";
import { HashRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;