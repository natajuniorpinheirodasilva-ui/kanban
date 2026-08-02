import { Prisma } from "@/generated/prisma/client";

// prevents duplication
export const boardInclude = {
    columns: {
        orderBy: {position: "asc" },
        include: {
            cards: {
                orderBy: { position: "asc" },
            },
        },
    },
} satisfies Prisma.BoardInclude

export type BoardWithColumnsAndCards = Prisma.BoardGetPayload<{include: typeof boardInclude}>