import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
    try {
        console.log("Incoming request:", req.body);

        const { message } = req.body;

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            input: message
        });

        console.log("OpenAI response:", response);

        res.json({
            reply: response.output[0].content[0].text
        });

    } catch (err) {
        console.error("ERROR:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));