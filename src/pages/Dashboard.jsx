import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // make sure storage is configured
import { db } from "../firebase";
import toast from "react-hot-toast";
import "./dashboard.css";
import * as XLSX from "xlsx";

function Dashboard() {

  const navigate = useNavigate();

  const [showRecharge, setShowRecharge] = useState(false);
  const [showRechargeMessage, setShowRechargeMessage] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const [loadingTaskId, setLoadingTaskId] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState("");


  const [taskForm, setTaskForm] = useState({
    userid: "",
    password: "",
    year: "",
    season: "",
    file: "",
    totalFarmers: ""
  });

  // ✅ Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // 🔐 Not logged in
    if (!token || !storedUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    setUser(storedUser);

  }, []);

  // ✅ 🔥 REAL-TIME USER SYNC (FIXED)
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "userData", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const latestUser = docSnap.data();

          setUser(prevUser => {
            const updatedUser = {
              ...prevUser,
              ...latestUser
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            return updatedUser;
          });
        }
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ REAL-TIME TASK FETCH
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "tasks"),
      where("owner", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ Stats
  const stats = {
    total: tasks.length,
    new: tasks.filter(t => t.status === "new").length,
    completed: tasks.filter(t => t.status === "completed").length,
    running: tasks.filter(t => t.status === "running").length,
    failed: tasks.filter(t => t.status === "failed").length
  };

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];

  //   if (!file) return;

  //   try {
  //     setUploading(true);

  //     const fileRef = ref(storage, `tasks/${user.uid}/${Date.now()}-${file.name}`);

  //     await uploadBytes(fileRef, file);

  //     const downloadURL = await getDownloadURL(fileRef);

  //     // 🔥 SAVE URL IN FORM
  //     setTaskForm(prev => ({
  //       ...prev,
  //       file: downloadURL
  //     }));

  //   } catch (error) {
  //     console.error("Upload error:", error);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const REQUIRED_COLUMNS = [
    "Farmer Name",
    "Crop Category",
    "Crop*",
    "Area Shown in (Ha)*",
    "Expected Yields in (Quintals)*",
    "Self Consumption in (Quintals)*"
  ];

  const validateExcel = async (file) => {
    const errors = [];
    const rowErrors = [];

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    //const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const rawJson = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const json = rawJson.map(row => {
      const newRow = {};

      Object.keys(row).forEach(key => {
        const cleanKey = key.trim();

        let value = row[key];

        // ✅ trim only if string
        if (typeof value === "string") {
          value = value.trim();
        }

        newRow[cleanKey] = value;
      });

      return newRow;
    });

    if (json.length === 0) {
      return { valid: false, errors: ["Excel is empty"] };
    }

    const headers = Object.keys(json[0]);

    // ✅ Check required columns
    REQUIRED_COLUMNS.forEach(col => {
      if (!headers.includes(col)) {
        errors.push(`Missing column: ${col}`);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // ✅ Row validation
    json.forEach((row, index) => {
      const rowError = [];

      REQUIRED_COLUMNS.forEach(col => {
        if (!row[col] || row[col].toString().trim() === "") {
          rowError.push(`${col} is mandatory`);
        }
      });

      if (rowError.length > 0) {
        rowErrors.push({
          row: index + 2,
          errors: rowError
        });
      }
    });

    return {
      valid: errors.length === 0 && rowErrors.length === 0,
      errors,
      rowErrors
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ❌ File type check
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Only Excel files allowed");
      return;
    }

    try {
      // 🔍 STEP 1: VALIDATION
      setStatus("validating");
      const result = await validateExcel(file);
      console.log("Excel Validation result:", result);

      if (!result.valid) {
        setStatus("invalid");
        if (result.errors.length > 0) {
          //toast.error(result.errors.join(", "));
          console.error("Validation errors:", result.errors);
        }

        if (result.rowErrors.length > 0) {
          // toast.error(
          //   `Row ${result.rowErrors[0].row}: ${result.rowErrors[0].errors.join(", ")}`
          // );
          console.error("Row validation errors:", result.rowErrors);
        }

        return;
      }

      // ✅ UPLOAD AFTER VALIDATION
      setUploading(true);
      // ⬆️ STEP 2: UPLOAD
      setStatus("uploading");

      const fileRef = ref(storage, `tasks/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);

      const downloadURL = await getDownloadURL(fileRef);

      setTaskForm(prev => ({
        ...prev,
        file: downloadURL
      }));

      setStatus("");
      toast.success("Excel validated & uploaded ✅");

    } catch (err) {
      console.error(err);
      toast.error("Invalid Excel file");
    } finally {
      setUploading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || rechargeAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const newBalance = (user.balance || 0) + Number(rechargeAmount);

      await updateDoc(doc(db, "userData", user.uid), {
        balance: newBalance
      });

      toast.success(`Wallet recharged with ₹ ${rechargeAmount}`);

      setRechargeAmount("");
      setShowRecharge(false);

    } catch (error) {
      console.error("Recharge failed:", error);
      toast.error("Recharge failed");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setDateFilter("");
  };

  // Handle input
  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ ADD TASK
  const handleAddTask = async () => {
    const errors = [];

    if (!taskForm.userid) errors.push("User ID is required");
    if (!taskForm.password) errors.push("Password is required");
    if (!taskForm.year) errors.push("Year is required");
    if (!taskForm.file) errors.push("File upload is required");
    if (!taskForm.totalFarmers) errors.push("Total Farmers is required");

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    const farmerCount = Number(taskForm.totalFarmers);
    const cost = farmerCount * 2;

    if ((user.balance || 0) < cost) {
      toast.error("Insufficient balance");
      return;
    }


    try {
      // 🔥 Deduct balance
      const newBalance = user.balance - cost;

      await updateDoc(doc(db, "userData", user.uid), {
        balance: newBalance
      });

      // 🔥 Save task
      await addDoc(collection(db, "tasks"), {
        ...taskForm,
        totalFarmers: farmerCount,
        cost: cost,
        status: "new",
        reason: "N/A",
        owner: user.uid,
        createdAt: serverTimestamp()
      });

      toast.success("Task added successfully");

      setShowTaskForm(false);

      setTaskForm({
        userid: "",
        password: "",
        year: "",
        season: "",
        file: "",
        totalFarmers: ""
      });

    } catch (error) {
      toast.error("Failed to add task");
      console.error("Error adding task:", error);
    }
  };


  const handleDeleteTask = async (task) => {
    try {
      setLoadingTaskId(task.id); // 🔥 start loader

      const refund = task.totalFarmers * 2;

      await updateDoc(doc(db, "userData", user.uid), {
        balance: user.balance + refund
      });

      await deleteDoc(doc(db, "tasks", task.id));

      toast.success("Refund processed and task deleted");

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete task");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const openAdminPanel = () => {
    navigate("/admin");
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <div>Loading...</div>;



  const filterTasks = (list) => {
    return list.filter(task => {

      // 🔍 search filter
      const matchSearch =
        task.userid?.toLowerCase().includes(search.toLowerCase()) ||
        task.file?.toLowerCase().includes(search.toLowerCase());

      // 📅 date filter
      if (!dateFilter) return matchSearch;

      const taskDate = task.createdAt?.seconds
        ? new Date(task.createdAt.seconds * 1000)
          .toISOString()
          .split("T")[0]
        : "";

      return matchSearch && taskDate === dateFilter;
    });
  };

  const newTasks = filterTasks(tasks.filter(t => t.status === "new"));
  const completedTasks = filterTasks(tasks.filter(t => t.status === "completed"));
  const runningTasks = filterTasks(tasks.filter(t => t.status === "running"));
  const failedTasks = filterTasks(tasks.filter(t => t.status === "failed"));

  return (
    <div className="dashboard">

      {/* ✅ OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="logo">ᗪ乇ᐯ丨丂乇尺</div>

        <div className="user-info">
          <div className="user-avatar">
            {user.name?.charAt(0)}
          </div>

          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
            <span className={`user-status status-${user.status}`}>
              {user.status}
            </span>
          </div>
        </div>

        <ul className="menu">
          <li
            className={activeMenu === "dashboard" ? "active" : ""}
            onClick={() => { setActiveMenu("dashboard"); setSidebarOpen(false); }}
          >
            Dashboard
          </li>

          <li
            className={activeMenu === "new" ? "active" : ""}
            onClick={() => { setActiveMenu("new"); setSidebarOpen(false); }}
          >
            Create New Tasks
          </li>

          <li
            className={activeMenu === "completed" ? "active" : ""}
            onClick={() => { setActiveMenu("completed"); setSidebarOpen(false); }}
          >
            Completed Tasks
          </li>

          <li
            className={activeMenu === "running" ? "active" : ""}
            onClick={() => { setActiveMenu("running"); setSidebarOpen(false); }}
          >
            Running Tasks
          </li>

          <li
            className={activeMenu === "failed" ? "active" : ""}
            onClick={() => { setActiveMenu("failed"); setSidebarOpen(false); }}
          >
            Failed Tasks
          </li>

          <li
            className={activeMenu === "settings" ? "active" : ""}
            onClick={() => { setActiveMenu("settings"); setSidebarOpen(false); }}
          >
            Settings
          </li>
        </ul>


        <div className="sidebar-footer">
          {user.email === "admin@mail.com" && (
            <button className="adminEnter-btn" onClick={openAdminPanel}>
              Enter Admin Mode
            </button>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>

      {/* MAIN */}
      <div className="main">


        <div className="topbar">
          <div className="topbar-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>
          <h3>
            {activeMenu === "dashboard" && "Dashboard"}
            {activeMenu === "new" && "Tasks"}
            {activeMenu === "completed" && "Tasks"}
            {activeMenu === "running" && "Tasks"}
            {activeMenu === "failed" && "Tasks"}
            {activeMenu === "settings" && "Settings"}
          </h3>

          <button
            className="wallet-btn"
            onClick={() => setShowRecharge(true)}
          >
            💰 ₹ {(user.balance || 0).toLocaleString()}
          </button>
        </div>

        {user.status === "blocked" ? (
          <div className="blocked-notice">
            Your account has been blocked.
            <br />Please contact support.
          </div>
        ) : (

          <div className="content">

            {/* DASHBOARD */}
            {activeMenu === "dashboard" && (
              <div className="cards">

                <div className="card">
                  <h3>Total Groups</h3>
                  <p>{stats.total}</p>
                </div>

                <div className="card">
                  <h3>Pending Groups</h3>
                  <p>{stats.new}</p>
                </div>

                <div className="card">
                  <h3>Completed Groups</h3>
                  <p>{stats.completed}</p>
                </div>

                <div className="card">
                  <h3>Running Groups</h3>
                  <p>{stats.running}</p>
                </div>

                <div className="card">
                  <h3>Failed Groups</h3>
                  <p>{stats.failed}</p>
                </div>

              </div>
            )}

            {/* CREATE TASK */}
            {activeMenu === "new" && (
              <div className="task-section">

                <div className="task-header">
                  <h2>New Tasks</h2>

                  <button
                    className="add-task-btn"
                    onClick={() => setShowTaskForm(true)}
                  >
                    + New Task
                  </button>
                  <div style={{ display: "flex", gap: "10px" }}>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-input"
                    />

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />

                    {/* ✅ CLEAR BUTTON */}
                    {(search || dateFilter) && (
                      <button
                        className="clear-btn"
                        onClick={handleClearFilters}
                      >
                        Clear
                      </button>
                    )}

                  </div>
                </div>

                <div className="task-list">
                  {newTasks.length === 0 ? (
                    <p>No new tasks</p>
                  ) : (
                    newTasks.map(task => (
                      <div
                        className="task-card-horizontal"
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="task-left">
                          <div><strong>User:</strong> {task.userid}</div>
                          <div><strong>Password:</strong> ******</div>
                        </div>

                        <div className="task-center">
                          <span className={`task-status status-${task.status}`}>
                            {task.status}
                          </span>
                        </div>

                        <div className="task-right">
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task);
                            }}
                          >
                            Delete
                          </button>

                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* MODAL */}
                {showTaskForm && (
                  <div className="modal">
                    <div className="modal-content">

                      <h2>Create New Task</h2>

                      <input name="userid" placeholder="User ID" value={taskForm.userid} onChange={handleTaskChange} />
                      <input name="password" placeholder="Password" value={taskForm.password} onChange={handleTaskChange} />
                      <select
                        name="year"
                        value={taskForm.year}
                        onChange={handleTaskChange}
                        className="input-select"
                      >
                        <option value="">Select Year</option>

                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>

                      <select
                        name="season"
                        value={taskForm.season}
                        onChange={handleTaskChange}
                        className="input-select"
                      >
                        <option value="">Select Season</option>

                        {["Rabi", "Kharif", "Summer"].map(season => (
                          <option key={season} value={season}>
                            {season}
                          </option>
                        ))}
                      </select>

                      <input
                        type="file"
                        placeholder="File Name"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                      />
                      {status === "validating" && (
                        <div className="file-status validating">
                          <div className="file-loader"></div>
                          <span>Validating file...</span>
                        </div>
                      )}

                      {status === "uploading" && (
                        <div className="file-status uploading">
                          <div className="file-loader"></div>
                          <span>Uploading file...</span>
                        </div>
                      )}

                      {status === "invalid" && (
                        // document.querySelector('input[type="file"]').value = "",
                        <div className="file-status invalid">
                          <span>Invalid file, Please upload a valid file.</span>
                        </div>
                      )}

                      {taskForm.file && (
                        <div className="file-uploaded">
                          <span className="file-text">File uploaded ✅</span>

                          <button
                            className="remove-file-btn"
                            onClick={() => {
                              setTaskForm(prev => ({
                                ...prev,
                                file: ""
                              }));
                              document.querySelector('input[type="file"]').value = "";
                            }
                            }
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <input name="totalFarmers" placeholder="Total Farmers" value={taskForm.totalFarmers} onChange={handleTaskChange} />

                      <button className="pay-btn" onClick={handleAddTask}>
                        Add Task
                      </button>

                      <button onClick={() => {
                        setShowTaskForm(false);
                        setTaskForm({
                          userid: "",
                          password: "",
                          year: "",
                          season: "",
                          file: "",
                          totalFarmers: ""
                        });
                        setStatus("");
                      }}>
                        Cancel
                      </button>

                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMenu === "completed" && (
              <div className="task-section">

                <div className="task-header">
                  <h2>Completed Tasks</h2>
                  <div style={{ display: "flex", gap: "10px" }}>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-input"
                    />

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />



                    {/* ✅ CLEAR BUTTON */}
                    {(search || dateFilter) && (
                      <button
                        className="clear-btn"
                        onClick={handleClearFilters}
                      >
                        Clear
                      </button>
                    )}

                  </div>
                </div>

                <div className="task-list">
                  {completedTasks.length === 0 ? (
                    <p>No completed tasks</p>
                  ) : (
                    completedTasks.map(task => (
                      <div
                        className="task-card-horizontal"
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="task-left">
                          <div><strong>User:</strong> {task.userid}</div>
                          <div><strong>Season:</strong> {task.season}</div>
                        </div>

                        <div className="task-center">
                          <span className="task-status status-completed">
                            completed
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {activeMenu === "running" && (
              <div className="task-section">

                <div className="task-header">
                  <h2>Running Tasks</h2>
                  <div style={{ display: "flex", gap: "10px" }}>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-input"
                    />

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />



                    {/* ✅ CLEAR BUTTON */}
                    {(search || dateFilter) && (
                      <button
                        className="clear-btn"
                        onClick={handleClearFilters}
                      >
                        Clear
                      </button>
                    )}

                  </div>
                </div>

                <div className="task-list">
                  {runningTasks.length === 0 ? (
                    <p>No tasks Inprogress</p>
                  ) : (
                    runningTasks.map(task => (
                      <div
                        className="task-card-horizontal"
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="task-left">
                          <div><strong>User:</strong> {task.userid}</div>
                          <div><strong>Season:</strong> {task.season}</div>
                        </div>

                        <div className="task-center">
                          <span className="task-status status-running">
                            In progress
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}


            {activeMenu === "failed" && (
              <div className="task-section">

                <div className="task-header">
                  <h2>Failed/Rejected Tasks</h2>
                  <div style={{ display: "flex", gap: "10px" }}>


                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-input"
                    />

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />

                    {/* ✅ CLEAR BUTTON */}
                    {(search || dateFilter) && (
                      <button
                        className="clear-btn"
                        onClick={handleClearFilters}
                      >
                        Clear
                      </button>
                    )}

                  </div>
                </div>

                <div className="task-list">
                  {failedTasks.length === 0 ? (
                    <p>No failed tasks</p>
                  ) : (
                    failedTasks.map(task => (
                      <div
                        className="task-card-horizontal"
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="task-left">
                          <div><strong>User:</strong> {task.userid}</div>
                          <div><strong>Season:</strong> {task.season}</div>
                        </div>

                        <div className="task-center">
                          <span className="task-status status-failed">
                            failed
                          </span>
                        </div>

                        <div className="task-right">
                          <button
                            className="refund-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task);
                            }}
                            disabled={loadingTaskId === task.id}
                          >
                            {loadingTaskId === task.id ? (
                              <span className="loader"></span>
                            ) : (
                              "Get Refund"
                            )}
                          </button>

                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* SETTINGS */}
            {activeMenu === "settings" && (
              <div>
                <p>Manage your account preferences.</p>
              </div>
            )}

          </div>
        )}
      </div>

      {/* RECHARGE */}
      {showRecharge && user.status === "verified" && (
        <div className="modal">
          <div className="modal-content">

            <h2>Recharge Wallet</h2>

            {showRechargeMessage ? 
              <div className="recharge-message">
                Contact admin for recharge 💬
              </div>
             : 
              <>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                />

                <button className="pay-btn" onClick={handleRecharge}>
                  Proceed to Pay
                </button>
              </>
            }

            <button onClick={() => setShowRecharge(false)}>
              Close
            </button>

          </div>
        </div>
      )}

      {selectedTask && (
        <div className="modal">
          <div className="modal-content task-modal">

            <h2>Task Details</h2>

            {/* 🔹 TOP GRID */}
            <div className="task-grid">

              <div className="task-item">
                <span>User ID</span>
                <strong>{selectedTask.userid}</strong>
              </div>

              <div className="task-item">
                <span>Password</span>
                <strong>{selectedTask.password}</strong>
              </div>

              <div className="task-item">
                <span>Year</span>
                <strong>{selectedTask.year}</strong>
              </div>

              <div className="task-item">
                <span>Season</span>
                <strong>{selectedTask.season}</strong>
              </div>

              <div className="task-item">
                <span>Task Cost</span>
                <strong>₹ {selectedTask.cost}</strong>
              </div>

              <div className="task-item">
                <span>Status</span>
                <p className={`statusText-${selectedTask.status}`}>
                  {selectedTask.status.toUpperCase()}
                </p>
              </div>

              {selectedTask.status !== "completed" ? (

                <div className="task-section-block">
                  <span>File:   </span>
                  <a
                    href={selectedTask.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-btn"
                  >
                    View Uploaded File
                  </a>
                </div>) : null}

            </div>

            {/* 🔹 MESSAGE SECTION */}
            {selectedTask.reason && (
              <div className="task-section-block">
                <span>Message / Error</span>
                <p>{selectedTask.reason}</p>
              </div>
            )}

            {/* 🔹 DATE */}
            {selectedTask.createdAt?.seconds && (
              <div className="task-section-block">
                <span>Created At</span>
                <p>
                  {new Date(selectedTask.createdAt.seconds * 1000).toLocaleString()}
                </p>
              </div>
            )}

            {/* 🔹 ACTION */}
            <div className="task-modal-footer">
              <button onClick={() => setSelectedTask(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;