# TestMancer 🧠

TestMancer is a gamified educational platform designed to help students excel in their academic pursuits. Whether you're preparing for WAEC, JAMB, TOEFL, IELTS, or pursuing undergraduate studies, TestMancer provides an engaging learning experience with interactive courses and quizzes.

## 🚀 Features

### 🎯 Core Functionality
- **Interactive Courses**: Comprehensive course modules for various educational levels
- **Gamified Quizzes**: Test your knowledge with engaging quiz questions
- **Progress Tracking**: Monitor your learning journey and achievements
- **Multiple Learning Paths**: Support for WAEC, Post-UTME, JAMB, TOEFL, IELTS, and undergraduate courses

### 🏆 Gamification System
- **Gem Rewards**: Earn 1 gem for each correct quiz answer
- **Module Completion**: Get 3 gems when you complete a course module
- **Leaderboard**: Compete with other learners and climb the rankings
- **Achievement System**: Unlock badges and milestones as you progress

### 👥 User Experience
- **Google Authentication**: Seamless sign-in with Google account
- **Onboarding Process**: Choose your learning goals (multiple selections allowed)
- **Dynamic Dashboard**: Content adapts based on your selected learning paths
- **Responsive Design**: Optimized for all devices

### 🛠️ Technology Stack
- **Frontend**: React + Vite + JSX
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Styling**: Tailwind CSS (component-level)

## 📋 Prerequisites

Before running this application, make sure you have:
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Google Cloud Console account for OAuth setup

## 🏗️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd testmancer
```

### 2. Environment Configuration
Copy the environment template and fill in your credentials:
```bash
cp .env.template .env
```

Fill in the following variables in your `.env` file:
- `MONGODB_URI`: Your MongoDB connection string
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `JWT_SECRET`: A secure random string for JWT tokens
- `NODE_ENV`: Set to 'development' or 'production'

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
testmancer/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React contexts for state management
│   │   └── utils/         # Utility functions and helpers
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Business logic controllers
│   │   ├── middleware/    # Custom middleware
│   │   └── config/        # Database and other configurations
│   ├── package.json
│   └── server.js
├── .env.template          # Environment variables template
└── README.md
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data

## 🎓 Learning Paths Supported

- **WAEC Preparation**: Nigerian secondary school certificate exams
- **Post-UTME**: University admission screening tests
- **JAMB**: Nigerian university entrance examination
- **TOEFL**: Test of English as a Foreign Language
- **IELTS**: International English Language Testing System
- **Undergraduate Courses**: Degree program support

## 🏅 Gamification Features

### Gem System
- **Quiz Rewards**: 1 gem per correct answer
- **Module Completion**: 3 gems per completed module
- **Bonus Gems**: Special rewards for streaks and achievements

### Leaderboard
- **Global Rankings**: Compete with all users
- **Category Rankings**: Rankings within your learning paths
- **Weekly/Monthly Challenges**: Time-limited competitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@testmancer.com or join our Discord community.

---

**Happy Learning with TestMancer! 🎓✨**
