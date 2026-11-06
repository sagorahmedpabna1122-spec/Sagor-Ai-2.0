
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "12mb" }));

const parser = new Parser();

const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function ai(input, instructions) {
  if (!key) {
    throw new Error("Server-এ GEMINI_API_KEY configure করা হয়নি");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: instructions }]
      },
      contents: [{
        role: "user",
        parts: [{ text: input }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API Error");
  }

  return (data.candidates?.[0]?.content?.parts || [])
    .map(part => part.text || "")
    .join("\n");
}

app.get("/api/health", (_q, s) => {
  s.json({
    ok: true,
    name: "SAGOR AI",
    provider: "Google Gemini",
    model
  });
});

app.post("/api/chat", async (q, s) => {
  try {
    const answer = await ai(
      String(q.body.message || "").slice(0, 12000),
      "তুমি SAGOR AI, বাংলাদেশের ব্যক্তিগত বাংলা AI সহকারী। স্বাভাবিক বাংলাদেশি বাংলায় উত্তর দাও। প্রশ্ন বুঝে বিস্তারিত ও নির্ভুল উত্তর দাও।"
    );

    s.json({ answer });
  } catch (e) {
    s.status(500).json({ error: e.message });
  }
});

app.post("/api/story", async (q, s) => {
  try {
    const story = await ai(
      String(q.body.topic || "").slice(0, 12000),
      "তুমি একজন দক্ষ বাংলা গল্পকার। বাংলাদেশের দর্শকদের উপযোগী মৌলিক, আবেগঘন, রোমান্টিক ও সিনেমাটিক বাংলা গল্প লেখো।"
    );

    s.json({ story });
  } catch (e) {
    s.status(500).json({ error: e.message });
  }
});

app.post("/api/youtube-seo", async (q, s) => {
  try {
    const result = await ai(
      String(q.body.topic || "").slice(0, 12000),
      "তুমি একজন অভিজ্ঞ YouTube SEO বিশেষজ্ঞ। বাংলা লাভ স্টোরি চ্যানেলের জন্য SEO Title, Description, Hashtags এবং সর্বোচ্চ 500 characters-এর English tags তৈরি করো। বাংলা লাভ স্টোরি শব্দটি বাংলায় রাখবে।"
    );

    s.json({ result });
  } catch (e) {
    s.status(500).json({ error: e.message });
  }
});

app.get("/api/news", async (_q, s) => {
  const urls = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml"
  ];

  const items = [];

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);

      items.push(
        ...(feed.items || []).slice(0, 15).map(item => ({
          title: item.title,
          link: item.link,
          date: item.isoDate || item.pubDate,
          source: feed.title
        }))
      );
    } catch (e) {
      console.log("News feed error:", e.message);
    }
  }

  s.json({ items });
});

// Image generation needs a separate supported image service.
app.post("/api/image", (_q, s) => {
  s.status(501).json({
    error: "Image generation service এখনো যুক্ত করা হয়নি।"
  });
});

// Live web search needs a separate search provider.
app.post("/api/search", (_q, s) => {
  s.status(501).json({
    error: "Live web search provider এখনো যুক্ত করা হয়নি।"
  });
});

app.use(express.static(process.cwd()));

app.get("*", (_req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("SAGOR AI Gemini backend listening");
});
