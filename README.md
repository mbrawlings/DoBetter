# DoBetter

A comprehensive full-stack application built with React Native (Expo) frontend and Node.js backend.

## 🚀 Project Structure

```
/
├── DoBetter/
│   ├── frontend/          # React Native/Expo application
│   ├── backend/           # Node.js backend API
│   └── .git/             # Git repository
├── package.json           # Root package.json for monorepo management
├── package-lock.json      # Root package-lock.json
└── README.md             # This file
```

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 9.0.0)
- Expo CLI (for frontend development)
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies for all workspaces**
   ```bash
   npm run install:all
   ```

   Or install individually:
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd DoBetter/frontend
   npm install
   
   # Backend dependencies (when backend is set up)
   cd ../backend
   npm install
   ```

## 🏃‍♂️ Development

### Start Development Servers

**Start both frontend and backend simultaneously:**
```bash
npm run dev
```

**Start individually:**
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Frontend Development

The frontend is built with React Native using Expo:

```bash
cd DoBetter/frontend
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Backend Development

The backend is a Node.js application (to be implemented):

```bash
cd DoBetter/backend
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 📦 Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build both frontend and backend for production |
| `npm run test` | Run tests for both frontend and backend |
| `npm run lint` | Run linting for both frontend and backend |
| `npm run clean` | Clean node_modules from both workspaces |
| `npm run install:all` | Install dependencies for all workspaces |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start Expo development server |
| `npm run build:frontend` | Build frontend for production |
| `npm run test:frontend` | Run frontend tests |
| `npm run lint:frontend` | Run frontend linting |

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm run dev:backend` | Start backend development server |
| `npm run build:backend` | Build backend for production |
| `npm run test:backend` | Run backend tests |
| `npm run lint:backend` | Run backend linting |

## 🏗️ Project Architecture

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Language**: TypeScript

### Backend
- **Framework**: Node.js (to be implemented)
- **Language**: JavaScript/TypeScript (to be determined)

## 🔧 Configuration

### Environment Variables

Create environment files as needed:

```bash
# Frontend
cp DoBetter/frontend/.env.example DoBetter/frontend/.env

# Backend
cp DoBetter/backend/.env.example DoBetter/backend/.env
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

## 📝 Code Quality

```bash
# Run linting for all workspaces
npm run lint

# Run linting for specific workspace
npm run lint:frontend
npm run lint:backend
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed using Expo's build services:

```bash
cd DoBetter/frontend
expo build:android  # Build for Android
expo build:ios      # Build for iOS
expo build:web      # Build for web
```

### Backend Deployment
Backend deployment instructions will be added once the backend is implemented.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy coding! 🎉** 