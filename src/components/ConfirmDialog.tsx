'use client'

type Props = {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

const deletePopUpClass = "w-auto text-left text-lg text-black hover:border-red-700 hover:bg-black/15 rounded-lg transition cursor-pointer border-b-2 hover:border-b-4"

const ConfirmDialog = ({ message, onConfirm, onCancel }: Props) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 pt-4 rounded-xl shadow-lg flex flex-col items-start min-h-35 w-auto border-b-4 border-red-500 scale-[126%]">
                <p className="font-semibold text-gray-800 text-xl underline decoration-2 decoration-red-500 drop-shadow-lg">
                    {message}
                </p>

                <div className="flex gap-6 w-full justify-start my-auto">
                    <button className={deletePopUpClass} onClick={onConfirm}>
                        Continue
                    </button>

                    <button className={deletePopUpClass} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog