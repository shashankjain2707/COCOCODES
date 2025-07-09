# EduTube - Educational Platform

EduTube is a cross-platform educational video app built with React Native, Expo, and Firebase. It provides a distraction-free environment for learning, featuring authentication, playlists, notes, and a modern, responsive design. The app is designed to help users engage with educational content efficiently on mobile and web.

## Current Implementation

### Authentication System

- **Firebase Authentication** - Email/password sign up and sign in
- **Firestore Integration** - User data storage and management
- **AuthScreen** - Login/SignUp page with glassmorphism design
- **Protected Routes** - Conditional navigation based on auth state
- **Sign Out Functionality** - Available in Header profile dropdown

### HomeScreen Components

1. **Header** - Search bar, logo, notifications, and profile sections with sign out
2. **WelcomeSection** - Personalized greeting with study progress tracking
3. **QuickActions** - Quick access buttons for common actions
4. **SmartRecommendations** - Content suggestions with thumbnail previews
5. **SubjectCategories** - Subject selection grid
6. **PublicLibrarySection** - Community content and playlists
7. **RecentActivity** - Recent learning history
8. **BottomNavigation** - Five-tab navigation with quick action menus

### Technical Features

- **Firebase Authentication** - Complete email/password auth flow
- **Firestore Database** - User data persistence and management  
- **Protected Navigation** - Auth-based route protection
- **Glassmorphism Design** - Consistent across auth and home screens
- **Redux State Management** - Auth state with TypeScript
- **Form Validation** - Input validation and error handling
- Diagonal gradient background with blue color scheme
- Custom navigation system replacing React Navigation bottom tabs
- Responsive design for multiple screen sizes
- Self-contained components with mock data

### Design System

- Color palette focused on blue, navy, and slate variants
- Consistent spacing using 16px grid system
- Glass card components with backdrop blur effects
- Professional typography hierarchy
- Interactive hover and focus states

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Copy your Firebase config to the `.env` file:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## Installation

Install dependencies:

```bash
npm install -g @expo/cli
git clone <repository-url>
cd COCOCODES
npm install
npm start
```

## Development

```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
```

## Project Structure

```
src/
├── components/     # UI components
├── screens/        # App screens
├── navigation/     # Navigation setup
├── store/          # Redux state management
├── styles/         # Theme and styling
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## Navigation Structure

The app uses a custom navigation system with:
- HomeScreen as the main entry point
- Custom BottomNavigation component with five tabs
- Stack navigation for screen transitions
- TypeScript integration for route parameters

## State Management

Redux store with slices for:
- **Authentication** - User auth state and Firebase integration
- User data and preferences
- Home screen content
- Navigation state
- Theme configuration

## Authentication Flow

1. **Initial Load** - App checks Firebase auth state
2. **Unauthenticated** - Shows AuthScreen with login/signup forms
3. **Sign Up** - Creates Firebase user and Firestore user document
4. **Sign In** - Authenticates user and loads user data from Firestore
5. **Authenticated** - Shows HomeScreen with full app functionality
6. **Sign Out** - Available from Header profile dropdown

All components use mock data and are ready for backend integration.

## Recently Implemented:
Video Player Implementation done
