import {ActionIcon, Group, NativeSelect, Pagination, Stack} from '@mantine/core'
import {useState} from 'react'
import {User} from '../models/User'
import UserService from '../services/UserService'
import UsersTable from '../components/tables/UsersTable'
import UserCreateModal from '../components/modals/UserCreateModal'
import UserDeleteModal from '../components/modals/UserDeleteModal'
import {IconTrash, IconUserPlus} from '@tabler/icons-react'
import {create} from 'zustand'
import RequirePermissionToDisplay from '../components/RequirePermissionToDisplay'
import RequirePermission from '../components/RequirePermission'
import {useDisclosure} from '@mantine/hooks'
import {ModalContainer} from '../components/modals/ModalContainer'
import {useQuery, useQueryClient} from '@tanstack/react-query'

interface UserPageState {
    selection: number[]
    selectedUser: number | undefined
    orderList: string | undefined
    toggleRow: (id: number) => void
    clearSelection: () => void
    setOrderList: (key: string, direction: boolean) => void
}

export const useUserPageStore = create<UserPageState>()((set) => ({
    selection: [],
    selectedUser: undefined,
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

function UsersPage() {
    const client = useQueryClient()
    const [activePage, setPage] = useState(1)
    const [showOnPage, setShowOnPage] = useState(5)
    const selection = useUserPageStore((state) => state.selection)
    const clearSelection = useUserPageStore((state) => state.clearSelection)
    const orderList = useUserPageStore((state) => state.orderList)
    const [createModalOpened, createModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })

    async function fetchUsersData(): Promise<{
        userArray: User[]
        count: number
    }> {
        const response = await UserService.fetchUsers(showOnPage, showOnPage * (activePage - 1), orderList)
        const userArray = response.data
        const count = response.headers['x-total-count']
        return {userArray, count}
    }

    const {data, isPending} = useQuery({
        queryKey: ['users', showOnPage, activePage, orderList],
        queryFn: fetchUsersData,
    })

    return (
        <RequirePermission permission='user_read'>
            <Stack>
                <RequirePermissionToDisplay permission='user_update'>
                    <Group>
                        <ActionIcon
                            variant='filled'
                            aria-label='Добавление пользователя'
                            onClick={createModalHandlers.open}
                        >
                            <IconUserPlus style={{width: '70%', height: '70%'}} stroke={1.5} />
                        </ActionIcon>
                        {selection.length > 0 ? (
                            <ActionIcon
                                variant='filled'
                                aria-label='Удаление пользователей'
                                color='red'
                                onClick={deleteModalHandlers.open}
                            >
                                <IconTrash style={{width: '70%', height: '70%'}} stroke={1.5} />
                            </ActionIcon>
                        ) : (
                            <></>
                        )}
                        <ModalContainer
                            title='Добавить пользователя'
                            opened={createModalOpened}
                            onClose={createModalHandlers.close}
                        >
                            <UserCreateModal close={createModalHandlers.close} />
                        </ModalContainer>

                        <ModalContainer
                            title='Удалить пользователей?'
                            opened={deleteModalOpened}
                            onClose={deleteModalHandlers.close}
                        >
                            <UserDeleteModal
                                close={deleteModalHandlers.close}
                                usersToDelete={selection}
                                clearSelection={clearSelection}
                            />
                        </ModalContainer>
                    </Group>
                </RequirePermissionToDisplay>

                <UsersTable users={data?.userArray} isLoading={isPending} />
                {data ? (
                    <Stack align='start'>
                        <Pagination
                            total={Math.ceil(data.count / showOnPage)}
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

export default UsersPage
