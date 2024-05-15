import {ActionIcon, Checkbox, Group, Table, rem} from '@mantine/core'
import {useRolePageStore} from '../../pages/RolesPage'
import {IconSettings} from '@tabler/icons-react'
import {RoleRead} from '../../models/Role'
import {ModalContainer} from '../modals/ModalContainer'
import {useDisclosure} from '@mantine/hooks'
import {useQueryClient} from '@tanstack/react-query'
import RoleEditModal from '../modals/RoleEditModal'
import {useState} from 'react'
import BadgesList from '../BadgesList'
import SortedTh from './SortedColumnHeader'

export default function RolesTable({roles}: {roles: RoleRead[] | undefined}) {
    const selection = useRolePageStore((state) => state.selection)
    const toggleRow = useRolePageStore((state) => state.toggleRow)
    const [roleToEdit, setRoleToEdit] = useState(0)
    const client = useQueryClient()
    const [editModalOpened, editModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['roles']}),
    })

    const [reverseSortDirection, setReverseSortDirection] = useState(false)
    const [sortBy, setSortBy] = useState<string | undefined>()
    const setOrderList = useRolePageStore((state) => state.setOrderList)
    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false
        setReverseSortDirection(reversed)
        setSortBy(field)
        setOrderList(field, reversed)
    }

    function handleEditClick(id: number) {
        setRoleToEdit(id)
        editModalHandlers.open()
    }

    const rows = roles?.map((role) => {
        const colorMap = (permission: string) => {
            if (permission.includes('role')) return 'gray'
            else if (permission.includes('user')) return 'green'
            else if (permission.includes('room')) return 'blue'
            else return 'black'
        }
        return (
            <Table.Tr key={role.id}>
                <Table.Td w={100}>
                    <Group justify='flex-start'>
                        <Checkbox checked={selection.includes(role.id)} onChange={() => toggleRow(role.id)} />
                        <ActionIcon variant='subtle' color='gray' onClick={() => handleEditClick(role.id)}>
                            <IconSettings style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                </Table.Td>
                <Table.Td w={80}>{role.id}</Table.Td>
                <Table.Td w={150}>{role.name}</Table.Td>
                <Table.Td>{role.description}</Table.Td>
                <Table.Td>
                    {BadgesList(
                        role.role_permissions.map((item) => item.permission_key),
                        colorMap
                    )}
                </Table.Td>
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
                            Role name
                        </SortedTh>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Permissions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            <ModalContainer title='Редактирование роли' opened={editModalOpened} onClose={editModalHandlers.close}>
                <RoleEditModal close={editModalHandlers.close} roleId={roleToEdit} />
            </ModalContainer>
        </div>
    )
}
