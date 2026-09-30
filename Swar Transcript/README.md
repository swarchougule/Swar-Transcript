# SwarTranscript AI

> **Turn YouTube Videos into Text. Instantly.**  
> AI-powered YouTube video transcription, executive summaries, takeaways, chapters, notes, and grounded Q&A.

---

## 🚀 Features

- **Instant YouTube Transcription**: Extract complete transcripts from any public YouTube video link using Apify and Supabase Edge Functions.
- **AI Toolkit (Powered by Groq LPUs & Llama 3.3)**:
  - 📝 **AI Summary**: High-level executive synthesis of video narrative.
  - 🎯 **Key Takeaways**: 5 structured, high-impact bullet points.
  - ⏱️ **Chapters**: Chronological sections with approximate timestamps (`[MM:SS]`).
  - 📖 **AI Notes**: Formatted study and reference notes with definitions and concepts.
  - 💬 **Ask AI**: Direct question answering strictly grounded in transcript content without hallucinations.
- **Clean Plain-Text Formatting**: Sanitized responses free of raw Markdown asterisks, LaTeX math syntax, HTML tags, or tables.
- **Authentication**: Email/Password and Google OAuth authentication powered by Supabase Auth.
- **In-Transcript Search**: Instant keyword search with match counter and text highlighting.
- **Export Options**: Download transcripts in Plain Text (`.txt`), Markdown (`.md`), or Subtitles (`.srt`).
- **Security by Design**: Apify and Groq API tokens remain strictly server-side inside Supabase Edge Function secrets.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend / Serverless**: Supabase Edge Functions (Deno Runtime)
- **Database & Auth**: Supabase Auth
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`)
- **Transcription**: Apify Actor (`streamers/youtube-scraper`)

---

## 🏗️ Architecture

```
React (Vite Frontend)
   │
   ├── POST /functions/v1/generate-transcript ──► Apify Actor (streamers/youtube-scraper) ──► YouTube Video Transcripts
   │
   └── POST /functions/v1/ai-toolkit ───────────► Groq LPU API (llama-3.3-70b-versatile) ───► AI Summaries, Notes & Q&A
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/swarchougule/Swar-Transcript.git
cd Swar-Transcript
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your client-side Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
```

### 4. Configure Supabase Edge Function Secrets

In your [Supabase Dashboard](https://supabase.com/dashboard) under **Project Settings → Edge Functions → Secrets**, configure:

- `APIFY_API_TOKEN`: Your Apify API Token.
- `GROQ_API_KEY`: Your Groq API Key from [console.groq.com](https://console.groq.com).

### 5. Run the Application Locally

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### 6. Build for Production

```bash
npm run build
```

---

## 📄 License

MIT License. Built with ❤️ for seamless knowledge extraction from video content.
