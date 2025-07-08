# EduTube - Distraction-Free Educational Platform

EduTube is a React Native application designed to provide a focused learning environment by transforming YouTube into a distraction-free educational platform. Built with TypeScript and Expo, the app eliminates YouTube's distracting elements while adding intelligent engagement features to keep students focused on educational content.

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- Node.js (version 18 or higher)
- npm or yarn package manager
- Git for version control
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

### Step 1: Install Global Dependencies

First, install the required global packages:

```bash
npm install -g @expo/cli
npm install -g eas-cli
npm install -g typescript
```

### Step 2: Clone and Setup Project

```bash
git clone <repository-url>
cd COCOCODES
npm install
```

### Step 3: Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values.

## Current Implementation

The project currently includes a complete development environment setup with the following components:

### Core Dependencies
- React Native with Expo SDK v50.0.20
- TypeScript for type safety
- Redux Toolkit for state management
- React Navigation 6 for navigation
- Firebase for backend services
- Expo AV for media handling

### Project Architecture

The application follows a modular architecture with clear separation of concerns:
```
src/
├── components/          # Reusable UI components
│   ├── video/          # YouTube player and controls
│   ├── ai/             # AI-generated content components
│   ├── library/        # Public Library components
│   └── common/         # Shared UI elements
├── screens/             # Application screens
│   ├── home/           # Home dashboard
│   ├── library/        # Public Library screens
│   ├── player/         # Video player interface
│   └── profile/        # User profiles and contributions
├── navigation/          # Navigation configurations
├── store/               # Redux store and slices
│   ├── video/          # Video state management
│   ├── library/        # Public Library state
│   ├── user/           # User data and preferences
│   └── quiz/           # Quiz system state
├── styles/              # Theming and design system
├── types/               # TypeScript type definitions
├── services/            # External service integrations
│   ├── youtube/        # YouTube metadata and transcript extraction
│   ├── ai/             # AI content generation services
│   └── library/        # Public Library API services
└── utils/               # Helper functions and utilities
```

### Configuration Files

The project includes several important configuration files:

- **ESLint Configuration** (.eslintrc.js) - Code linting rules
- **Prettier Configuration** (.prettierrc) - Code formatting rules
- **TypeScript Configuration** (tsconfig.json) - TypeScript compiler options with path mappings
- **Environment Variables** (.env.example) - Template for environment configuration
- **Theme Configuration** (src/styles/theme.ts) - Application theme and styling
- **Type Definitions** (src/types/index.ts) - TypeScript type definitions
- **Redux Store** (src/store/index.ts) - State management configuration

## Development Server

### Starting the Development Server

To start the development server, run:

```bash
npm start
```

This will start the Metro bundler and provide you with several options:

- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Scan the QR code with Expo Go app on your mobile device

### Available Scripts

```bash
npm start          # Start development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator (macOS only)
npm run web        # Run in web browser
npm run lint       # Run ESLint code analysis
npm run format     # Format code with Prettier
npm test           # Run test suite
```

## Testing the Application

### Web Browser Testing
The application supports web testing through Expo's web support. After starting the development server, navigate to `http://localhost:8081` in your browser.

### Mobile Device Testing
1. Install the Expo Go app from the App Store or Google Play Store
2. Start the development server with `npm start`
3. Scan the QR code displayed in the terminal with your mobile device
4. The application will load directly on your device

### Emulator Testing
For Android development, ensure you have Android Studio installed with at least one AVD (Android Virtual Device) configured. For iOS development on macOS, make sure Xcode is installed with the iOS Simulator.

## Current Features

The current implementation includes:

- Complete project structure and configuration
- Redux store setup with multiple slices for state management
- Theme system with glassmorphism design elements
- TypeScript configuration with proper type definitions
- Navigation structure using React Navigation 6
- Development environment ready for YouTube integration
- Firebase backend configuration
- Responsive design system for multiple screen sizes

## Development Environment Status

The development environment is fully configured and operational. All dependencies are installed, the development server starts successfully, and the application is ready for feature development. The project structure follows React Native best practices with TypeScript support throughout.

The application is currently in the initial development phase with all necessary tooling and architecture in place to begin implementing the core educational features.
