import { useState } from "react";
import "./chatbox.css";

function Chatbox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = { role: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        const res = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: input })
        });

        const data = await res.json();

        const botMessage = { role: "bot", text: data.reply };
        setMessages(prev => [...prev, botMessage]);

        setInput("");
    };

    return (
        <div className="chatbox">
            <div className="chat-header">AI Assistant</div>

            <div className="chat-body">
                {messages.map((msg, i) => (
                    <div key={i} className={msg.role}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about automation..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Chatbox;