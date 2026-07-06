# AI Interview Prep Platform

A fullstack AI-powered mock interview platform built with MERN stack and Groq AI.

## Features
- 🤖 AI-generated interview questions (streaming)
- ⚡ Real-time answer evaluation with score & feedback
- 📄 Resume analysis with role-fit scoring
- 📊 Progress dashboard with session history
- 🔒 JWT authentication & role-based access
- ⚙️ Admin panel for user management
- 🌙 Dark/light mode

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Groq API (llama-3.1-8b-instant)
- **Auth**: JWT, bcryptjs
- **Deployment**: Render (backend), Vercel (frontend)

## Local Development

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

See `server/.env.example` for all required variables.

## Live Demo
- Frontend: https://ai-interview-prep-seven-phi.vercel.app/
- API: https://ai-interview-prep-api.onrender.com/api/health

## Built by
Sujeet Rajbhar — 2026
