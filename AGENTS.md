# FlipIt - Agent Instructions

## Project Overview
FlipIt is a simple and effective flashcard app designed to help users learn and remember information faster through spaced repetition.

## key Principles
- **Simplicity**: The UI should be clean and intuitive.
- **Efficiency**: Focus on quick study sessions.
- **Aesthetics**: high-quality, "wow" factor design (vibrant colors, glassmorphism, animations).

## Core Workflows
1. **Authentication**: Simple Username/Password flow. Unique username verification.
2. **Creation**: Easy card adding with optional grouping (folders).
3. **Review**: Spaced repetition interface (1m, 5m, 1h, 1d, 1w, 1mo intervals).

## Technical Context
- Target Platform: Web Application.
- Data Persistence: LocalStorage (MVP). **Important**: All data (decks, cards, progress) must be saved with the user's account ID/Username to ensure data isolation between multiple users on the same device.
