import {Anchor, Button, Group, NativeSelect, Pagination, Stack, Text, Title, rem} from '@mantine/core'
import RequirePermission from '../components/RequirePermission'
import {Link, useParams} from 'react-router-dom'
import RoomService from '../services/RoomService'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {IconArrowLeft, IconSquarePlus, IconTrash} from '@tabler/icons-react'
import {create} from 'zustand'
import DevicesTable from '../components/tables/DeviceTable'
import {useDisclosure} from '@mantine/hooks'
import {useState} from 'react'
import RequirePermissionToDisplay from '../components/RequirePermissionToDisplay'
import {ModalContainer} from '../components/modals/ModalContainer'
import DeviceDeleteModal from '../components/modals/DeviceDeleteModal'
import DeviceCreateModal from '../components/modals/DeviceCreateModal'

interface DeviceTableState {
    selection: number[]
    toggleRow: (id: number) => void
    clearSelection: () => void
    orderList: string | undefined
    setOrderList: (key: string, direction: boolean) => void
}

export const useDeviceTableStore = create<DeviceTableState>()((set) => ({
    selection: [],
    orderList: undefined,
    toggleRow: (id: number): void =>
        set((state) => ({
            selection: state.selection.includes(id)
                ? state.selection.filter((item) => item !== id)
                : [...state.selection, id],
        })),
    clearSelection: (): void => set(() => ({selection: []})),
    setOrderList: (key: string, direction: boolean): void => {
        set(() => ({orderList: `${direction ? 'asc' : 'desc'}_${key}`}))
    },
}))

function RoomProfile() {
    const {roomId} = useParams()
    if (!roomId) {
        return <Text>Room not found</Text>
    }
    const roomQuery = useQuery({
        queryKey: ['room', roomId],
        queryFn: () => RoomService.fetchRoom(Number(roomId)),
    })

    const client = useQueryClient()
    const [activePage, setPage] = useState(1)
    const [showOnPage, setShowOnPage] = useState(5)
    const selection = useDeviceTableStore((state) => state.selection)
    const orderList = useDeviceTableStore((state) => state.orderList)
    const [createModalOpened, createModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['devices']}),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['devices']}),
    })

    const devicesQuery = useQuery({
        queryKey: ['devices', roomId, showOnPage, activePage, orderList],
        queryFn: () =>
            RoomService.fetchRoomDevices(Number(roomId), showOnPage, showOnPage * (activePage - 1), orderList),
    })

    return (
        <RequirePermission permission='room_read'>
            <Anchor component={Link} to='/rooms' underline='never'>
                <Group>
                    <IconArrowLeft style={{width: rem(16), height: rem(16)}} />
                    <Text>Назад к списку комнат</Text>
                </Group>
            </Anchor>
            <Title order={2}>{roomQuery.data?.name}</Title>
            <Group gap='xs'>
                <Text size='sm' c='gray'>{`ID: ${roomQuery.data?.id}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                {roomQuery.data?.description ? (
                    <>
                        <Text size='sm' c='gray'>{`${roomQuery.data?.description}`}</Text>

                        <Text size='sm' c='gray'>
                            ·
                        </Text>
                    </>
                ) : (
                    <></>
                )}
                <Text size='sm' c='gray'>{`${roomQuery.data?.area} кв.м`}</Text>
            </Group>
            <Stack>
                <RequirePermissionToDisplay permission='room_update'>
                    <Group>
                        <Button
                            variant='filled'
                            aria-label='Добавление устройства'
                            onClick={createModalHandlers.open}
                            leftSection={<IconSquarePlus style={{width: '80%', height: '80%'}} stroke={1.5} />}
                        >
                            Добавить устройство
                        </Button>
                        {selection.length > 0 ? (
                            <Button
                                variant='filled'
                                aria-label='Удаление устройств'
                                onClick={deleteModalHandlers.open}
                                color='red'
                                leftSection={<IconTrash style={{width: '80%', height: '80%'}} stroke={1.5} />}
                            >
                                Удалить
                            </Button>
                        ) : (
                            <></>
                        )}
                        <ModalContainer
                            title='Добавить устройство'
                            opened={createModalOpened}
                            onClose={createModalHandlers.close}
                        >
                            <DeviceCreateModal close={createModalHandlers.close} room_id={Number(roomId)} />
                        </ModalContainer>

                        <ModalContainer
                            title='Удалить устройства?'
                            opened={deleteModalOpened}
                            onClose={deleteModalHandlers.close}
                        >
                            <DeviceDeleteModal close={deleteModalHandlers.close} />
                        </ModalContainer>
                    </Group>
                </RequirePermissionToDisplay>
                <DevicesTable devices={devicesQuery.data?.deviceArray} />
                {devicesQuery.data ? (
                    <Stack align='start'>
                        <Pagination
                            total={Math.ceil(devicesQuery.data.count / showOnPage)}
                            value={activePage}
                            onChange={setPage}
                            mt='sm'
                        />
                        <NativeSelect
                            size='xs'
                            label='Показывать на странице'
                            maw={200}
                            value={showOnPage}
                            onChange={(event) => {
                                setShowOnPage(Number(event.currentTarget.value))
                                setPage(1)
                            }}
                            data={['5', '10', '25']}
                        />
                    </Stack>
                ) : (
                    <></>
                )}
            </Stack>
        </RequirePermission>
    )
}

export default RoomProfile
