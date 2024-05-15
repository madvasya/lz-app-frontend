import {Link, useNavigate} from 'react-router-dom'
import useAuthStore from '../store/auth'
import {Anchor, Button, Group} from '@mantine/core'

const UserStatus = () => {
    const authState = useAuthStore((state) => state.isAuthenticated)
    const userName = useAuthStore((state) => state.username)
    const logout = useAuthStore((state) => state.logout)
    const navigate = useNavigate()

    if (!authState) {
        return <p>You are not logged in.</p>
    }

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    return (
        <Group px='md' py={5}>
            <Anchor component={Link} to='/me'>
                {userName}
            </Anchor>
            <Button type='submit' onClick={handleLogout}>
                Выход
            </Button>
        </Group>
    )
}

export default UserStatus
