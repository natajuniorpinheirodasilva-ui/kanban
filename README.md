# Kanban

A full-stack Kanban application for organizing tasks across personal workspaces. It combines authenticated server-side operations with a responsive board, persistent drag-and-drop ordering, task metadata, search, filters, and light/dark themes.

## Live Demo

[Open the deployed application](https://kanban-mu-woad.vercel.app)

This is an educational and portfolio project. Use test credentials rather than personal passwords.

## Features

- Account creation, sign-in, persistent sessions, and logout
- Email validation and password-strength requirements
- HTTP-only session cookies with an optional **Remember me** duration
- Protected routes and resource ownership checks
- Authentication rate limiting in the deployed environment
- Multiple user-specific workspaces with dedicated URLs
- Workspace creation, switching, inline renaming, and confirmed deletion
- Protection against deleting the user's final workspace
- Column creation, inline editing, deletion, and drag-and-drop reordering
- Card creation, inline editing, deletion, and movement between columns
- Precise insertion feedback when positioning cards above or below another card
- Card details with description, priority, labels, and due date
- Card search by title or description
- Filtering by priority and due-date status
- Loading, confirmation, empty, and error states
- Light and dark themes with system preference detection

## How It Works

Each account starts with a workspace containing **To Do**, **In Progress**, and **Done** columns. Users can add more workspaces and manage columns and cards directly from the board.

Drag-and-drop interactions are powered by dnd-kit. Card and column positions are recalculated on the client and persisted through batch API updates, including moves between columns.

Card details provide additional context without overcrowding the board. Search and filters can narrow visible cards by text, priority, or due-date status.

## Authentication and Security

Passwords are hashed with bcryptjs before storage. On successful sign-up or sign-in, the server creates a database session and sends its random token through an HTTP-only cookie.

With **Remember me**, the session can persist for up to 30 days. Otherwise, the authentication cookie lasts for the current browser session. Protected endpoints validate the session, expiration date, authenticated user, and ownership of the requested resource.

Sign-up requires a valid email and a password between 8 and 72 characters containing lowercase and uppercase letters, a number, and a special character. The production deployment also limits requests to authentication routes by IP address.

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- dnd-kit
- Prisma ORM 7
- PostgreSQL
- bcryptjs
- Lucide React
- Vercel

## API Routes

```text
POST    /api/auth/signup
POST    /api/auth/signin
POST    /api/auth/logout

POST    /api/boards
PATCH   /api/boards/[id]
DELETE  /api/boards/[id]

POST    /api/columns
PATCH   /api/columns
PATCH   /api/columns/[id]
DELETE  /api/columns/[id]

POST    /api/cards
PATCH   /api/cards
PATCH   /api/cards/[id]
DELETE  /api/cards/[id]
```

The collection-level `PATCH` routes persist reordered columns and cards in batches. All board-related endpoints require a valid session and verify resource ownership.

## Data Model

```text
User
|-- Session
`-- Board
    `-- Column
        `-- Card
```

Boards belong to users, columns belong to boards, and cards belong to columns. Cascading relations remove dependent records when a parent is deleted. Numeric position fields preserve the order of columns and cards.

## Project Structure

```text
src/
|-- app/
|   |-- (auth)/
|   |-- api/
|   |   |-- auth/
|   |   |-- boards/
|   |   |-- cards/
|   |   `-- columns/
|   |-- board/
|   |-- globals.css
|   `-- layout.tsx
|-- components/
|   |-- auth/
|   |-- kanban/
|   `-- ui/
|-- generated/
|   `-- prisma/
`-- lib/

prisma/
|-- migrations/
`-- schema.prisma
```

## Roadmap

- Add password recovery
- Add profile and account settings
- Improve keyboard accessibility for drag-and-drop
- Add automated API and interface tests

## License

Created for educational and portfolio purposes.
