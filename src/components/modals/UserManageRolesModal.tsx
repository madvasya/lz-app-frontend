import {useState} from 'react'
import {
    Text,
    Box,
    Button,
    Group,
    Title,
    Space,
    useCombobox,
    Pill,
    CheckIcon,
    Combobox,
    PillsInput,
    ScrollArea,
    Table,
    Checkbox,
    Stack,
} from '@mantine/core'
import UserService from '../../services/UserService'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import date from 'date-and-time'
import RoleService from '../../services/RoleService'
import {useDisclosure} from '@mantine/hooks'
import {AxiosError} from 'axios'

export default function UserManageRolesModal({userId}: {close: () => void; userId: number}) {
    const [search, setSearch] = useState('')
    const [assignDropdownOpened, assignDropdownHandlers] = useDisclosure(false)
    const [rolesToRemove, setRolesToRemove] = useState<string[]>([])
    const [rolesToAssign, setRolesToAssign] = useState<string[]>([])
    const queryClient = useQueryClient()
    const userQuery = useQuery({
        queryKey: ['user', userId],
        queryFn: () => UserService.fetchUser(userId),
    })
    const roleQuery = useQuery({
        queryKey: ['user_roles', userId],
        queryFn: () => UserService.fetchUserRoles(userId),
    })
    const allRolesQuery = useQuery({
        queryKey: ['roles'],
        queryFn: () => RoleService.fetchRoles(),
    })

    const roleAssignMutation = useMutation({
        mutationFn: () => UserService.assignRoles(userId, rolesToAssign),
        onSuccess: (data) => {
            queryClient.setQueryData(['user_roles', userId], data)
            setRolesToAssign([])
            roleAssignMutation.reset()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                setErrMsg(error.response?.data.detail)
            }
        },
    })

    const roleRemoveMutation = useMutation({
        mutationFn: () => UserService.unassignRoles(userId, rolesToRemove),
        onSuccess: (data) => {
            queryClient.setQueryData(['user_roles', userId], data)
            setRolesToRemove([])
        },
    })

    const [errMsg, setErrMsg] = useState('')

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    })

    const handleValueSelect = (val: string) =>
        setRolesToAssign((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]))

    const handleValueRemove = (val: string) => setRolesToAssign((current) => current.filter((v) => v !== val))

    const selectedRoles = rolesToAssign.map((role) => (
        <Pill key={role} withRemoveButton onRemove={() => handleValueRemove(role)}>
            {role}
        </Pill>
    ))

    const options = allRolesQuery.data?.roleArray
        ?.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
        .map((item) => (
            <Combobox.Option value={item.name} key={item.id} active={rolesToAssign.includes(item.name)}>
                <Group gap='sm'>
                    {rolesToAssign.includes(item.name) ? <CheckIcon size={12} /> : null}
                    <span>{item.name}</span>
                </Group>
            </Combobox.Option>
        ))

    const toggleAll = () =>
        setRolesToRemove((current) =>
            roleQuery.data
                ? current.length === roleQuery.data.length
                    ? []
                    : roleQuery.data.map((role) => role.name)
                : []
        )

    const rows = roleQuery.data?.map((role) => {
        return (
            <Table.Tr key={role.id}>
                <Table.Td>
                    <Group justify='flex-start'>
                        <Checkbox
                            checked={rolesToRemove.includes(role.name)}
                            onChange={(event) =>
                                setRolesToRemove(
                                    event.currentTarget.checked
                                        ? [...rolesToRemove, role.name]
                                        : rolesToRemove.filter((name) => name !== role.name)
                                )
                            }
                        />
                    </Group>
                </Table.Td>
                <Table.Td>{role.id}</Table.Td>
                <Table.Td>{role.name}</Table.Td>
                <Table.Td>{role.description}</Table.Td>
            </Table.Tr>
        )
    })

    return (
        <Box>
            <Title order={3}>{userQuery.data?.full_name}</Title>
            <Group gap='xs'>
                <Text size='sm' c='gray'>{`@${userQuery.data?.username}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>{`User ID: ${userQuery.data?.id}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>
                    {userQuery.data
                        ? `Last edited on ${date.format(new Date(userQuery.data?.edited_on), 'ddd, DD.MM.YYYY')}`
                        : ''}
                </Text>
            </Group>
            <Space h='md' />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            <Checkbox
                                onChange={toggleAll}
                                checked={rolesToRemove.length === roleQuery.data?.length}
                                indeterminate={
                                    rolesToRemove.length > 0 && rolesToRemove.length !== roleQuery.data?.length
                                }
                            />
                        </Table.Th>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Название роли</Table.Th>
                        <Table.Th>Описание</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            <Stack>
                <Group>
                    <Button
                        color='red'
                        onClick={() => roleRemoveMutation.mutate()}
                        loading={roleRemoveMutation.isPending}
                        disabled={rolesToRemove.length < 1}
                    >
                        Удалить
                    </Button>
                    <Button onClick={assignDropdownHandlers.toggle}>Добавить</Button>
                </Group>

                {assignDropdownOpened ? (
                    <>
                        <Combobox store={combobox} onOptionSubmit={handleValueSelect} position='bottom'>
                            <Combobox.DropdownTarget>
                                <PillsInput onClick={() => combobox.openDropdown()}>
                                    <Pill.Group>
                                        {selectedRoles}

                                        <Combobox.EventsTarget>
                                            <PillsInput.Field
                                                onFocus={() => combobox.openDropdown()}
                                                onBlur={() => combobox.closeDropdown()}
                                                value={search}
                                                placeholder='Найти роли'
                                                onChange={(event) => {
                                                    combobox.updateSelectedOptionIndex()
                                                    setSearch(event.currentTarget.value)
                                                }}
                                            />
                                        </Combobox.EventsTarget>
                                    </Pill.Group>
                                </PillsInput>
                            </Combobox.DropdownTarget>

                            <Combobox.Dropdown>
                                <Combobox.Options>
                                    <ScrollArea.Autosize mah={200} type='scroll'>
                                        {options ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
                                    </ScrollArea.Autosize>
                                </Combobox.Options>
                            </Combobox.Dropdown>
                        </Combobox>
                        <Button
                            onClick={() => roleAssignMutation.mutate()}
                            loading={roleAssignMutation.isPending}
                            disabled={rolesToAssign.length < 1}
                        >
                            Сохранить
                        </Button>
                        {roleAssignMutation.isError && <Text onClick={() => roleAssignMutation.reset()}>{errMsg}</Text>}
                    </>
                ) : null}
            </Stack>
        </Box>
    )
}
