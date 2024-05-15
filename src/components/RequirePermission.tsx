import {Center, Stack, Text, Title} from '@mantine/core'
import useAuthStore from '../store/auth'
import {ReactNode} from 'react'

function RequirePermission({children, permission}: {children: ReactNode; permission: string}) {
    if (useAuthStore.getState().userPermissions.includes(permission)) {
        return children
    } else {
        return (
            <Center>
                <Stack>
                    <Title>Упс!</Title>
                    <Text>Доступ запрещен.</Text>
                    <Text>Вам необходимо право "{permission}" для того, чтобы просматривать данную страницу.</Text>
                </Stack>
            </Center>
        )
    }
}

export default RequirePermission
