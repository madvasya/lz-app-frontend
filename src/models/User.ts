export interface User {
    id: number
    username: string
    full_name: string
    email: string
    is_sandbox_admin: boolean
    created_on: Date
    edited_on: Date
    roles: string[]
    permissions: string[]
}

export interface UserCreate {
    username: string
    full_name: string
    email: string
    password: string
}

export interface UserUpdate {
    username?: string
    full_name?: string
    email?: string
}
