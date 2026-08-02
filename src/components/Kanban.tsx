'use client'

type Props = {
    board: {
        id: string;
        title: string;
        column: {
            id: string;
            title: string;
            position: number;
            cards: {
                id: string;
                title: string;
                position: number;
            }[];
        }[];
    }
}

export default function Kanban ({ board }: Props) {}