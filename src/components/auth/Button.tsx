type Props = {
    type: "submit" | "reset" | "button";
    children: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

function Button({ type, onClick, children, disabled }: Props) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="bg-primary hover:bg-primary-hover hover-lift transition-all text-white rounded p-1 w-72 cursor-pointer mt-5 disabled:bg-primary disabled:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button
