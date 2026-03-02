# SongShare

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Song sharing platform where users can post and discover songs
- Each song entry includes: title, artist, genre, a link (e.g. YouTube, SoundCloud, Spotify URL), optional description, and timestamp
- Song feed/list visible to all visitors (public)
- "Share a Song" form to submit new songs (authenticated users)
- Like/upvote system per song
- Song detail view with description and link to listen
- Genre filter to browse songs by category
- User authentication (login/logout)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Song data model with fields (id, title, artist, genre, link, description, likes, submittedBy, timestamp)
2. Backend: CRUD operations — createSong, getSongs, getSongById, likeSong, deleteSong (own songs only)
3. Backend: Genre listing and filter support
4. Backend: Authorization for submitting and deleting songs
5. Frontend: Home page with scrollable song feed (cards showing title, artist, genre, likes)
6. Frontend: Genre filter tabs/buttons
7. Frontend: Share Song form (title, artist, genre, link, optional description)
8. Frontend: Song card with like button and external link to listen
9. Frontend: Login/logout UI
10. Frontend: Empty state and loading states
