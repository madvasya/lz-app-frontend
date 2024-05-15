import {ReactNode} from 'react'
//import useAuthStore from "../store/auth";

function RequirePermissionToDisplay({children, permission}: {children: ReactNode; permission: string}) {
    // if (useAuthStore.getState().userPermissions.includes(permission)) {
    //     return children;
    // }
    return children
}

export default RequirePermissionToDisplay
