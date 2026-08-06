import { BoardWithColumnsAndCards } from "@/lib/board";

type Props = {
    board: BoardWithColumnsAndCards
}

function Kanban ({ board }: Props) {

return(    
    <div className="flex justify-center" >
        <div className="flex gap-5">
        {board.columns.map((column) => (
            <div className="flex flex-col w-72 gap-3 text" key={column.id}>
            <h2 className="text-base font-semibold text-black/70 uppercase tracking-wide rounded border-b pb-1 shadow">
                {column.title}
            </h2>

            {column.cards.map((card) => (
                <div
                key={card.id}
                className="bg-white/5 border border-black/20 rounded-xl p-4 text-black shadow"
                >
                {card.title}
                </div>
            ))}
            </div>
        ))}
        </div>
    </div>

)}

export default Kanban