import {ActionIcon, Group, NativeSelect, Pagination, Stack} from '@mantine/core'
import {useState} from 'react'
import RolesTable from '../components/tables/RolesTable'
import RoleDeleteModal from '../components/modals/RoleDeleteModal'
import {create} from 'zustand'
import RequirePermissionToDisplay from '../components/RequirePermissionToDisplay'
import RequirePermission from '../components/RequirePermission'
import RoleService from '../services/RoleService'
import {IconSquarePlus, IconTrash} from '@tabler/icons-react'
import {useDisclosure} from '@mantine/hooks'
import {ModalContainer} from '../components/modals/ModalContainer'
import RoleCreateModal from '../components/modals/RoleCreateModal'
import {useQuery, useQueryClient} from '@tanstack/react-query'

interface RolePageState {
    selection: number[]
    toggleRow: (id: number) => void
    clearSelection: () => void
    orderList: string | undefined
    setOrderList: (key: string, direction: boolean) => void
}

export const useRolePageStore = create<RolePageState>()((set) => ({
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

function RolesPage() {
    const client = useQueryClient()
    const [activePage, setPage] = useState(1)
    const [showOnPage, setShowOnPage] = useState(5)
    const selection = useRolePageStore((state) => state.selection)
    const orderList = useRolePageStore((state) => state.orderList)
    const [createModalOpened, createModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['roles']}),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['roles']}),
    })

    const rolesQuery = useQuery({
        queryKey: ['roles', showOnPage, activePage, orderList],
        queryFn: () => RoleService.fetchRoles(showOnPage, showOnPage * (activePage - 1), orderList),
    })

    return (
        <RequirePermission permission='role_read'>
            <Stack>
                <RequirePermissionToDisplay permission='role_update'>
                    <Group>
                        <ActionIcon variant='filled' aria-label='Добавление роли' onClick={createModalHandlers.open}>
                            <IconSquarePlus style={{width: '70%', height: '70%'}} stroke={1.5} />
                        </ActionIcon>
                        {selection.length > 0 ? (
                            <ActionIcon
                                variant='filled'
                                aria-label='Удаление роли'
                                color='red'
                                onClick={deleteModalHandlers.open}
                            >
                                <IconTrash style={{width: '70%', height: '70%'}} stroke={1.5} />
                            </ActionIcon>
                        ) : (
                            <></>
                        )}
                        <ModalContainer
                            title='Добавить роль'
                            opened={createModalOpened}
                            onClose={createModalHandlers.close}
                        >
                            <RoleCreateModal close={createModalHandlers.close} />
                        </ModalContainer>

                        <ModalContainer
                            title='Удалить роли?'
                            opened={deleteModalOpened}
                            onClose={deleteModalHandlers.close}
                        >
                            <RoleDeleteModal close={deleteModalHandlers.close} />
                        </ModalContainer>
                    </Group>
                </RequirePermissionToDisplay>

                <RolesTable roles={rolesQuery.data?.roleArray} />
                {rolesQuery.data ? (
                    <Stack align='start'>
                        <Pagination
                            total={Math.ceil(rolesQuery.data.count / showOnPage)}
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

export default RolesPage
