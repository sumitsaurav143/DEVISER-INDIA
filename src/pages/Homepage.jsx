import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    ResponsiveContainer
} from "recharts";
import "./homepage.css";
import founderImage from "../assets/Founder.png";
import Chatbox from "./Chatbox";

function Homepage() {
    const navigate = useNavigate();

    const [chartData, setChartData] = useState([
        { value: 10 },
        { value: 20 },
        { value: 15 },
        { value: 30 }
    ]);

    const words = ["AI Automation", "Intelligence", "Smart Workflows", "AI Growth"];

    const [text, setText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        const currentWord = words[wordIndex];
        const speed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                setText(currentWord.substring(0, text.length + 1));

                if (text === currentWord) {
                    setTimeout(() => setIsDeleting(true), 1000);
                }
            } else {
                setText(currentWord.substring(0, text.length - 1));

                if (text === "") {
                    setIsDeleting(false);
                    setWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, wordIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(prev => {
                const newValue = Math.floor(Math.random() * 50) + 10;
                return [...prev.slice(1), { value: newValue }];
            });
        }, 1000);

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

            {/* BLOBS */}
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
                    Build for <br />
                    <span className="animated-text">{text}</span>
                    <span className="cursor">|</span>
                </h1>


                {/* 🔥 CLEAN TEXT */}
                <p className="hero-desc">
                    AI Agents • Intelligent Automation <br />
                    Smart Workflows • AI-Powered Applications
                </p>

                <div className="hero-buttons">
                    <button className="cta-btn-start">
                        Start Today →
                    </button>

                    <button className="cta-secondary">
                        View Demo
                    </button>
                </div>

                <p className="tagline">
                    AI-driven platform helping businesses automate, predict, and scale faster
                </p>

            </section>

            {/* PREVIEW */}
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

                        <div className="table">

                            {["Task 1", "Task 2", "Task 3"].map((task, i) => (
                                <div className="progress-row" key={i}>
                                    <span>{task}</span>
                                    <div className="progress-bar">
                                        <div className={`progress-fill fill${i + 1}`}></div>
                                    </div>
                                </div>
                            ))}

                        </div>

                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="services fade-in">
                <h2 className="section-title">Our Services</h2>

                <div className="services-grid">

                    <div className="service-card">
                        <h3>📄 Data Automation</h3>
                        <p>Automate repetitive data entry tasks with speed & accuracy.</p>
                    </div>

                    <div className="service-card">
                        <h3>🧪 QA Automation</h3>
                        <p>Automated testing pipelines for faster and reliable releases.</p>
                    </div>

                    <div className="service-card">
                        <h3>⚙️ Custom Automation</h3>
                        <p>Tailor-made workflows built specifically for your business.</p>
                    </div>

                    <div className="service-card">
                        <h3>🌐 Website Development</h3>
                        <p>Modern, fast, and scalable websites with premium UI/UX.</p>
                    </div>

                </div>
            </section>

            {/* FEATURES */}
            <section className="features fade-in">
                <h2 className="section-title">Why Choose Deviser</h2>

                <div className="feature-grid">

                    <div className="feature-card">
                        <div className="icon">⚡</div>
                        <h3>AI Decision Engine</h3>
                        <p>Make intelligent decisions based on real-time data.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon">🔒</div>
                        <h3>AI-Powered Security</h3>
                        <p>Smart anomaly detection and data protection.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon">📊</div>
                        <h3>Real-time Insights</h3>
                        <p>Live analytics and performance tracking.</p>
                    </div>

                </div>
            </section>

            {/* STATS */}
            <section className="stats fade-in">
                <div className="stats-grid">

                    <div className="stat-card">
                        <h1 className="stat-number">25+</h1>
                        <p>Daily Users</p>
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
                        <h1 className="stat-number">24x7</h1>
                        <p>Availability</p>
                    </div>

                </div>
            </section>

            {/* PRICING */}
            {/* <section className="pricing fade-in">
                <h2 className="pricing-title">Simple Pricing</h2>

                <div className="pricing-grid">

                    <div className="price-card">
                        <h3>Starter</h3>
                        <p className="price">Free</p>
                        <ul>
                            <li>✔ 1 Demo</li>
                            <li>✔ 1 Device</li>
                            <li>✔ Basic Automation</li>
                            <li>❌ No Support</li>
                        </ul>
                        <button onClick={() => navigate("/login")}>
                            Get Started
                        </button>
                    </div>

                    <div className="price-card highlight glow">
                        <h3>Pro</h3>
                        <p className="price">₹1000</p>
                        <ul>
                            <li>✔ 3 Devices</li>
                            <li>✔ Full Automation</li>
                            <li>✔ Analytics</li>
                            <li>✔ Support</li>
                        </ul>
                        <button onClick={() => navigate("/login")}>
                            Upgrade
                        </button>
                    </div>

                    <div className="price-card">
                        <h3>Go Pro</h3>
                        <p className="price">₹2500+</p>
                        <ul>
                            <li>✔ Unlimited Devices</li>
                            <li>✔ 24x7 Support</li>
                            <li>✔ Custom Solutions</li>
                        </ul>
                        <button onClick={() => navigate("/login")}>
                            Go Pro
                        </button>
                    </div>

                </div>
            </section> */}


            {/* 👤 FOUNDER SECTION */}
            <section className="founder fade-in">

                <div className="founder-container">

                    {/* LEFT → IMAGE */}
                    <div className="founder-image-advanced">

                        <div className="frame-bg"></div>
                        <div className="frame-border"></div>

                        <img
                            src={founderImage}
                            alt="Founder"
                            className="founder-img"
                        />



                    </div>

                    {/* RIGHT → CONTENT */}
                    <div className="founder-content">

                        <h2 className="section-title">Meet the Founder</h2>

                        <h3 className="founder-name">Sumit Saurav</h3>

                        <p className="founder-role">Founder • Deviser India</p>

                        <p className="founder-desc">
                            I built Deviser to bring AI into everyday business workflows —
                            reducing manual effort and enabling intelligent decision-making.
                        </p>

                        <p className="founder-desc">
                            From AI agents to predictive workflows, our goal is to help companies
                            scale faster, cut costs, and operate smarter.
                        </p>

                        <div className="vision-box">
                            🚀 <strong>Vision:</strong> Build India’s most powerful AI-driven automation platform
                        </div>

                    </div>

                </div>

            </section>

            {/* CTA */}
            <section className="cta fade-in">
                <h2>
                    Ready to automate your business?
                    <br />
                    <span>Let’s build your AI Solution 🚀</span>
                </h2>

                <button
                    className="cta-btn-start"
                    onClick={() => navigate("/login")}
                >
                    Get Started →
                </button>
            </section>

            {/* <Chatbox /> */}

        </div>
    );
}

export default Homepage;