
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new Parser();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "12mb" }));

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

async function ai(input, instructions = "তুমি SAGOR AI। স্বাভাবিক, সহজ ও সুন্দর বাংলায় উত্তর দাও।") {
  if (!API_KEY) {
    throw new Error("OPENROUTER_API_KEY সেট করা নেই।");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sagor-ai.onrender.com",
        "X-OpenRouter-Title": "SAGOR AI"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: input }
        ],
        temperature: 0.7
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `OpenRouter Error: ${response.status}`
    );
  }

  const answer = data?.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error("AI কোনো উত্তর দেয়নি।");
  }

  return typeof answer === "string"
    ? answer
    : JSON.stringify(answer);
}

// Backend Status
app.get("/", (req, res) => {
  res.send("SAGOR AI Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    provider: "OpenRouter",
    model: MODEL,
    keyConfigured: Boolean(API_KEY)
  });
});

// AI Chat
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message || req.body.prompt;

    if (!message) {
      return res.status(400).json({ error: "প্রশ্ন লিখুন।" });
    }

    const reply = await ai(message);

    res.json({
      reply,
      answer: reply,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Bengali Story
app.post("/api/story", async (req, res) => {
  try {
    const prompt =
      req.body.prompt ||
      req.body.topic ||
      req.body.message ||
      "একটি সুন্দর বাংলা ভালোবাসার গল্প লেখো।";

    const reply = await ai(
      prompt,
      "তুমি একজন অভিজ্ঞ বাংলা গল্পকার। আবেগপূর্ণ, রোমান্টিক ও ধারাবাহিক গল্প লেখো।"
    );

    res.json({ story: reply, reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// YouTube SEO
app.post("/api/youtube-seo", async (req, res) => {
  try {
    const title = req.body.title || req.body.topic || req.body.prompt;

    if (!title) {
      return res.status(400).json({ error: "ভিডিওর Title দিন।" });
    }

    const reply = await ai(
      `এই ভিডিওর জন্য সম্পূর্ণ YouTube SEO তৈরি করো: ${title}

SEO Title, Description, Hashtags এবং Search Tags তৈরি করো।`,
      "তুমি একজন Professional YouTube SEO Expert।"
    );

    res.json({ result: reply, seo: reply, reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Latest News RSS
app.get("/api/news", async (req, res) => {
  try {
    const feeds = [
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://www.aljazeera.com/xml/rss/all.xml"
    ];

    const items = [];

    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        feed.items.slice(0, 8).forEach(item => {
          items.push({
            title: item.title,
            link: item.link,
            date: item.isoDate || item.pubDate,
            source: feed.title
          });
        });

      } catch (error) {
        console.log("RSS error:", error.message);
      }
    }

    res.json({ items });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Web Search - needs a separate search API
app.post("/api/search", (req, res) => {
  res.status(501).json({
    error: "লাইভ Web Search-এর জন্য আলাদা Search API সংযুক্ত করতে হবে।"
  });
});

// Image Generation - separate image API required
app.post("/api/image", (req, res) => {
  res.status(501).json({
    error: "Image Generation এখনো সংযুক্ত করা হয়নি।"
  });
});

app.listen(PORT, () => {
  console.log(`SAGOR AI running on port ${PORT}`);
});
