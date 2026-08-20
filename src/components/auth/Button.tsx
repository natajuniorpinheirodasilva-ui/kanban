type Props = {
    type: "submit" | "reset" | "button";
    children: string;  
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Button({ type, onClick, children }: Props) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="bg-primary hover:bg-primary-hover text-white rounded p-1 w-72 cursor-pointer mt-5"
        >
            {children}
        </button>
    )
}

export default Button
