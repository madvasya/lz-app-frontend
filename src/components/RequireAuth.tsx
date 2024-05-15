import {useLocation, Navigate} from 'react-router-dom'
import useAuthStore from '../store/auth'
import {ReactNode} from 'react'

function RequireAuth({children}: {children: ReactNode}) {
    const location = useLocation()
    if (!useAuthStore.getState().isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to='/login' state={{from: location}} replace />
    }

    return children
}

export default RequireAuth
