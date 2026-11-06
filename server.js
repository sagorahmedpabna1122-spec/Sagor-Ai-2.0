import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";
dotenv.config();
const app=express(); app.use(cors({origin:true})); app.use(express.json({limit:"12mb"}));
const parser=new Parser(); const key=process.env.OPENAI_API_KEY; const model=process.env.OPENAI_MODEL||"gpt-4.1-mini";
async function ai(input,instructions){
 if(!key)throw Error("Server-এ OPENAI_API_KEY configure করা হয়নি");
 const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model,instructions,input})});
 const d=await r.json(); if(!r.ok)throw Error(d.error?.message||"OpenAI API error");
 return (d.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n");
}
app.get("/api/health",(_q,s)=>s.json({ok:true,name:"SAGOR AI"}));
app.post("/api/chat",async(q,s)=>{try{s.json({answer:await ai(String(q.body.message||"").slice(0,12000),"তুমি SAGOR AI, বাংলাদেশের ব্যক্তিগত বাংলা সহকারী। স্বাভাবিক বাংলাদেশি বাংলায় উত্তর দাও। বর্তমান বা পুরোনো খবরের ক্ষেত্রে তারিখ, উৎস ও অনিশ্চয়তা স্পষ্ট করো। কোনো ফোনের কাজ বাস্তবে না করলে হয়েছে বলবে না।")})}catch(e){s.status(500).json({error:e.message})}});
app.post("/api/story",async(q,s)=>{try{s.json({story:await ai(String(q.body.topic||""),"বাংলাদেশি পাঠকের উপযোগী মৌলিক, আবেগঘন বাংলা গল্প লেখো।")})}catch(e){s.status(500).json({error:e.message})}});
app.post("/api/youtube-seo",async(q,s)=>{try{s.json({result:await ai(String(q.body.topic||""),"বাংলা YouTube SEO বিশেষজ্ঞ হিসেবে আকর্ষণীয় title, description, hashtags এবং সর্বোচ্চ 500 characters-এর tags তৈরি করো।")})}catch(e){s.status(500).json({error:e.message})}});
app.post("/api/image",async(q,s)=>{try{if(!key)throw Error("OPENAI_API_KEY missing");const r=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt:String(q.body.prompt||""),size:"1024x1024"})});const d=await r.json();if(!r.ok)throw Error(d.error?.message||"Image API error");s.json({image_base64:d.data?.[0]?.b64_json||null})}catch(e){s.status(500).json({error:e.message})}});
app.get("/api/news",async(_q,s)=>{const urls=["https://feeds.bbci.co.uk/news/world/rss.xml","https://www.aljazeera.com/xml/rss/all.xml"];const items=[];for(const u of urls){try{const f=await parser.parseURL(u);items.push(...(f.items||[]).slice(0,15).map(x=>({title:x.title,link:x.link,date:x.isoDate||x.pubDate,source:f.title})))}catch{}}s.json({items})});
// Requires a real web-search provider. Configure one here; this endpoint deliberately refuses to fabricate results.
app.post("/api/search",(_q,s)=>s.status(501).json({error:"লাইভ web search provider এখনো configure করা হয়নি। Search API provider ও key যুক্ত করতে হবে।"}));
app.use(express.static(process.cwd()));
app.get("*",(req,res)=>res.sendFile(process.cwd()+"/index.html"));
app.listen(process.env.PORT||3000,()=>console.log("SAGOR AI backend listening"));
