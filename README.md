# EduTube - Educational Platform

EduTube is a React Native application that provides a focused learning environment for educational content. Built with TypeScript and Expo, the app features a modern interface designed to minimize distractions while maximizing learning engagement.

## Current Implementation

### HomeScreen Components

1. **Header** - Search bar, logo, notifications, and profile sections
2. **WelcomeSection** - Personalized greeting with study progress tracking
3. **QuickActions** - Quick access buttons for common actions
4. **SmartRecommendations** - Content suggestions with thumbnail previews
5. **SubjectCategories** - Subject selection grid
6. **PublicLibrarySection** - Community content and playlists
7. **RecentActivity** - Recent learning history
8. **BottomNavigation** - Five-tab navigation with quick action menus

### Technical Features

- Glassmorphism design system with semi-transparent elements
- Diagonal gradient background with blue color scheme
- Custom navigation system replacing React Navigation bottom tabs
- Redux state management with TypeScript
- Responsive design for multiple screen sizes
- Self-contained components with mock data

### Design System

- Color palette focused on blue, navy, and slate variants
- Consistent spacing using 16px grid system
- Glass card components with backdrop blur effects
- Professional typography hierarchy
- Interactive hover and focus states

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
- User data and preferences
- Home screen content
- Navigation state
- Theme configuration

All components use mock data and are ready for backend integration.
