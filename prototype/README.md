# Fantasy Football Analyzer - Frontend

A comprehensive React-based dashboard for analyzing fantasy football decision-making and performance.

## Features

- **Real-time ESPN Integration**: Connect directly to your ESPN fantasy league
- **Decision Analysis**: Detailed process scores for lineup decisions
- **League Rankings**: Compare decision-making across all league members
- **Performance Tracking**: Weekly and season-long analytics
- **Interactive Visualizations**: Charts and graphs for season trends

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Vite** for development and building
- **Lucide React** for icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Configuration

Make sure the backend ESPN service is running on port 8000 for full functionality.

## Performance Features

- In-memory caching for league analysis
- Progressive loading indicators
- Optimized ESPN API usage

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API integration
└── lib/               # Utilities and helpers
```

Built with ❤️ for fantasy football managers who want to improve their decision-making process.