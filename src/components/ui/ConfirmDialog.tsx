'use client'

type Props = {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

const baseBtnClass = "px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-out cursor-pointer text-sm sm:text-base border-b-2 active:translate-y-0.5 active:border-b-0"

const confirmBtnClass = `${baseBtnClass} bg-red-600 text-white border-red-800 hover:bg-red-700 hover:border-red-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md`

const cancelBtnClass = `${baseBtnClass} bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400 hover:-translate-y-0.5`

const ConfirmDialog = ({ message, onConfirm, onCancel }: Props) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-sm border-t-4 border-red-500">
                <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-gray-900 text-lg leading-snug">
                        {message}
                    </p>
                    <p className="text-xs text-gray-500 font-normal">
                        This action is permanent and cannot be undone..
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 w-full">
                    <button className={cancelBtnClass} onClick={onCancel}>
                        Cancelar
                    </button>

                    <button className={confirmBtnClass} onClick={onConfirm}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog