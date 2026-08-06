import { BoardWithColumnsAndCards } from "@/lib/board";

type Props = {
    board: BoardWithColumnsAndCards
}

function Kanban ({ board }: Props) {

return(    
    
    <div>
        {board.columns.map((column) => (
            <div key={column.id}>
                <h2>{column.title}</h2>
            
            {column.cards.map((card) => (
                <div key={card.id}>{card.title}</div>
            ))}
            </div>
        ))}
    </div>

)}

export default Kanban