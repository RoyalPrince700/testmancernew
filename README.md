# TestMancer 🧠

TestMancer is a comprehensive gamified educational platform designed to help students excel in their academic pursuits. Whether you're preparing for WAEC, JAMB, TOEFL, IELTS, or pursuing undergraduate studies, TestMancer provides an engaging learning experience with interactive courses, role-based content management, and advanced audience targeting.

## 🚀 Features

### 🎯 Core Learning Platform
- **Structured Courses**: Hierarchical course organization with chapters, modules, sections, or topics
- **Page-Based Content**: Fine-grained content delivery with rich text, audio, video, and attachments
- **Context-Aware Quizzes**: Quizzes triggered at unit completion or specific page locations
- **Smart Progress Tracking**: Detailed progress monitoring through units and pages with resume functionality
- **Multiple Learning Paths**: Support for WAEC, Post-UTME, JAMB, TOEFL, IELTS, and undergraduate courses
- **Audience Targeting**: Courses filtered by university, faculty, and level for personalized learning

### 🏆 Advanced Gamification System
- **Smart Gem Rewards**: Earn 1 gem per correct answer (first attempt only) + 3 gems for course completion
- **Segmented Leaderboards**: Compete within your university, faculty, or level
- **Achievement System**: Unlock badges and milestones as you progress
- **Games Integration**: Earn additional gems through course-tied mini-games

### 👥 User Management & Experience
- **Google Authentication**: Seamless sign-in with Google OAuth 2.0
- **Comprehensive Onboarding**: Multi-step process including undergraduate pathway selection (university/faculty/level)
- **Dynamic Dashboard**: Content adapts based on selected learning paths and audience profile
- **Category Switching**: Easy switching between Post-UTME, JAMB, WAEC, and Undergraduate pathways
- **Responsive Design**: Optimized for all devices with accessibility improvements

### 🛡️ Advanced Admin System
- **Role-Based Access Control**: Full admin, subadmin (faculty-restricted), and category-specific admins (WAEC/JAMB)
- **Content Authoring**: Create and manage courses, modules, pages with rich media support
- **Media Management**: Upload and manage audio/video content via Cloudinary integration
- **Audience Management**: Assign content to specific universities, faculties, and levels
- **Scoped Permissions**: Subadmins can only manage content within their assigned scope
- **User Role Management**: Full admins can assign and modify user roles

### 🎮 Content Features
- **Rich Media Support**: Audio and video content embedded in course pages
- **Page-Based Learning**: Fine-grained content delivery with navigation controls
- **Quiz Integration**: Context-aware quizzes at page-level or course completion
- **Progress Persistence**: Resume learning exactly where you left off
- **Personalized Recommendations**: Courses filtered by your academic profile

### 🛠️ Technology Stack
- **Frontend**: React + Vite + JSX + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **Authentication**: Google OAuth 2.0 with JWT
- **Media Hosting**: Cloudinary for audio/video uploads
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi for comprehensive input validation
- **File Upload**: Multer for multipart form handling

## 📋 Prerequisites

