import {Text, Box, Button} from '@mantine/core'
import RoomService from '../../services/RoomService'
import {useRoomPageStore} from '../../pages/RoomsPage'
import {notifications} from '@mantine/notifications'

export default function RoomDeleteModal({close}: {close: () => void}) {
    const selection = useRoomPageStore((state) => state.selection)
    const clearSelection = useRoomPageStore((state) => state.clearSelection)

    async function handleDelete() {
        for (var userId of selection) {
            try {
                await RoomService.removeRoom(userId)
                notifications.show({
                    message: `Комната id=${userId} была успешно удалена`,
                    color: 'green',
                })
            } catch (err: any) {
                const errTitle = `Ошибка при удалении комнаты id=${userId}`
                if (!err?.response) {
                    notifications.show({
                        title: errTitle,
                        message: 'Нет ответа от сервера',
                        color: 'red',
                    })
                } else if (err.response?.status === 403) {
                    notifications.show({
                        title: `Ошибка доступа при удалении комнаты id=${userId}`,
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
            <Text>
                Комнаты с указанными ID будут удалены без возможности восстановления, включая все находящиеся в них
                устройства:{' '}
            </Text>
            {deleteList}
            <Button onClick={handleDelete} color='red' mt='md'>
                Удалить
            </Button>
        </Box>
    )
}
