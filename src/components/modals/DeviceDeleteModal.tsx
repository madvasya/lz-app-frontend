import {Text, Box, Button} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {useDeviceTableStore} from '../../pages/RoomProfile'
import DeviceService from '../../services/DeviceService'
import {useQueryClient} from '@tanstack/react-query'

export default function RoomDeleteModal({close}: {close: () => void}) {
    const selection = useDeviceTableStore((state) => state.selection)
    const clearSelection = useDeviceTableStore((state) => state.clearSelection)
    const queryClient = useQueryClient()

    async function handleDelete() {
        for (var deviceId of selection) {
            try {
                await DeviceService.removeDevice(deviceId)
                notifications.show({
                    message: `Устройство id=${deviceId} было успешно удалено`,
                    color: 'green',
                })
            } catch (err: any) {
                const errTitle = `Ошибка при удалении устройства id=${deviceId}`
                if (!err?.response) {
                    notifications.show({
                        title: errTitle,
                        message: 'Нет ответа от сервера',
                        color: 'red',
                    })
                } else if (err.response?.status === 403) {
                    notifications.show({
                        title: `Ошибка доступа при удалении устройства id=${deviceId}`,
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
        queryClient.invalidateQueries({queryKey: ['devices']})
        clearSelection()
        close()
    }

    const deleteList = selection.map((id) => {
        return <Text key={id}>{id}</Text>
    })

    return (
        <Box>
            {/* <Text ref={errRef} className={errMsg ? "" : "invisible"} aria-live="assertive">{errMsg}</Text> */}
            <Text>Устройства с указанными ID будут удалены без возможности восстановления: </Text>
            {deleteList}
            <Button onClick={handleDelete} color='red' mt='md'>
                Удалить
            </Button>
        </Box>
    )
}
