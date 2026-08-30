export const PASSWORD_REQUIREMENTS =
    "Use 8-72 characters with uppercase, lowercase, number, and symbol."

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase()
}

export function isValidEmail(email: string) {
    const normalizedEmail = normalizeEmail(email)
    return normalizedEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
}

export function isStrongPassword(password: string) {
    return getPasswordStrength(password) === 5
}

export function getPasswordStrength(password: string) {
    return [
        password.length >= 8 && password.length <= 72,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length
}
