'use client'

type Props = {
    message: string;
    hasError?: boolean;
    errorMessage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const baseBtnClass = "hover-lift px-4 py-2 rounded-lg font-medium cursor-pointer text-sm sm:text-base border-b-2 active:border-b-0"

const confirmBtnClass = `${baseBtnClass} bg-danger text-white border-danger-hover hover:bg-danger-hover hover:border-danger-dark shadow-sm`

const cancelBtnClass = `${baseBtnClass} bg-surface-muted text-foreground-muted border-border hover:bg-surface-elevated hover:text-foreground hover:border-foreground-muted`

function ConfirmDialog({ message, onConfirm, onCancel, hasError, errorMessage }: Props) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-sm border border-border border-t-4 border-t-danger">
                <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-foreground text-lg leading-snug">
                        {message}
                    </p>
                    <p className="text-xs text-foreground-muted font-normal">
                        This action is permanent and cannot be undone.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 w-full">
                    <button className={cancelBtnClass} onClick={onCancel}>
                        Cancel
                    </button>

                    <button className={confirmBtnClass} onClick={onConfirm}>
                        Continue
                    </button>
                </div>
                {hasError && (
                    <div className="w-full text-center">
                        <div className="mx-auto mb-2 h-px w-3/4 bg-linear-to-r from-transparent via-danger to-transparent" />
                        <p className="text-xs text-danger">
                            {errorMessage ?? 'Error, try again later'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ConfirmDialog
