import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./dashboard.css";
import "./adminDashboard.css";

function AdminDashboard() {

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [activeMenu, setActiveMenu] = useState("tasks");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [statusAction, setStatusAction] = useState("running");
  const [message, setMessage] = useState("");

  const openModal = (task, status) => {
    setSelectedTask(task);
    setStatusAction(status);
    setMessage("");
  };

  const handleUpdateStatus = async () => {
    try {
      await updateDoc(doc(db, "tasks", selectedTask.id), {
        status: statusAction,
        reason: message || "",
        updatedAt: serverTimestamp()
      });

      setSelectedTask(null);

    } catch (error) {
      console.error("Update error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "userData"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(userList);
    });

    return () => unsubscribe();
  }, []);



  // ✅ Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/");
    setUser(storedUser);
  }, []);

  // 🔐 Protect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, []);

  // 🔥 Fetch NEW tasks
  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("status", "in", ["new", "running"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(list);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Fetch ALL tasks (for analytics)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllTasks(list);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Stats
  const stats = {
    total: allTasks.length,
    new: allTasks.filter(t => t.status === "new").length,
    completed: allTasks.filter(t => t.status === "completed").length,
    running: allTasks.filter(t => t.status === "running").length,
    failed: allTasks.filter(t => t.status === "failed").length,
    users: users.length,
    totalBalance: users.reduce(
      (sum, user) => sum + (user.balance || 0),
      0
    ),
    revenue: allTasks
      .filter(t => t.status === "completed")
      .reduce((sum, task) => sum + (task.cost || 0), 0),
    pendingRevenue: allTasks
      .filter(t => t.status === "pending" || t.status === "running" || t.status === "new")
      .reduce((sum, task) => sum + (task.cost || 0), 0),
    refundableAmount: allTasks
      .filter(t => t.status === "failed")
      .reduce((sum, task) => sum + (task.cost || 0), 0)
  };

  // 📊 Chart Data
  const chartData = [
    { name: "New", value: stats.new, fill: "#3b82f6" },
    { name: "Completed", value: stats.completed, fill: "#22c55e" },
    { name: "In Progress", value: stats.running, fill: "#f39c12" },
    { name: "Failed", value: stats.failed, fill: "#ef4444" }
  ];

  // ✅ Update status
  const updateStatus = async (taskId, newStatus) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus
    });
  };

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="logo">ᗪ乇ᐯ丨丂乇尺</div>

        <div className="user-info">
          <div className="user-avatar">
            {user.name?.charAt(0)}
          </div>

          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
            {/* <span className="user-status">Admin</span> */}
          </div>
        </div>

        <ul className="menu">
          <li
            className={activeMenu === "tasks" ? "active" : ""}
            onClick={() => setActiveMenu("tasks")}
          >
            Tasks
          </li>

          <li
            className={activeMenu === "all" ? "active" : ""}
            onClick={() => setActiveMenu("all")}
          >
            Analytics
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="topbar">
          <h3>Admin Dashboard</h3>
        </div>

        <div className="content">

          {/* 📊 ANALYTICS */}
          {activeMenu === "all" && (
            <>
              {/* STATS CARDS */}
              <div className="cards">
                <div className="card">
                  <h3>Total Tasks</h3>
                  <p>{stats.total}</p>
                </div>

                <div className="card">
                  <h3>New</h3>
                  <p>{stats.new}</p>
                </div>

                <div className="card">
                  <h3>Completed</h3>
                  <p>{stats.completed}</p>
                </div>

                <div className="card">
                  <h3>In Progress</h3>
                  <p>{stats.running}</p>
                </div>

                <div className="card">
                  <h3>Failed</h3>
                  <p>{stats.failed}</p>
                </div>
                <div className="card revenue-card">
                  <h3>Total Revenue</h3>
                  <p>₹ {stats.revenue.toLocaleString()}</p>
                </div>

                <div className="card pending-revenue-card">
                  <h3>Pending Revenue</h3>
                  <p>₹ {stats.pendingRevenue.toLocaleString()}</p>
                </div>

                <div className="card refundable-card">
                  <h3>Refund Amount</h3>
                  <p>₹ {stats.refundableAmount.toLocaleString()}</p>
                </div>

                <div className="card wallet-card">
                  <h3>Users Balance</h3>
                  <p>₹ {stats.totalBalance.toLocaleString()}</p>
                </div>
                <div className="card">
                  <h3>Total Active Users</h3>
                  <p>{stats.users}</p>
                </div>
              </div>


              {/* 📊 BAR CHART */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                    <XAxis stroke="#ccc" dataKey="name" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "none",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="value" fill="#ffffff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* 🔥 NEW TASKS */}
          {activeMenu === "tasks" && (
            <div className="task-section">

              <div className="task-header">
                <h2>Tasks</h2>
              </div>

              <div className="task-list">
                {tasks.length === 0 ? (
                  <p>No tasks available</p>
                ) : (
                  tasks.map(task => (
                    <div
                      className="task-card-horizontal admin-card"
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                    >

                      {/* LEFT */}
                      <div className="task-left">
                        <div><strong>User:</strong> {task.userid}</div>
                        <div><strong>Pass:</strong> {task.password}</div>
                        <div><strong>Season:</strong> {task.season}</div>
                      </div>

                      {/* CENTER */}
                      <div className="task-center">
                        <span className={`task-status status-${task.status}`}>
                          {task.status}
                        </span>
                      </div>

                      {/* RIGHT */}
                      <div className="task-right">

                        {/* 💰 COST HIGHLIGHT */}
                        <div className="task-cost">
                          ₹ {task.cost}
                        </div>

                        {task.status === "new" ?

                          <button
                            className="admin-btn btn-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(task, "running");
                            }}
                          >
                            Start
                          </button>
                          : null}

                        <button
                          className="admin-btn btn-complete"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(task, "completed");
                          }}
                        >
                          Complete
                        </button>

                        <button
                          className="admin-btn btn-fail"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(task, "failed");
                          }}
                        >
                          Fail
                        </button>

                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {selectedTask && (
        <div className="modal">
          <div className="modal-content task-modal">

            <h2>Task Details</h2>

            <div className="task-grid">
              <div className="task-item">
                <span>User</span>
                <strong>{selectedTask.userid}</strong>
              </div>

              <div className="task-item">
                <span>Pass</span>
                <strong>{selectedTask.password}</strong>
              </div>

              <div className="task-item">
                <span>File</span>
                <a
                  href={selectedTask.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-btn"
                >
                  Download File
                </a>
              </div>

              <div className="task-item">
                <span>Season</span>
                <strong>{selectedTask.season}</strong>
              </div>

              <div className="task-item">
                <span>Cost</span>
                <strong>₹ {selectedTask.cost}</strong>
              </div>

              <div className="task-item">
                <span>Status</span>
                <strong className={`statusText-${selectedTask.status}`}>
                  {selectedTask.status.toUpperCase()}
                </strong>
              </div>

            </div>

            {/* MESSAGE INPUT */}
            <div className="task-section-block">
              <span>Add Message (Optional)</span>
              <textarea
                placeholder="Enter reason / notes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="admin-textarea"
              />
            </div>

            {/* ACTION */}
            <div className="task-modal-footer">

              <button className="btn-confirm" onClick={handleUpdateStatus}>
                Confirm - {statusAction.toUpperCase()}
              </button>

              <button onClick={() => setSelectedTask(null)}>
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;