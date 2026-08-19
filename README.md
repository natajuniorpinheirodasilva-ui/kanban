# Kanban

A full-stack Kanban board built with **Next.js, React, TypeScript, Prisma, and SQLite**.

The project provides a task management interface where users can create, edit, delete, and reorder columns and cards. Changes are persisted to a SQLite database through REST API routes built with Next.js Route Handlers.

> **Note:** Sign-in and sign-up interfaces are implemented, but authentication is not functional yet.

## Preview

![Kanban Board](public/home.png)

## Features

* Create, edit, and delete cards
* Create, edit, and delete columns
* Drag and drop cards between columns
* Reorder columns using drag and drop
* Optimistic UI updates
* Persistent data with SQLite
* REST API using Next.js Route Handlers
* Confirmation dialogs before deleting cards or columns
* Responsive interface
* Sign-in and sign-up interfaces
* Server-side validation

## Drag and Drop

The board uses the native **HTML5 Drag and Drop API**, without external drag-and-drop libraries.

Cards can be moved between columns and columns can be reordered across the board. Changes are reflected immediately in the interface and persisted to the database through `PATCH` requests.

![Drag](public/drag.png)
![Drop](public/drop.png)

## Card and Column Management

Cards and columns can be created directly from the board. Their titles can also be edited inline.

Deleting a column automatically removes its cards through Prisma's cascading delete behavior.

![Add Column](public/add%20new%20column.png)
![Add Card](public/add%20new%20card.png)
![Delete Card](public/delete%20card.png)
![Delete Column](public/delete%20column.png)

## Authentication UI

Sign-in and sign-up pages are currently implemented as front-end interfaces only.

Authentication logic, user sessions, and user accounts are not implemented yet.

![Sign In](public/sign-in.png)
![Sign Up](public/sign-up.png)

## Tech Stack

* **Next.js** — App Router and Route Handlers
* **React 19** — user interface
* **TypeScript** — static typing
* **Tailwind CSS** — styling
* **Prisma ORM 7** — database access and data modeling
* **SQLite** — database
* **better-sqlite3** — SQLite driver

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   └── signup/
│   ├── api/
│   │   ├── cards/
│   │   └── columns/
│   ├── board/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/
│   ├── kanban/
│   └── ui/
│
└── lib/
    ├── board.ts
    └── Prisma.ts

prisma/
├── schema.prisma
└── seed.ts
```

## API

The application uses REST-style Route Handlers for card and column operations.

### Cards

```text
POST    /api/cards
PATCH   /api/cards/[id]
DELETE  /api/cards/[id]
```

### Columns

```text
POST    /api/columns
PATCH   /api/columns/[id]
DELETE  /api/columns/[id]
```

## Ordering

Cards and columns contain a `position` field that determines their order on the board.

Instead of relying on sequential integers, items use spaced positions. When an item is reordered, its new position can be calculated based on neighboring items.

This allows items to be reordered without updating the position of every card or column.

## Database

The project uses SQLite with Prisma ORM.

The current data model follows this relationship:

```text
Board
└── Column
    └── Card
```

A default board with three columns is created by the seed script.

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/natajuniorpinheirodasilva-ui/kanban.git
cd kanban
```

Install the dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Run the database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Known Limitations

* Authentication is not implemented yet
* The application currently uses a single default board
* Cards moved between columns are appended to the end of the target column instead of being inserted at the exact drop position
* The `position` system does not currently perform automatic rebalancing

## Roadmap

* [ ] Implement authentication
* [ ] Associate boards with users
* [ ] Add support for multiple boards
* [ ] Improve card positioning during drag and drop
* [ ] Add error handling for failed optimistic updates
* [ ] Add automated tests

## License

This project was created for educational and portfolio purposes.
