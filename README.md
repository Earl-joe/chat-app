# Messenger Chat App

A Messenger-style social chat app with authentication, messaging, posts feed, profiles, and notifications.

## Features

- **Sign up / Log in** with JWT authentication
- **Chats tab** — see all contacts instantly, recent conversations with unread badges
- **Message notifications** — in-app toasts + browser notifications for new messages
- **Send text & images** in chat
- **Feed tab** — post text and photos, view everyone's posts
- **Profile tab** — edit avatar, username, bio; view your posts
- **View other profiles** — click any user to see their profile and message them
- **Search** — find users by name or email
- **Light / dark theme** toggle

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:5001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## Usage

1. Start both backend and frontend
2. Open http://localhost:5173
3. Sign up or log in
4. **Chats** — all users appear under Contacts; active chats show at top with unread counts
5. **Feed** — create posts with text and photos
6. **Profile** — edit your profile and view your posts
7. Click the moon/sun icon to switch themes

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
