# DeshKiAwaaz - Voice of the Nation

A civic engagement platform built with Angular and Firebase, enabling citizens to voice their concerns, vote on issues, and see leaderboards of popular topics in their region.

## Features

- 📱 Phone-based authentication
- 📝 Create and share posts about local issues
- 👍👎 Upvote/downvote community posts
- 🏆 Regional leaderboards
- 🤖 AI-powered task generation with Gemini API
- 🔒 Secure Firestore rules

## Tech Stack

- **Frontend**: Angular 18, Angular Material, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini API
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/deshkiawaaz.git
   cd deshkiawaaz
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment:
   ```bash
   cp src/environments/environment.local.ts src/environments/environment.ts
   # Edit environment.ts with your Firebase and Gemini API credentials
   ```

4. Start development server:
   ```bash
   pnpm start
   ```

5. Open http://localhost:4200

## Environment Variables

For production deployment, set these secrets in GitHub:

| Secret | Description |
|--------|-------------|
| `FIREBASE_API_KEY` | Firebase Web API Key |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `FIREBASE_APP_ID` | Firebase App ID |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID (optional) |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Service Account JSON (for deployment) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run unit tests |
| `pnpm deploy` | Deploy to Firebase Hosting |
| `pnpm deploy:rules` | Deploy Firestore rules |
| `pnpm deploy:all` | Deploy everything |

## Project Structure

```
src/
├── app/
│   ├── models/          # TypeScript interfaces
│   ├── services/        # Angular services
│   ├── app.component.*  # Main app component
│   └── ...
├── environments/        # Environment configs
└── assets/              # Static assets
```

## Deployment

### Automatic (CI/CD)

Push to `main` branch triggers automatic deployment via GitHub Actions.

### Manual

```bash
# Build
pnpm build:prod

# Deploy
firebase deploy
```

## Security

- All API keys are injected at build time via CI/CD
- Firestore rules enforce authentication and ownership
- Phone authentication via Firebase Auth
- Security headers configured in firebase.json

## License

Apache 2.0 - See LICENSE file