Before running this application, make sure you have:
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Google Cloud Console account for OAuth setup
- Cloudinary account for media hosting (optional, for media uploads)

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
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (for media uploads)
- `CLOUDINARY_API_KEY`: Your Cloudinary API key (for media uploads)
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret (for media uploads)
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)
- `BACKEND_URL`: Your backend URL (default: http://localhost:5000)

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
│   │   ├── components/           # Reusable UI components
│   │   │   ├── admin/           # Admin dashboard components
│   │   │   │   ├── AdminPlaceholders.jsx
│   │   │   │   ├── CoursesManagement.jsx
│   │   │   │   ├── DashboardOverview.jsx
│   │   │   │   ├── UsersManagement.jsx
│   │   │   │   └── index.js
│   │   │   ├── onboarding/      # Multi-step onboarding components
│   │   │   └── ...
│   │   ├── pages/               # Main application pages
│   │   │   ├── jamb/           # JAMB-specific pages
│   │   │   ├── postutme/       # Post-UTME pages by subject
│   │   │   ├── waec/           # WAEC pages
│   │   │   └── ...
│   │   ├── contexts/           # React contexts for state management
│   │   ├── utils/              # Utility functions and API clients
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── vite.config.js
├── backend/
│   ├── config/                  # Database and service configurations
│   │   ├── cloudinary.js       # Cloudinary configuration
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Business logic controllers
│   ├── middleware/             # Custom middleware (auth, admin, etc.)
│   ├── models/                 # MongoDB schemas
│   │   ├── Course.js          # Course and module schemas
│   │   ├── Quiz.js            # Quiz schema
│   │   ├── User.js            # User schema with roles
│   │   └── ...
│   ├── routes/                 # API route handlers
│   │   ├── admin/             # Admin-only routes (scoped by role)
│   │   ├── auth.js            # Authentication routes
│   │   ├── courses.js         # Course management
│   │   ├── quizzes.js         # Quiz management
│   │   └── ...
│   ├── scripts/                # Migration and seeding scripts
│   ├── package.json
│   └── server.js
├── todo.md                      # Development roadmap and milestones
├── todoUpdate.md               # Current task tracking
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
- `npm run seed` - Seed database with sample data (users, courses, institutions)
- `npm run migrate:m0` - Run baseline migration (normalize categories, add roles)
- `npm run migrate:m2` - Run course structure migration (add pages, audience fields)
- `npm run migrate:m3` - Run role management migration (add granular permissions)

## 👥 User Roles & Permissions

### Role Types
- **User**: Standard learner with access to courses and quizzes
- **Admin**: Full system access - can manage all content, users, and system settings
- **Subadmin**: Restricted admin access limited to assigned universities/faculties/levels
- **WAEC Admin**: Can only manage WAEC-related content and users
- **JAMB Admin**: Can only manage JAMB-related content and users

### Permission Scopes
- **Full Admin**: Complete access to all features and content
- **Scoped Access**: Subadmins can only view/modify content for their assigned institutions
- **Category Access**: WAEC/JAMB admins limited to their specific exam categories

## 🎓 Learning Paths & Audience Targeting

### Supported Learning Categories
- **WAEC**: Nigerian secondary school certificate exams
- **Post-UTME**: University admission screening tests
- **JAMB**: Nigerian university entrance examination
- **TOEFL**: Test of English as a Foreign Language
- **IELTS**: International English Language Testing System
- **Undergraduate**: Degree program support with audience filtering

### Undergraduate Pathway Features
- **Institution Selection**: Choose from supported universities
- **Faculty Selection**: Select your academic faculty/department
- **Level Selection**: Specify your current academic level (100-600L)
- **Personalized Content**: Courses filtered by your academic profile
- **Scoped Leaderboards**: Compete within your university, faculty, or level

## 🏅 Advanced Gamification System

### Smart Gem Rewards
- **Quiz Rewards**: 1 gem per correct answer (first attempt only)
- **Course Completion**: 3 gems awarded once per full course completion
- **Game Bonuses**: Additional gems from course-tied mini-games
- **Anti-Abuse Protection**: Prevents duplicate rewards and gaming the system

### Segmented Leaderboards
- **University Rankings**: Compete with students from your institution
- **Faculty Rankings**: Rankings within your academic department
- **Level Rankings**: Compete with peers at the same academic level
- **Global Rankings**: Overall platform leaderboards
- **Category Rankings**: Rankings within your learning paths

### Progress Tracking
- **Page-Level Progress**: Track completion of individual course pages
- **Module Progress**: Monitor advancement through course modules
- **Course Completion**: Full course completion detection and rewards
- **Resume Functionality**: Continue learning exactly where you left off
- **Achievement Badges**: Unlock milestones and special recognitions

## 🛡️ Admin Features & Content Management

### Admin Dashboard
- **Role-Based UI**: Interface adapts based on admin permissions and scope
- **Content Authoring**: Create and edit courses, modules, and pages with rich text
- **Media Upload**: Drag-and-drop audio/video upload with Cloudinary integration
- **Audience Targeting**: Assign content to specific universities, faculties, and levels
- **Quiz Management**: Create quizzes with configurable triggers (per-page/end-of-course)
- **User Management**: Assign roles and manage user permissions (full admin only)

### Content Structure
- **Courses**: Top-level learning containers with metadata, audience targeting, and structure configuration
- **Units**: Flexible organizational units (chapters, modules, sections, or topics) with estimated completion times
- **Pages**: Fine-grained content units with rich HTML text, media attachments, and navigation order
- **Quizzes**: Assessment tools triggered at unit completion or specific page locations (first-attempt gem rewards)
- **Structure Metadata**: Configurable unit types, labels, and counts for course organization
- **Media Assets**: Audio/video files hosted on Cloudinary with secure URLs

### API Endpoints (Admin)
```
POST   /api/admin/uploads/audio     # Upload audio files (mp3/m4a/wav)
POST   /api/admin/uploads/video     # Upload video files (mp4)
POST   /api/admin/courses           # Create new course with structure metadata
PUT    /api/admin/courses/:id       # Update course structure and metadata
DELETE /api/admin/courses/:id       # Delete course
POST   /api/admin/courses/:id/units # Add unit (chapter/module/section/topic) to course
POST   /api/admin/courses/:id/units/:unitId/pages # Add page to unit
POST   /api/admin/quizzes           # Create quiz (unit or page triggered)
PUT    /api/admin/users/:id/role    # Change user role (admin only)
```

## 🚀 Development Roadmap

This project follows a structured milestone approach. See `todo.md` for the complete development plan.

### Completed Milestones
- ✅ **M0**: Baseline cleanup and guardrails (categories normalization, role system)
- ✅ **M1**: Undergraduate onboarding fields and selection
- ✅ **M2**: Course audience targeting and page-based structure
- ✅ **M3**: Media uploads via Cloudinary
- ✅ **M4**: Admin course/page authoring APIs
- ✅ **M5**: Quiz authoring and delivery
- ✅ **M6**: Rewards logic and gem system (first-attempt logic)
- ✅ **M7**: Personalized course listings
- ✅ **M8**: Segmented leaderboards
- ✅ **M9**: Admin dashboard frontend
- ✅ **M10**: Enhanced learner dashboard
- ✅ **M11**: Structured courses (chapters/modules/sections/topics)
- ✅ **M12**: Comprehensive testing suite
- ✅ **M2.5**: Advanced role management and permissions

### Upcoming Milestones
- 🔄 **M13**: Deployment and quality hardening

## 🔒 Security & Permissions

### Authentication
- **Google OAuth 2.0**: Secure third-party authentication
- **JWT Tokens**: Stateless session management
- **Role-Based Access**: Middleware validates permissions on protected routes

### Authorization
- **Scoped Access**: Subadmins limited to assigned institutions
- **Category Restrictions**: WAEC/JAMB admins confined to their domains
- **Audit Logging**: Admin actions logged for security monitoring
- **Rate Limiting**: Protection against API abuse

### Data Protection
- **Input Validation**: Joi schemas for all API inputs
- **File Upload Security**: Type and size validation for media uploads
- **Secure URLs**: Cloudinary provides HTTPS media delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Quick Start Commands

```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

Access the application at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🧪 Testing & Development

### Database Seeding
```bash
cd backend
npm run seed  # Populate with sample users, courses, and institutions
```

### Migrations
```bash
npm run migrate:m0  # Baseline (roles, categories)
npm run migrate:m2  # Course structure (pages, audience)
npm run migrate:m3  # Advanced permissions
```

### Testing
- Unit tests for business logic and utilities
- Integration tests for API endpoints
- End-to-end tests for complete user journeys
- Role-based permission validation tests

## 📊 API Documentation

### Public Endpoints
```
GET    /api/courses                 # List available courses with structure metadata
GET    /api/courses/:id             # Get course details with units and pages
GET    /api/courses/:id/units       # Get units for a course (alias for modules)
GET    /api/courses/:id/units/:unitId/pages # Get pages for a unit
GET    /api/courses/personalized    # Get courses for user profile with progress
GET    /api/quizzes/:id             # Get quiz details (unit or page triggered)
GET    /api/quizzes/unit/:unitId    # Get unit-triggered quiz
GET    /api/quizzes/page/:courseId/:unitId/:pageOrder # Get page-triggered quiz
POST   /api/quizzes/:id/submit      # Submit quiz answers (first-attempt gem logic)
GET    /api/leaderboard/university  # University rankings
GET    /api/leaderboard/faculty     # Faculty rankings
GET    /api/leaderboard/level       # Level rankings
```

### Authentication Endpoints
```
GET    /auth/google                 # Initiate Google OAuth
GET    /auth/google/callback        # OAuth callback
GET    /api/users/me                # Get current user profile
PUT    /api/users/me                # Update user profile
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Community

- **Documentation**: See `todo.md` for detailed development roadmap
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for help and feedback
- **Email**: support@testmancer.com

## 🚀 Project Status

**TestMancer** is actively under development following a structured milestone approach. The platform currently supports basic course consumption with Google authentication and is being enhanced with advanced admin features, role-based permissions, and audience targeting.

### Current Capabilities
- ✅ User authentication and profile management
- ✅ Structured courses with hierarchical organization (chapters/modules/sections/topics)
- ✅ Page-based content delivery with rich media support
- ✅ Context-aware quizzes (unit and page triggered) with first-attempt gem rewards
- ✅ Category-based learning paths and audience targeting
- ✅ Role-based access control system with scoped permissions
- ✅ Admin content authoring with media upload capabilities
- ✅ Segmented leaderboards and progress tracking
- ✅ Comprehensive testing suite

### In Development
- 🔄 Mini-games integration
- 🔄 Advanced deployment and quality hardening

---

**Happy Learning with TestMancer! 🎓✨**

*Built with ❤️ for students, by developers who understand the importance of accessible education.*
