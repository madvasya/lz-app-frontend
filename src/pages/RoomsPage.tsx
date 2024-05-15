import {ActionIcon, Group, NativeSelect, Pagination, Stack} from '@mantine/core'
import RequirePermission from '../components/RequirePermission'
import {useDisclosure} from '@mantine/hooks'
import {IconSquarePlus, IconTrash} from '@tabler/icons-react'
import {useQueryClient, useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {create} from 'zustand'
import RequirePermissionToDisplay from '../components/RequirePermissionToDisplay'
import {ModalContainer} from '../components/modals/ModalContainer'
import RoomCreateModal from '../components/modals/RoomCreateModal'
import RoomDeleteModal from '../components/modals/RoomDeleteModal'
import RoomsTable from '../components/tables/RoomsTable'
import RoomService from '../services/RoomService'

interface RoomPageState {
    selection: number[]
    toggleRow: (id: number) => void
    clearSelection: () => void
    orderList: string | undefined
    setOrderList: (key: string, direction: boolean) => void
}

export const useRoomPageStore = create<RoomPageState>()((set) => ({
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

function RoomsPage() {
    const client = useQueryClient()
    const [activePage, setPage] = useState(1)
    const [showOnPage, setShowOnPage] = useState(5)
    const selection = useRoomPageStore((state) => state.selection)
    const orderList = useRoomPageStore((state) => state.orderList)
    const [createModalOpened, createModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['rooms']}),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['rooms']}),
    })

    const roomsQuery = useQuery({
        queryKey: ['rooms', showOnPage, activePage, orderList],
        queryFn: () => RoomService.fetchRooms(showOnPage, showOnPage * (activePage - 1), orderList),
    })

    return (
        <RequirePermission permission='room_read'>
            <Stack>
                <RequirePermissionToDisplay permission='room_update'>
                    <Group>
                        <ActionIcon variant='filled' aria-label='Добавление комнаты' onClick={createModalHandlers.open}>
                            <IconSquarePlus style={{width: '70%', height: '70%'}} stroke={1.5} />
                        </ActionIcon>
                        {selection.length > 0 ? (
                            <ActionIcon
                                variant='filled'
                                aria-label='Удаление комнаты'
                                color='red'
                                onClick={deleteModalHandlers.open}
                            >
                                <IconTrash style={{width: '70%', height: '70%'}} stroke={1.5} />
                            </ActionIcon>
                        ) : (
                            <></>
                        )}
                        <ModalContainer
                            title='Добавить комнату'
                            opened={createModalOpened}
                            onClose={createModalHandlers.close}
                        >
                            <RoomCreateModal close={createModalHandlers.close} />
                        </ModalContainer>

                        <ModalContainer
                            title='Удалить комнаты?'
                            opened={deleteModalOpened}
                            onClose={deleteModalHandlers.close}
                        >
                            <RoomDeleteModal close={deleteModalHandlers.close} />
                        </ModalContainer>
                    </Group>
                </RequirePermissionToDisplay>

                <RoomsTable rooms={roomsQuery.data?.roomArray} />
                {roomsQuery.data ? (
                    <Stack align='start'>
                        <Pagination
                            total={Math.ceil(roomsQuery.data.count / showOnPage)}
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

export default RoomsPage
