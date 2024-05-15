import {ActionIcon, Badge, Checkbox, Group, Skeleton, Table, rem} from '@mantine/core'
import {User} from '../../models/User'
import {useUserPageStore} from '../../pages/UsersPage'
import {IconKey, IconPencil, IconSettings, IconShield, IconTrash} from '@tabler/icons-react'
import {ModalContainer} from '../modals/ModalContainer'
import UserEditModal from '../modals/UserEditModal'
import {useDisclosure} from '@mantine/hooks'
import {useQueryClient} from '@tanstack/react-query'
import ActionMenuContainer from '../menus/ActionMenuContainer'
import {useState} from 'react'
import UserChangePasswordModal from '../modals/UserChangePasswordModal'
import UserDeleteModal from '../modals/UserDeleteModal'
import UserManageRolesModal from '../modals/UserManageRolesModal'
import BadgesList from '../BadgesList'
import SortedTh from './SortedColumnHeader'

export interface IUsersTable {
    users: User[] | undefined
    isLoading: boolean
}

export default function UsersTable({users, isLoading}: IUsersTable) {
    const selection = useUserPageStore((state) => state.selection)
    const clearSelection = useUserPageStore((state) => state.clearSelection)

    const [reverseSortDirection, setReverseSortDirection] = useState(false)
    const [sortBy, setSortBy] = useState<string | undefined>()
    const setOrderList = useUserPageStore((state) => state.setOrderList)
    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false
        setReverseSortDirection(reversed)
        setSortBy(field)
        setOrderList(field, reversed)
    }

    const toggleRow = useUserPageStore((state) => state.toggleRow)
    const client = useQueryClient()
    const [userToEdit, setUserToEdit] = useState(0)

    const [editModalOpened, editModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })
    const [passwordModalOpened, passwordModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })
    const [roleModalOpened, roleModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })

    const userMenuItems = [
        {
            icon: <IconSettings style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Редактировать',
            action: editModalHandlers.open,
            color: undefined,
        },
        {
            icon: <IconShield style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Управлять ролями',
            action: roleModalHandlers.open,
            color: undefined,
        },
        {
            icon: <IconKey style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Изменить пароль',
            action: passwordModalHandlers.open,
            color: undefined,
        },
        {
            icon: <IconTrash style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Удалить пользователя',
            action: deleteModalHandlers.open,
            color: 'red',
        },
    ]

    function userEditMenu(userId: number) {
        return (
            <ActionMenuContainer
                items={userMenuItems}
                target={
                    <ActionIcon variant='subtle' color='gray' onClick={() => setUserToEdit(userId)}>
                        <IconPencil style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                    </ActionIcon>
                }
            />
        )
    }

    const rows = users?.map((user) => {
        const colorMap = (permission: string) => {
            if (permission.includes('role')) return 'gray'
            else if (permission.includes('user')) return 'green'
            else if (permission.includes('room')) return 'blue'
            else return 'black'
        }
        return (
            <Table.Tr key={user.id}>
                <Table.Td w={100}>
                    <Group justify='center' gap='xs'>
                        <Checkbox checked={selection.includes(user.id)} onChange={() => toggleRow(user.id)} />
                        {userEditMenu(user.id)}
                    </Group>
                </Table.Td>
                <Table.Td w={80}>{user.id}</Table.Td>
                <Table.Td maw={100}>
                    <Group>
                        {user.username}
                        {user.is_sandbox_admin ? <Badge color='blue'>admin</Badge> : <></>}
                    </Group>
                </Table.Td>
                <Table.Td>{user.full_name}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{BadgesList(user.permissions, colorMap)}</Table.Td>
            </Table.Tr>
        )
    })

    return (
        <Skeleton visible={isLoading}>
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
                            sorted={sortBy === 'username'}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting('username')}
                        >
                            Username
                        </SortedTh>
                        <SortedTh
                            sorted={sortBy === 'full_name'}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting('full_name')}
                        >
                            Full name
                        </SortedTh>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Permissions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            <ModalContainer
                title='Редактирование пользователя'
                opened={editModalOpened}
                onClose={editModalHandlers.close}
            >
                <UserEditModal close={editModalHandlers.close} userId={userToEdit} />
            </ModalContainer>
            <ModalContainer title='Изменение пароля' opened={passwordModalOpened} onClose={passwordModalHandlers.close}>
                <UserChangePasswordModal close={passwordModalHandlers.close} userId={userToEdit} />
            </ModalContainer>
            <ModalContainer
                title='Удалить пользователя?'
                opened={deleteModalOpened}
                onClose={deleteModalHandlers.close}
            >
                <UserDeleteModal
                    close={deleteModalHandlers.close}
                    usersToDelete={[userToEdit]}
                    clearSelection={clearSelection}
                />
            </ModalContainer>
            <ModalContainer
                title='Управление ролями'
                opened={roleModalOpened}
                onClose={roleModalHandlers.close}
                closeOnClickOutside={false}
            >
                <UserManageRolesModal close={roleModalHandlers.close} userId={userToEdit} />
            </ModalContainer>
        </Skeleton>
    )
}
