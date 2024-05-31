import {ReactNode} from 'react'
import useAuthStore from '../store/auth'

function RequirePermissionToDisplay({children, permission}: {children: ReactNode; permission: string | undefined}) {
    if (permission && useAuthStore.getState().userPermissions.includes(permission)) {
        return children
    } else if(!permission) {
        return children
    }
}

export default RequirePermissionToDisplay
