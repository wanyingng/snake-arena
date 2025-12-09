# 🐍 Snake Arena

> **A modern, multiplayer Snake game with real-time leaderboards and spectator mode**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://snake-arena-2w0m.onrender.com/)

**[🎮 Play Now](https://snake-arena-2w0m.onrender.com/)** | **[📖 Documentation](#features)** | **[🚀 Deployment](#deployment)**

---

## ✨ Features

### 🎯 Dual Game Modes
- **Walls Mode** 🧱 - Classic gameplay where hitting the wall ends the game
- **Pass-Through Mode** 🌀 - Modern twist where the snake wraps around screen edges

### 👤 User System
- **Authentication** - Secure signup and login with JWT tokens
- **User Profiles** - Track your personal stats and progress
- **Session Management** - Persistent login across sessions

### 🏆 Global Leaderboard
- **Real-time Rankings** - See top players across both game modes
- **Score Submission** - Automatic score tracking after each game
- **Filter by Mode** - View leaderboards for each game mode separately
- **Persistent Storage** - Scores saved in PostgreSQL database

### 👀 Spectate Mode
- **Live Games** - Watch other players compete in real-time
- **Active Games List** - Browse all currently ongoing matches
- **Score Tracking** - See live scores as games progress

### 🎮 Smooth Gameplay
- **Keyboard Controls** - Arrow keys or WASD for movement
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Visual Feedback** - Modern UI with smooth animations
- **Pause & Resume** - Full game control with play/pause functionality

---

## 🛠️ Tech Stack

### **Frontend**
- **[React 18](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[TanStack Query](https://tanstack.com/query/latest)** - Powerful data fetching
- **[Vitest](https://vitest.dev/)** - Unit testing framework

### **Backend**
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance Python web framework
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - SQL toolkit and ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Pydantic](https://docs.pydantic.dev/)** - Data validation using Python type hints
- **[JWT](https://jwt.io/)** - Secure authentication with JSON Web Tokens
- **[Pytest](https://pytest.org/)** - Comprehensive testing framework
- **[uv](https://github.com/astral-sh/uv)** - Ultra-fast Python package manager

### **DevOps & Deployment**
- **[Docker](https://www.docker.com/)** - Containerization for consistent environments
- **[Render](https://render.com/)** - Cloud platform for deployment
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline automation
- **Multi-stage builds** - Optimized Docker images

---

## 🚀 Live Demo

**Try the game now:** [https://snake-arena-2w0m.onrender.com/](https://snake-arena-2w0m.onrender.com/)

1. **Sign up** for a new account or log in
2. **Choose your mode** - Walls or Pass-Through
3. **Play the game** - Use arrow keys or WASD to control your snake
4. **Submit your score** - Compete for the top spot on the leaderboard
5. **Spectate** - Watch other players' live games

> **Note:** First load may take 30-60 seconds as the free-tier Render service spins up.

---

## 🏃 Getting Started

### Prerequisites
- **Python 3.12+**
- **Node.js 20+**
- **PostgreSQL** (or use Docker)
- **uv** package manager (optional, but recommended)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/wanyingng/snake-arena.git
cd snake-arena
```

#### 2. Backend Setup
```bash
cd backend

# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Set environment variables
cp ../.env.example .env
# Edit .env with your database credentials

# Run migrations (tables created automatically on startup)
# Start the backend server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

#### 4. Using Docker (Alternative)
```bash
# Run both frontend and backend with PostgreSQL
docker-compose up --build
```

Access the app at `http://localhost:8000`

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend

# Run unit tests
uv run pytest

# Run integration tests
uv run pytest tests_integration/

# Run with coverage
uv run pytest --cov=app
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 📁 Project Structure

```
snake-arena/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database connection & queries
│   │   ├── db_models.py    # SQLAlchemy models
│   │   ├── models.py       # Pydantic models
│   │   ├── auth.py         # Authentication logic
│   │   └── routers/        # API route handlers
│   ├── tests/              # Unit tests
│   ├── tests_integration/  # Integration tests
│   └── Dockerfile          # Backend Docker configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Game logic & utilities
│   └── Dockerfile          # Frontend Docker configuration (Nginx)
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions CI/CD
├── docker-compose.yml      # Local development setup
├── render.yaml             # Render deployment configuration
└── openapi.yaml            # API specification
```

---

## 📜 API Documentation

The API follows OpenAPI 3.0 specification. When running locally, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/leaderboard` - Get leaderboard (with optional filters)
- `POST /api/leaderboard` - Submit score
- `GET /api/games/active` - Get active games for spectating

---

## 🚢 Deployment

This project is configured for deployment on [Render](https://render.com/) with automatic CI/CD via GitHub Actions.

### Deploy to Render

1. **Fork this repository**

2. **Create a Render account** at [render.com](https://render.com)

3. **Connect your GitHub repository**

4. **Deploy using Blueprint**:
   - Go to Render Dashboard
   - New → Blueprint
   - Connect this repository
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL database
     - Web service (Docker deployment)

5. **Set environment variables** (automatically configured via `render.yaml`):
   - `DATABASE_URL` - Auto-generated from database
   - `SECRET_KEY` - Auto-generated
   - `DEBUG` - Set to `false`

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:
1. ✅ Runs backend tests (pytest)
2. ✅ Runs frontend tests (vitest)
3. ✅ Runs integration tests
4. 🚀 Triggers Render deployment on successful tests (main branch only)

---

## 🎮 How to Play

1. **Move**: Use **Arrow Keys** or **WASD** to control the snake
2. **Goal**: Eat the food (🟠) to grow longer and increase your score
3. **Avoid**: Don't hit your own tail!
4. **Modes**:
   - **Walls Mode**: Avoid hitting the walls
   - **Pass-Through Mode**: The snake wraps around when hitting edges
5. **Compete**: Your score is automatically submitted to the leaderboard when logged in

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---

**Enjoy playing Snake Arena! 🐍🎮**

Vibe coded with ❤️ by Quinn Ng using Lovable and Google Antigravity
