import {ActionIcon, Anchor, Checkbox, Group, Table, rem} from '@mantine/core'
import {useRoomPageStore} from '../../pages/RoomsPage'
import {IconSettings} from '@tabler/icons-react'
import {RoomRead} from '../../models/Room'
import {ModalContainer} from '../modals/ModalContainer'
import {useDisclosure} from '@mantine/hooks'
import {useQueryClient} from '@tanstack/react-query'
import RoomEditModal from '../modals/RoomEditModal'
import {useState} from 'react'
import SortedTh from './SortedColumnHeader'
import {Link} from 'react-router-dom'

export default function RoomsTable({rooms}: {rooms: RoomRead[] | undefined}) {
    const selection = useRoomPageStore((state) => state.selection)
    const toggleRow = useRoomPageStore((state) => state.toggleRow)
    const [roomToEdit, setRoomToEdit] = useState(0)
    const client = useQueryClient()
    const [editModalOpened, editModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['rooms']}),
    })

    const [reverseSortDirection, setReverseSortDirection] = useState(false)
    const [sortBy, setSortBy] = useState<string | undefined>()
    const setOrderList = useRoomPageStore((state) => state.setOrderList)
    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false
        setReverseSortDirection(reversed)
        setSortBy(field)
        setOrderList(field, reversed)
    }

    function handleEditClick(id: number) {
        setRoomToEdit(id)
        editModalHandlers.open()
    }

    const rows = rooms?.map((room) => {
        return (
            <Table.Tr key={room.id}>
                <Table.Td w={100}>
                    <Group justify='flex-start'>
                        <Checkbox checked={selection.includes(room.id)} onChange={() => toggleRow(room.id)} />
                        <ActionIcon variant='subtle' color='gray' onClick={() => handleEditClick(room.id)}>
                            <IconSettings style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                </Table.Td>
                <Table.Td w={80}>{room.id}</Table.Td>
                <Table.Td w={150}>
                    <Anchor component={Link} to={`/rooms/${room.id}`}>
                        {room.name}
                    </Anchor>
                </Table.Td>
                <Table.Td w={80}>{room.area}</Table.Td>
                <Table.Td>{room.description}</Table.Td>
            </Table.Tr>
        )
    })

    return (
        <div>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th />
                        <SortedTh
                            sorted={sortBy === 'id'}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting('id')}
                        >
                            ID
                        </SortedTh>
                        <SortedTh
                            sorted={sortBy === 'name'}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting('name')}
                        >
                            Room name
                        </SortedTh>
                        <Table.Th>Area</Table.Th>
                        <Table.Th>Description</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            <ModalContainer title='Редактирование комнаты' opened={editModalOpened} onClose={editModalHandlers.close}>
                <RoomEditModal close={editModalHandlers.close} roomId={roomToEdit} />
            </ModalContainer>
        </div>
    )
}
