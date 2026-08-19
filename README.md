# Kanban

A full-stack Kanban board built with Next.js, TypeScript, Prisma, and SQLite.

The project provides a simple task management interface where users can create, edit, delete, and reorder columns and cards. Changes are persisted to a SQLite database through REST API routes built with Next.js Route Handlers.

> Authentication pages are currently implemented on the front end. Backend authentication is not yet available.

## Preview

![Home](public/home.png)

## Features

* Create, edit, and delete cards
* Create, edit, and delete columns
* Drag and drop cards between columns
* Reorder columns using drag and drop
* Optimistic UI updates
* Persistent data using SQLite
* REST API built with Next.js Route Handlers
* Confirmation dialog before deleting cards or columns
* Responsive interface
* Sign in and sign up pages
* Server-side validation for create operations

### Drag and Drop

The board uses the native HTML5 Drag and Drop API without external drag-and-drop libraries.

Cards can be moved between columns, while columns can be reordered across the board. Changes are immediately reflected in the interface and persisted to the database through `PATCH` requests.

![Drag](public/drag.png)
![Drop](public/drop.png)

### Card and Column Management

Cards and columns can be created directly from the board and their titles can be edited inline.

Deleting a column also removes its cards through Prisma's cascading delete behavior.

![Add column](public/add%20new%20column.png)
![Add card](public/add%20new%20card.png)
![Delete card](public/delete%20card.png)
![Delete column](public/delete%20column.png)

### Sign-in and Sign-up

Currently only working on the client side.

![Sign-In](/public/sign-in.png)
![Sign-Up](/public/sign-up.png)

## Tech Stack

* Next.js
* React 19
* TypeScript
* Tailwind CSS
* Prisma ORM 7
* SQLite
* `@prisma/adapter-better-sqlite3`

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── cards/
│   │   └── columns/
│   ├── signin/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/
│   ├── ConfirmDialog.tsx
│   ├── Kanban.tsx
│   ├── NewCardForm.tsx
│   └── NewColumnForm.tsx
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

Cards and columns contain a `position` field used to determine their order.

Instead of sequential integers, new items use spaced positions. When an item is moved between two others, its new position can be calculated using the values of its neighbors.

This allows reordering without updating the position of every item on the board.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

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

## Database

The project uses SQLite with Prisma ORM.

The main relationship is:

```text
Board
  └── Column
        └── Card
```

A default board with three columns is created by the seed script.

## Known Limitations

* Authentication pages currently provide only the front-end interface; authentication logic is not implemented yet
* Cards dropped into another column are appended to the end instead of being inserted at the exact drop position
* The `position` system does not currently perform automatic rebalancing
* The application currently works with a single default board

## Roadmap

* Implement authentication
* Associate boards with users
* Improve card positioning during drag and drop
* Add support for multiple boards

## License

This project is for educational and portfolio purposes.