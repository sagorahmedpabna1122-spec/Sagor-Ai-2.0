SAGOR AI — GitHub + Render starter

এই ZIP extract করে ভেতরের সব ফাইল GitHub repository-র root-এ upload করুন।
ফাইলগুলো: index.html, server.js, package.json, .env.example, README_BN.txt

Render deploy: New > Web Service > GitHub repo connect. Build command: npm install. Start command: npm start.
Environment variable: OPENAI_API_KEY = আপনার OpenAI API key (এটি কাউকে পাঠাবেন না, HTML-এ লিখবেন না)।

Deploy হলে Render URL-টি index.html-এর Settings > Secure Backend URL-এ দিন।
এটি starter app; API key, hosting এবং provider billing লাগবে।

SAGOR AI HTML TO APK

1) HTML-to-APK builder-এ index.html আপলোড/পেস্ট করুন।
2) HTML একাই AI API চালাতে পারবে না। AI chat/story/SEO/image/news-এর জন্য backend deploy করতে হবে।
3) backend ফোল্ডারে Node.js 20+ environment-এ npm install চালান।
4) .env.example কপি করে .env করুন এবং server-এ OPENAI_API_KEY বসান। API key কখনো HTML-এ দেবেন না।
5) backend deploy করে HTTPS URL নিন; অ্যাপে Settings > Secure Backend URL-এ URL বসান।
6) Android WebView builder-এ JavaScript, Internet, Microphone এবং Location permission enable করুন। Deep links/intent support থাকলে app launch/alarm integration ভালো কাজ করবে।
7) Facebook/YouTube screen reading, scrolling, arbitrary phone control-এর জন্য native Android Accessibility bridge প্রয়োজন; শুধু HTML দিয়ে সম্ভব নয়।

এই package একটি সুন্দর HTML frontend ও starter backend দেয়; এটি preconfigured live service নয়। API billing, hosting, provider access এবং বাস্তব ফোনে পরীক্ষা প্রয়োজন।
