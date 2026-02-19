# Product Requirement Document (PRD) - FlipIt

## 1. Introduction
FlipIt is a flashcard application designed to make learning easy and efficient using spaced repetition. Users can create decks, flip through cards, and review key concepts.

## 2. User Authentication
### 2.1 Landing/Auth Screen
- **Sign In (Register)**:
  - Prompt: "Are you new to FlipIt? Sign in"
  - Inputs: Username, Password.
  - Validation: Check if username is already taken.
    - If taken: Show "Passcode or username already used".
    - If valid: Create account and redirect to Home Page.
- **Log In**:
  - Inputs: Username, Password.
  - Validation: Check credentials against existing users.
    - If valid: Redirect to Home Page and load user-specific data.

## 3. Home Page
- **Overview**: Main dashboard for navigation.
- **Components**:
  - **Decks/Categories**: List of all flashcard sets belonging to the logged-in user.
  - **Quick Access Buttons**: "Create New Deck", "Study Now", "Review".
  - **Progress Overview**: Stats on studied cards or deck proficiency.
  - **Navigation Menu**: Settings, Profile, Features.

## 4. Card Creation
- **Access**: Via "Create Flash Card" button (under Settings on Home Page).
- **Form Fields**:
  - **Question**: Text input.
  - **Hint**: Text input.
  - **Answer**: Text input.
  - **Folder**: Optional (Default: "All Flash Cards").
- **Action**: Save card and make it available for review (Associated with current user account).

## 5. Review Section
- **Access**: Via "Review Page/Section" button on Home Page.
- **Flow**:
  1. **Show Question**: Display the card's question.
  2. **Hint Button**: Optional. When clicked, reveals the hint.
  3. **Answer Button**: When clicked, reveals the answer.
  4. **Spaced Repetition Selection**:
     - Text: "When will this question appear?"
     - Options: [1 min], [5 min], [1 hour], [1 day], [1 week], [1 month].
  5. **Action**: On selection, hide card and schedule appearance based on chosen time.
- **Navigation**: "Exit to Home Page" button.

## 6. Future Scope
- (Placeholder for "after I will add more")
