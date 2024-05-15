import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {jwtDecode} from 'jwt-decode'
import AuthService from '../services/AuthService'
import PermissionService from '../services/PermissionService'

interface AuthState {
    username?: string | undefined
    access_token?: string | undefined
    refresh_token?: string | undefined
    isAuthenticated: boolean
    userPermissions: string[]
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    updateTokenPair: (access: string, refresh: string) => void
    //refresh: () => void
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: undefined,
            userPermissions: [],
            isAuthenticated: false,
            login: async (username: string, password: string): Promise<void> => {
                try {
                    const response = await AuthService.login(username, password)
                    //console.log(response)
                    const user = jwtDecode(response.data.access_token)?.sub
                    set({
                        access_token: response.data.access_token,
                        refresh_token: response.data.refresh_token,
                        isAuthenticated: true,
                        username: user,
                    })
                    const permissionsResponse = await PermissionService.fetchPermissionsMy()
                    const permissions = permissionsResponse
                    set({userPermissions: permissions})
                } catch (e: any) {
                    throw e
                }
            },
            logout: async (): Promise<void> => {
                await AuthService.logout(get().refresh_token)
                set({access_token: undefined, refresh_token: undefined, isAuthenticated: false})
            },

            updateTokenPair: (access, refresh) => set({access_token: access, refresh_token: refresh}),
        }),
        {name: 'auth'}
    )
)

export default useAuthStore
