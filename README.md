# Kanban

A fullstack Kanban board built as a focused CRUD demonstration project: no authentication, a single default board, and every interaction (create, edit, delete, reorder) persisted to a real database through a REST API built with Next.js Route Handlers.

## Tech Stack

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM 7 with `@prisma/adapter-better-sqlite3`
- SQLite

## Features

### Board, Columns, and Cards

- A single seeded Board with dynamic Columns and Cards, all relationships modeled in Prisma (`Board` → `Column` → `Card`)
- Full CRUD for both Columns and Cards: create, inline-edit title (click to edit, save on blur or Enter, cancel on Escape), and delete
- Deleting a Column cascades to delete all Cards inside it (`onDelete: Cascade`), with a confirmation dialog before either delete goes through
- New Cards are created through an inline form scoped to the column they'll belong to; new Columns through a similar form at the end of the board

![Home](public/home.png)
![Add column](public/add%20column.png)
![Add card](public/add%20new%20card.png)
![Delete card](public/delete%20card.png)
![Delete column](public/delete%20column.png)

### Ordering

- Both Columns and Cards carry a `position` field (`Float`, not `Int`), enabling midpoint-based reordering: inserting an item between two existing ones sets its position to the average of its neighbors, so only the moved item needs a database write, not every item after it
- New items are appended using spaced positions (increments of 100) rather than sequential integers, leaving room for future inserts without renumbering
- Known limitation: no automatic rebalancing. If items are repeatedly reordered into the same tight gap enough times, floating-point precision could eventually cause two items to land on the same position. Out of scope for this project; production Kanban tools handle this with periodic rebalancing or a different ordering scheme entirely

### Drag and Drop

- Built with the native HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`), no external drag-and-drop library
- Cards can be dragged between columns; columns themselves can be dragged to reorder the board
- Visual feedback while dragging: the dragged card lifts, fades, and tilts at a randomized angle; the column currently being dragged over highlights
- Moves are applied optimistically (the UI updates immediately) and persisted via `PATCH` requests to the API in the background
- Known limitation: dropping a card into a column currently always appends it to the end of that column, rather than inserting it at the exact drop position between two specific cards. Precise mid-column drop targeting was not implemented

![Drag](public/drag.png)
![Drop](public/drop.png)

### API

Route handlers under `app/api/`, following REST conventions with a collection-level route and a dynamic `[id]` route per resource:

```
POST   /api/cards          create a card
PATCH  /api/cards/[id]     update a card (title, columnId, position)
DELETE /api/cards/[id]     delete a card

POST   /api/columns        create a column
PATCH  /api/columns/[id]   update a column (title, position)
DELETE /api/columns/[id]   delete a column, cascades to its cards
```

Server-side validation on every `POST` (rejecting empty or missing fields with a `400` and a clear error message), independent of whatever client-side validation already ran.

## Project Structure

```
src/
  app/
    page.tsx                       # Server Component: fetches the board, renders Kanban
    layout.tsx
    api/
      cards/route.ts               # POST
      cards/[id]/route.ts          # PATCH, DELETE
      columns/route.ts             # POST
      columns/[id]/route.ts        # PATCH, DELETE
  components/
    Kanban.tsx                     # Owns all board state; renders columns, cards, drag-and-drop
    NewCardForm.tsx                # Create-card form, scoped to a column
    NewColumnForm.tsx              # Create-column form
    ConfirmDialog.tsx              # Reusable confirm/cancel modal, used for both card and column deletes
  lib/
    Prisma.ts                      # Shared PrismaClient singleton (adapter configured once, reused everywhere)
    board.ts                       # Shared boardInclude query shape + Prisma.BoardGetPayload-derived type
prisma/
  schema.prisma                    # Board, Column, Card models
  seed.ts                          # Seeds a default Board with three Columns, idempotent (skips if a Board already exists)
prisma.config.ts
```

## Data Flow

`page.tsx` is a Server Component. It queries the database directly with Prisma (`prisma.board.findFirst({ include: boardInclude })`), using a shared `boardInclude` object from `lib/board.ts` so the query shape and its derived TypeScript type can never drift out of sync with each other. The resulting `board` is passed as a prop into `Kanban.tsx`, a Client Component.

`Kanban.tsx` seeds its own `useState` for `cards` and `columns` from that initial `board` prop, then owns everything from there: every create, edit, delete, and drag-and-drop move updates local state immediately (so the UI never waits on a round trip to feel responsive) and fires the matching API request in the background to persist the change. Cards are kept in one flat array rather than nested inside their columns, and grouped back by column at render time via `.filter()`, since a flat array is simpler to update from a single place (create, delete, or move) than a structure where the same card could live nested under a changing parent.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/natajuniorpinheirodasilva-ui/kanban.git
   cd kanban
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the environment file:

   ```bash
   cp .env.example .env
   ```

4. Generate the Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Run migrations and seed the database:

   ```bash
   npx prisma migrate dev
   ```

   (this also runs the seed script automatically, creating a default Board with three Columns)

6. Start the development server:

   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Known Limitations

- No authentication; this is intentionally a single-board CRUD demo, not a multi-user product
- No rebalancing of the `position` field; see the Ordering section above
- Dropping a card always appends it to the end of the target column, not to a precise position between two cards
- This project's scope is deliberately narrow: prove out relational data modeling, a REST API, and native drag-and-drop, nothing more
