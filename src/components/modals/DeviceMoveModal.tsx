import {Text, Box, Button, Group, Title, Space, NativeSelect} from '@mantine/core'
import {DeviceUpdate} from '../../models/Device'
import DeviceService from '../../services/DeviceService'
import {notifications} from '@mantine/notifications'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'
import RoomService from '../../services/RoomService'
import {useState} from 'react'

export default function DeviceEditModal({close, deviceId}: {close: () => void; deviceId: number}) {
    const [newRoom, setNewRoom] = useState<string>()
    const {data} = useQuery({
        queryKey: ['device', deviceId],
        queryFn: async () => {
            const data = await DeviceService.fetchDevice(deviceId)
            setNewRoom(String(data.room_id))
            return data
        },
    })

    const roomsQuery = useQuery({
        queryKey: ['rooms'],
        queryFn: () => RoomService.fetchRooms(),
    })

    const [errMsg, setErrMsg] = useState('')
    const queryClient = useQueryClient()
    const deviceMoveMutation = useMutation({
        mutationFn: (updatedDevice: DeviceUpdate) => DeviceService.editDevice(deviceId, updatedDevice),
        onSuccess: (data) => {
            notifications.show({
                message: `Устройство '${data.name}' успешно перенесено в комнату id=${data.room_id}`,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['devices']})
            queryClient.invalidateQueries({queryKey: ['device', deviceId]})
            deviceMoveMutation.reset()
            close()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.data.detail[0].msg) {
                    setErrMsg(error.response?.data.detail[0].msg)
                } else {
                    setErrMsg(error.response?.data.detail)
                }
            }
        },
    })

    return (
        <Box>
            <Title order={3}>{data?.name}</Title>
            <Group gap='xs'>
                <Text size='sm' c='gray'>
                    {data?.description}
                </Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>{`Device ID: ${data?.id}`}</Text>
            </Group>
            <Space h='md' />
            <NativeSelect
                label='Местоположение устройства'
                mah={200}
                value={newRoom}
                onChange={(event) => setNewRoom(event.currentTarget.value)}
                data={roomsQuery.data?.roomArray.map((room) => ({
                    label: room.name,
                    value: String(room.id),
                    disabled: room.id === data?.room_id,
                }))}
            />
            <Group justify='flex-end' mt='xl'>
                <Button onClick={() => deviceMoveMutation.mutate({room_id: Number(newRoom)})}>Сохранить</Button>
            </Group>
            {deviceMoveMutation.isError && <Text onClick={() => deviceMoveMutation.reset()}>{errMsg}</Text>}
        </Box>
    )
}
