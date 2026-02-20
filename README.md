# Sports Updates

A sports scores, news, and schedule project consisting of:

- **Sports Hub** (`sports-hub/`) – React web application
- **Mobile App** (`mobile/`) – React Native mobile application
- **Shared** (`shared/`) – Theme, API layer, and utilities shared across both platforms

## Project Structure

```
Sports-Updates/
├── shared/
│   ├── theme.js      # Colours, spacing, typography, sport categories
│   ├── api.js        # Fetch functions + mock data
│   └── utils.js      # Date formatting, game clock, helpers
├── sports-hub/       # React web app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   ├── NewsCard.jsx
│   │   │   ├── SportCategoryBar.jsx
│   │   │   └── SectionHeading.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ScoresPage.jsx
│   │   │   ├── NewsPage.jsx
│   │   │   └── SchedulePage.jsx
│   │   └── App.jsx
│   └── package.json
└── mobile/           # React Native app
    ├── src/
    │   ├── components/
    │   │   ├── ScoreCard.jsx       ← aligned to web ScoreCard
    │   │   ├── NewsCard.jsx        ← aligned to web NewsCard
    │   │   ├── SportCategoryBar.jsx
    │   │   └── SectionHeading.jsx
    │   ├── screens/
    │   │   ├── HomeScreen.jsx      ← aligned to web HomePage
    │   │   ├── ScoresScreen.jsx    ← aligned to web ScoresPage
    │   │   ├── NewsScreen.jsx      ← aligned to web NewsPage
    │   │   └── ScheduleScreen.jsx  ← aligned to web SchedulePage
    │   ├── navigation/
    │   │   └── AppNavigator.jsx
    │   └── App.jsx
    └── package.json
```

## Alignment between Sports Hub and Mobile App

| Aspect | Sports Hub (web) | Mobile App |
|---|---|---|
| Colours & spacing | `shared/theme.js` | `shared/theme.js` |
| API calls | `shared/api.js` | `shared/api.js` |
| Utility functions | `shared/utils.js` | `shared/utils.js` |
| Component names | `ScoreCard`, `NewsCard`, `SportCategoryBar`, `SectionHeading` | Same names, RN primitives |
| Screens/pages | `HomePage`, `ScoresPage`, `NewsPage`, `SchedulePage` | `HomeScreen`, `ScoresScreen`, `NewsScreen`, `ScheduleScreen` |
| Navigation | React Router (`/`, `/scores`, `/news`, `/schedule`) | Bottom tab navigator (same 4 tabs) |
| Sport filtering | `SportCategoryBar` pills | Same component, horizontal `ScrollView` |
| Live indicator | Green `● LIVE` badge | Same badge, same colour |

## Getting Started

### Sports Hub (web)

```bash
cd sports-hub
npm install
npm run dev      # http://localhost:3000
```

### Mobile App

```bash
cd mobile
npm install
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```
