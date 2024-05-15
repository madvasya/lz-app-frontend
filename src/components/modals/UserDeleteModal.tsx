import {Text, Box, Button} from '@mantine/core'
import UserService from '../../services/UserService'
import {notifications} from '@mantine/notifications'

export default function UserDeleteModal({
    close,
    usersToDelete,
    clearSelection,
}: {
    close: () => void
    usersToDelete: number[]
    clearSelection: () => void
}) {
    async function handleDelete() {
        for (var userId of usersToDelete) {
            try {
                await UserService.removeUser(userId)
                notifications.show({
                    message: `Пользователь id=${userId} был успешно удалён`,
                    color: 'green',
                })
            } catch (err: any) {
                const errTitle = `Ошибка при удалении пользователя id=${userId}`
                if (!err?.response) {
                    notifications.show({
                        title: errTitle,
                        message: 'Нет ответа от сервера',
                        color: 'red',
                    })
                } else if (err.response?.status === 403) {
                    notifications.show({
                        title: `Ошибка доступа при удалении пользователя id=${userId}`,
                        message: err.response?.data.detail,
                        color: 'red',
                    })
                } else {
                    notifications.show({
                        title: errTitle,
                        message: 'Неизвестная ошибка',
                        color: 'red',
                    })
                    console.log(err.response?.data)
                }
            }
        }
        clearSelection()
        close()
    }

    const deleteList = usersToDelete.map((id) => {
        return <Text key={id}>{id}</Text>
    })

    return (
        <Box>
            {/* <Text ref={errRef} className={errMsg ? "" : "invisible"} aria-live="assertive">{errMsg}</Text> */}
            <Text>Пользователи с указанными ID будут удалены без возможности восстановления: </Text>
            {deleteList}
            <Button onClick={handleDelete} color='red' mt='md'>
                Удалить
            </Button>
        </Box>
    )
}
