'use client'

import { useState } from "react"
import { Eye, EyeClosed, EyeOff } from "lucide-react"

type Props = {
  type: string;
  placeholder: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function Input({ type, placeholder, value, onChange }: Props) {

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="relative mx-8 my-2 w-72">
      {/* I didn't use border-b because the animation was bugging on my screen */}
      <input
        className="peer pr-8 w-full bg-transparent p-2 text-gray-900 placeholder-gray-400 focus:outline-none"
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
        >
          {showPassword ? (
            <Eye className="w-5 h-5"/>
          ) : (
            <EyeClosed className="w-5 h-5"/>
          )}
        </button>
      )}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gray-500"/>

      <span className="absolute bottom-0 left-0 h-0.5 w-full origin-center scale-x-0 bg-primary transition-transform duration-300 pointer-events-none peer-focus:scale-x-100" />
    </div>
  )
}

export default Input
