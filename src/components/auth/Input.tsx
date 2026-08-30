'use client'

import { useState } from "react"
import { Check, Eye, EyeClosed } from "lucide-react"

type Props = {
  type: string;
  placeholder: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  strength?: number;
}

const strengthWidths = ["w-0", "w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"]

function Input({ type, placeholder, value, onChange, strength }: Props) {

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="relative mx-8 my-2 w-72">
      {/* I didn't use border-b because the animation was bugging on my screen */}
      <input
        className={`peer w-full bg-transparent p-2 text-foreground placeholder:text-foreground-muted focus:outline-none ${isPassword && strength !== undefined ? "pr-14" : "pr-8"}`}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-foreground-muted hover:text-foreground transition-colors focus:outline-none"
        >
          {showPassword ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeClosed className="w-5 h-5" />
          )}
        </button>
      )}
      <div className="absolute bottom-0 left-0 h-px w-full bg-foreground-muted" />

      {strength === undefined ? (
        <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-center scale-x-0 bg-primary transition-transform duration-300 peer-focus:scale-x-100" />
      ) : (
        <span
          className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-primary transition-[width] duration-300 ease-out ${strengthWidths[Math.max(0, Math.min(5, strength))]}`}
        />
      )}
      {isPassword && strength === 5 && (
        <Check className="pointer-events-none absolute right-9 top-2.5 size-4 text-primary" aria-label="Strong password" />
      )}
    </div>
  )
}

export default Input
