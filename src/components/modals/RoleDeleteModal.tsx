import {Text, Box, Button} from '@mantine/core'
import RoleService from '../../services/RoleService'
import {useRolePageStore} from '../../pages/RolesPage'
import {notifications} from '@mantine/notifications'

export default function RoleDeleteModal({close}: {close: () => void}) {
    const selection = useRolePageStore((state) => state.selection)
    const clearSelection = useRolePageStore((state) => state.clearSelection)

    async function handleDelete() {
        for (var userId of selection) {
            try {
                await RoleService.removeRole(userId)
                notifications.show({
                    message: `Роль id=${userId} была успешно удалена`,
                    color: 'green',
                })
            } catch (err: any) {
                const errTitle = `Ошибка при удалении роли id=${userId}`
                if (!err?.response) {
                    notifications.show({
                        title: errTitle,
                        message: 'Нет ответа от сервера',
                        color: 'red',
                    })
                } else if (err.response?.status === 403) {
                    notifications.show({
                        title: `Ошибка доступа при удалении роли id=${userId}`,
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

    const deleteList = selection.map((id) => {
        return <Text key={id}>{id}</Text>
    })

    return (
        <Box>
            {/* <Text ref={errRef} className={errMsg ? "" : "invisible"} aria-live="assertive">{errMsg}</Text> */}
            <Text>Роли с указанными ID будут удалены без возможности восстановления: </Text>
            {deleteList}
            <Button onClick={handleDelete} color='red' mt='md'>
                Удалить
            </Button>
        </Box>
    )
}
