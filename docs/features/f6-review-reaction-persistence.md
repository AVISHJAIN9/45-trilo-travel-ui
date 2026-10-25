# Feature F6: Review Helpful Upvotes with LocalStorage Sync

```mermaid
flowchart TD
    UserClick([User clicks Helpful thumbs-up button]) --> ReadDataset[Read data-review attribute: '1' or '2']
    ReadDataset --> CheckState{state.helpfulVotes[id] == true?}
    CheckState -->|Already Voted| Untoggle[Remove key from state.helpfulVotes]
    Untoggle --> DecrementCount[Decrement counter text: count - 1]
    Untoggle --> RemoveVotedClass[Remove .voted class]
    Untoggle --> ToastRemove[showToast 'Vote removed']
    CheckState -->|Not Yet Voted| Upvote[Set state.helpfulVotes[id] = true]
    Upvote --> IncrementCount[Increment counter text: count + 1]
    Upvote --> AddVotedClass[Add .voted class]
    Upvote --> ToastThanks[showToast 'Thanks for your review feedback!']
    ToastRemove & ToastThanks --> SyncStorage[localStorage.setItem 'trillo_helpful_reviews']
```

---

## 1. Feature Overview & User-Facing Behavior
The **Review Helpful Upvoting System** allows guests to endorse authentic customer reviews with a single click. Review cards display the user's name, profile photo, date, rating score, and a "Helpful" thumbs-up reaction button. Clicking the button immediately increments the tally, highlights the button with the brand primary color, and stores the user's choice in browser `localStorage`. A second click untoggles the upvote and decrements the counter.

---

## 2. Technical Implementation Details
- **Hydration on Startup**:
  - `state.helpfulVotes` reads `JSON.parse(localStorage.getItem('trillo_helpful_reviews') || '{}')` at initialization.
  - Buttons matching existing keys automatically render with the `.voted` class applied.
- **Persistence Driver**:
  - `localStorage.setItem('trillo_helpful_reviews', JSON.stringify(state.helpfulVotes))`.
- **Styling Architecture**:
  - `.review::before` creates the decorative giant quotation mark (`\201C`, font-size: 20rem).
  - `.review:hover` elevates the card (`transform: translateY(-4px)`) and highlights the left border with `--color-primary`.

---

## 3. Say It Out Loud

> *"I implemented the Review Helpful Upvoting system to provide social proof and user engagement without requiring a user login. When a user clicks the helpful button on a review card, `setupReviewReactions()` checks the `dataset.review` ID. If the user hasn't voted yet, it increments the vote count, adds an active style, and writes the state to LocalStorage using `JSON.stringify()`. If they click it again, it removes their vote and decrements the counter. I used LocalStorage so the user's reactions persist across page refreshes and browser restarts. If LocalStorage is disabled or full, the try-catch block allows in-memory voting without crashing. One limitation is that votes are stored locally per device rather than aggregated on a central server, which I would implement with an API endpoint."*
