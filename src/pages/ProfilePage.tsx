import UserService from '../services/UserService'
import useAuthStore from '../store/auth'
import {Group, Stack, Text, Title} from '@mantine/core'
import {useQuery} from '@tanstack/react-query'
import date from 'date-and-time'

function ProfilePage() {
    const userPermissions = useAuthStore((state) => state.userPermissions)
    const {data} = useQuery({queryKey: ['userMe'], queryFn: () => UserService.fetchUserMe()})

    const permList = userPermissions.map((permission) => {
        return <Text key={permission}>{permission}</Text>
    })

    return (
        <>
            {data ? (
                <Stack>
                    <Title order={3}>{data?.full_name}</Title>
                    <Group gap='xs'>
                        <Text size='sm' c='gray'>{`@${data?.username}`}</Text>
                        <Text size='sm' c='gray'>
                            ·
                        </Text>
                        <Text size='sm' c='gray'>{`User ID: ${data?.id}`}</Text>
                        <Text size='sm' c='gray'>
                            ·
                        </Text>
                        <Text size='sm' c='gray'>
                            {data ? `Last edited on ${date.format(new Date(data?.edited_on), 'ddd, DD.MM.YYYY')}` : ''}
                        </Text>
                    </Group>
                    <Text>my spermissions:</Text>
                    {permList}
                </Stack>
            ) : (
                <Text>Loading...</Text>
            )}
        </>
    )
}

export default ProfilePage
