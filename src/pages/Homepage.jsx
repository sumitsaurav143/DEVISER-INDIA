import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    ResponsiveContainer
} from "recharts";
import "./homepage.css";


function Homepage() {
    const navigate = useNavigate();

    const [chartData, setChartData] = useState([
        { value: 10 },
        { value: 20 },
        { value: 15 },
        { value: 30 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(prev => {
                const newValue = Math.floor(Math.random() * 50) + 10;

                const updated = [...prev.slice(1), { value: newValue }];
                return updated;
            });
        }, 1000); // every 1 sec

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll(".fade-in");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    }
                });
            },
            { threshold: 0.2 }
        );

        elements.forEach((el) => observer.observe(el));
    }, []);

    return (
        <div className="homepage">

            {/* 🌌 FLOATING BLOBS */}
            <div className="blob blob1"></div>
            <div className="blob blob2"></div>

            {/* NAV */}
            <header className="nav">
                <div className="logo">ᗪ乇ᐯ丨丂乇尺</div>

                <button className="cta-btn" onClick={() => navigate("/login")}>
                    Login
                </button>
            </header>

            {/* HERO */}
            <section className="hero fade-in">

                <h1>
                    Build faster <br />
                    <span>Automate everything</span>
                </h1>

                <p>
                    The next-gen automation platform for high performance teams.
                </p>

                <button
                    className="cta-btn"
                    onClick={() => navigate("/login")}
                >
                    Enquiry Now →
                </button>

            </section>

            {/* 🖥 PREMIUM DASHBOARD PREVIEW */}
            <section className="preview fade-in">

                <div className="preview-card">

                    <div className="preview-glow"></div>

                    <div className="preview-content">
                        <div className="live-chart">

                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={chartData}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                        </div>

                        {/* <div className="preview-row">
                            <div className="box"></div>
                            <div className="box"></div>
                            <div className="box"></div>
                        </div> */}




                        <div className="table">

                            <div className="progress-row">
                                <span>Task 1</span>
                                <div className="progress-bar">
                                    <div className="progress-fill fill1"></div>
                                </div>
                            </div>

                            <div className="progress-row">
                                <span>Task 2</span>
                                <div className="progress-bar">
                                    <div className="progress-fill fill2"></div>
                                </div>
                            </div>

                            <div className="progress-row">
                                <span>Task 3</span>
                                <div className="progress-bar">
                                    <div className="progress-fill fill3"></div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ✨ FEATURES */}
            <section className="features fade-in">

                <h2 className="section-title">Why Choose Deviser</h2>

                <div className="feature-grid">

                    <div className="feature-card">
                        <div className="icon">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>Execute bulk automation tasks within seconds.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon">🔒</div>
                        <h3>Secure Platform</h3>
                        <p>Your data is protected with enterprise-grade security.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon">📊</div>
                        <h3>Real-time Insights</h3>
                        <p>Track performance with live analytics and reports.</p>
                    </div>

                </div>

            </section>

            {/* 📊 TRUST STATS */}
            <section className="stats fade-in">

                <div className="stats-grid">

                    <div className="stat-card">
                        <h1 className="stat-number">25+</h1>
                        <p>Daily Active Users</p>
                    </div>

                    <div className="stat-card">
                        <h1 className="stat-number">500+</h1>
                        <p>Tasks Processed</p>
                    </div>

                    <div className="stat-card">
                        <h1 className="stat-number">99%</h1>
                        <p>Success Rate</p>
                    </div>

                    <div className="stat-card">
                        <h1 className="stat-number">10</h1>
                        <p>Dedicated Members</p>
                    </div>

                    <div className="stat-card">
                        <h1 className="stat-number">24x7</h1>
                        <p>System Availability</p>
                    </div>



                </div>

            </section>

            {/* 💰 PRICING */}
            <section className="pricing fade-in">

                <h2 className="pricing-title">Simple, Transparent Pricing</h2>

                <div className="pricing-grid">

                    {/* FREE PLAN */}
                    <div className="price-card">
                        <h3>Stater</h3>
                        <p className="price">Free</p>

                        <ul>
                            <li>✔ 1 Free Demo</li>
                            <li>✔ 1 Account (1 Device)</li>
                            <li>✔ Automation Feature</li>
                            <li>✔ Real-time Insights</li>
                            <li>✔ Task Completion ~1 Hour</li>
                            <li>✔ 75% Accuracy</li>
                            <li>❌ No Customer Support</li>
                        </ul>

                        <button onClick={() => navigate("/login")}>
                            Get Started
                        </button>
                    </div>

                    {/* PRO PLAN (HIGHLIGHT) */}
                    <div className="price-card highlight glow">
                        <h3>Pro</h3>
                        <p className="price">₹1000</p>

                        <ul>
                            <li>✔ 1 Account (3 Devices)</li>
                            <li>✔ All Automation Features</li>
                            <li>✔ Real-time Insights</li>
                            <li>✔ Task Analytics</li>
                            <li>✔ Task Completion ~30 Min</li>
                            <li>✔ 90% Accuracy</li>
                            <li>✔ Support (10AM–5PM)</li>
                        </ul>

                        <button onClick={() => navigate("/login")}>
                            Upgrade to Pro
                        </button>
                    </div>

                    {/* GO PRO PLAN */}
                    <div className="price-card">
                        <h3>Go Pro</h3>
                        <p className="price">Min ₹2500</p>

                        <ul>
                            <li>✔ Unlimited Devices</li>
                            <li>✔ All Automation Features</li>
                            <li>✔ Real-time Analytics</li>
                            <li>✔ Task Completion ~30 Min</li>
                            <li>✔ 99% Accuracy</li>
                            <li>✔ Dedicated 24x7 Support</li>
                            <li>✔ Custom Enhancements</li>
                        </ul>

                        <button onClick={() => navigate("/login")}>
                            Go Pro
                        </button>
                    </div>

                </div>

            </section>

            {/* CTA */}
            <section className="cta fade-in">
                <h2>Start building today</h2>
            </section>

        </div>
    );
}

export default Homepage;