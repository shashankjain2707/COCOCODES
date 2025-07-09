# EduTube - Educational Platform

EduTube is a cross-platform educational video app built with React Native, Expo, and Firebase. It provides a distraction-free environment for learning, featuring authentication, playlists, notes, and a modern, responsive design. The app is designed to help users engage with educational content efficiently on mobile and web.

## PPT LINK:
[PPT LINK](https://docs.google.com/presentation/d/1ZOjoyC-0KS3sc1tOWfyo3gMyF4k3Rql-7EKn4pqu_Es/edit?usp=sharing)

## Features

### Authentication System
- Firebase Authentication with email/password sign up and sign in
- Protected routes and user data storage

### Python Backend Server
- Flask API for YouTube data, AI quizzes, and notes
- Endpoints for video/playlist metadata
- AI-powered quiz generation with Google Gemini
- AI-generated notes in multiple formats:
  - **Comprehensive Notes**: Detailed notes with all important concepts
  - **Summary**: Brief overview of main ideas
  - **Key Points**: List of essential facts and definitions
  - **Study Guide**: Learning resource with concepts and sample questions

### Video Features
- Distraction-free video player
- In-video AI-generated quizzes
- AI-generated notes from video transcripts
- Playlist organization and management

### HomeScreen Components
- Header with search and profile access
- Welcome section with study progress tracking
- Subject categories and recommendations
- Recent activity tracking
- Bottom navigation with quick action menus

### Technical Features
- Firebase Authentication for email/password auth flow
- Firestore Database for user data persistence and management  
- Protected Navigation for auth-based route protection
- Glassmorphism Design consistent across auth and home screens
- Redux State Management for auth state with TypeScript
- Form Validation for input validation and error handling
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

## YouTube API Setup

The application now uses a Python server to handle all YouTube API interactions. This provides better security and allows for additional processing of video metadata.

### Python Server Setup

1. Navigate to the `py-server` directory
2. Follow the setup instructions in the [py-server/README.md](py-server/README.md) file
3. Make sure to set up your YouTube API key in the `.env` file

### Client-Side Integration

The React Native app uses a simple approach for YouTube video playback:
- Videos are played using the YouTube iframe player on web
- Native platforms use WebView for video playback
- All metadata (titles, descriptions, thumbnails) is fetched via the Python server
- No YouTube API keys are needed in the client-side code

## Quiz Feature

The application includes an AI-powered quiz generator that creates multiple-choice questions based on video content:

1. **Transcript Analysis**: The Python server extracts video transcripts using the YouTube API
2. **AI-Generated Questions**: Google Gemini AI analyzes the transcript to generate relevant quiz questions
3. **Interactive Quizzes**: Users can take quizzes related to the video content
4. **Immediate Feedback**: Each question includes an explanation for the correct answer

To use this feature:
1. Set up the Google Gemini API key in the `.env` file
2. Make sure the Python server is running
3. The client app will communicate with the server to generate and display quizzes

1. Create a project in the [Google Developers Console](https://console.developers.google.com/)
2. Enable the YouTube Data API v3
3. Create API credentials (API Key)
4. Add the API key to your .env file:

```bash
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

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

### Video Player Implementation
- Distraction-free YouTube video player with clean UI
- Fetches video metadata (title, description) using YouTube Data API
- Graceful fallback to web scraping when API key is unavailable
- Supports both web (iframe) and mobile (WebView) platforms
- Video progress tracking and display
- Notes system for timestamped annotations
- Playlist support with navigation between videos

### YouTube Integration
- Uses YouTube Data API v3 for fetching video metadata
- Simple iframe/WebView embedding for video playback
- API key configuration in .env file
- Fallback mechanisms for when API requests fail

### AI Notes Feature
- AI-generated notes from video transcripts
- Comprehensive notes, summaries, key points, and study guides
- In-video AI-generated quizzes
