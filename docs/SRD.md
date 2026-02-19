# System Requirement Document (SRD) - FlipIt

## 1. Technological Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Storage**: LocalStorage (MVP version) to persist users and cards in the browser.
- **Hosting**: Local execution (or static host).

## 2. Data Model
### 2.1 User
```json
{
  "username": "string (unique)",
  "password": "string",
  "createdAt": "timestamp"
}
```

### 2.2 Card
```json
{
  "id": "uuid",
  "username": "string (owner)",
  "question": "string",
  "hint": "string",
  "answer": "string",
  "folder": "string (default: 'All Flash Cards')",
  "nextReviewTime": "timestamp",
  "interval": "string (last interval used)",
  "createdAt": "timestamp"
}
```

## 3. Component Architecture
### 3.1 Authentication Module
- Handles registration and login logic.
- reads/writes `users` array in LocalStorage.
- Manages current session state.
- **Critical**: On login, sets the "Active User" context. All subsequent data operations (Read/Write) must be filtered by this Active User.

### 3.2 Main Interface (Home)
- Dashboard layout.
- Computes progress stats from `cards` data for the *current logged-in user only*.

### 3.3 Card Manager
- Form interface for creating new objects in `cards` LocalStorage.

### 3.4 Review Engine
- Filters `cards` where `nextReviewTime <= currentTimestamp`.
- Updates `nextReviewTime` based on user selection (1m, 5m, etc.) + current time.

## 4. UI/UX Guidelines
- **Theme**: Modern, "Premium" feel.
- **Visuals**: Glassmorphism effects, smooth transitions, vibrant accent colors.
- **Interactivity**: Micro-animations on buttons and card flips.
