import {RolePermission} from './Permission'

export interface Role {
    id: number
    name: string
    description: string
}

export interface RoleRead extends Role {
    role_permissions: RolePermission[]
}

export interface RoleCreate {
    name: string
    description: string
}

export interface RoleUpdate {
    name?: string
    description?: string
}
