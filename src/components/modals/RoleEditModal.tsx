import {useEffect, useState} from 'react'
import {
    Text,
    Box,
    Button,
    Group,
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
    TextInput,
} from '@mantine/core'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import RoleService from '../../services/RoleService'
import {useDisclosure} from '@mantine/hooks'
import {AxiosError} from 'axios'
import PermissionService from '../../services/PermissionService'
import {useForm} from '@mantine/form'
import {RoleUpdate} from '../../models/Role'

export default function RoleEditModal({roleId}: {close: () => void; roleId: number}) {
    const [search, setSearch] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [editErrMsg, setEditErrMsg] = useState('')
    const [assignDropdownOpened, assignDropdownHandlers] = useDisclosure(false)
    const [permissionsToRemove, setPermissionsToRemove] = useState<string[]>([])
    const [permissionsToAssign, setRolesToAssign] = useState<string[]>([])
    const queryClient = useQueryClient()
    const roleQuery = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => RoleService.fetchRole(roleId),
    })
    const permissionsQuery = useQuery({
        queryKey: ['role_permissions', roleId],
        queryFn: () => RoleService.fetchRolePermissions(roleId),
    })
    const allPermissionsQuery = useQuery({
        queryKey: ['permissions'],
        queryFn: () => PermissionService.fetchPermissions(),
    })

    const roleEditMutation = useMutation({
        mutationFn: (formData: RoleUpdate) => {
            return RoleService.editRole(roleId, formData)
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['role', roleId], data)
            roleEditMutation.reset()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                setEditErrMsg(error.response?.data.detail)
            }
        },
    })

    const permissionsAssignMutation = useMutation({
        mutationFn: () => RoleService.assignPermissions(roleId, permissionsToAssign),
        onSuccess: (data) => {
            queryClient.setQueryData(['role_permissions', roleId], data)
            setRolesToAssign([])
            permissionsAssignMutation.reset()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                setErrMsg(error.response?.data.detail)
            }
        },
    })

    const permissionRemoveMutation = useMutation({
        mutationFn: () => RoleService.unassignPermissions(roleId, permissionsToRemove),
        onSuccess: (data) => {
            queryClient.setQueryData(['role_permissions', roleId], data)
            setPermissionsToRemove([])
        },
    })

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    })

    const handleValueSelect = (val: string) =>
        setRolesToAssign((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]))

    const handleValueRemove = (val: string) => setRolesToAssign((current) => current.filter((v) => v !== val))

    const selectedRoles = permissionsToAssign.map((role) => (
        <Pill key={role} withRemoveButton onRemove={() => handleValueRemove(role)}>
            {role}
        </Pill>
    ))

    const options = allPermissionsQuery.data
        ?.filter((item) => item.permission_key.toLowerCase().includes(search.trim().toLowerCase()))
        .map((item) => (
            <Combobox.Option
                value={item.permission_key}
                key={item.permission_key}
                active={permissionsToAssign.includes(item.permission_key)}
            >
                <Group gap='sm'>
                    {permissionsToAssign.includes(item.permission_key) ? <CheckIcon size={12} /> : null}
                    <span>{item.permission_key}</span>
                </Group>
            </Combobox.Option>
        ))

    const toggleAll = () =>
        setPermissionsToRemove((current) =>
            permissionsQuery.data
                ? current.length === permissionsQuery.data.length
                    ? []
                    : permissionsQuery.data.map((permission) => permission.permission_key)
                : []
        )

    const rows = permissionsQuery.data?.map((permission) => {
        return (
            <Table.Tr key={permission.permission_key}>
                <Table.Td>
                    <Group justify='flex-start'>
                        <Checkbox
                            checked={permissionsToRemove.includes(permission.permission_key)}
                            onChange={(event) =>
                                setPermissionsToRemove(
                                    event.currentTarget.checked
                                        ? [...permissionsToRemove, permission.permission_key]
                                        : permissionsToRemove.filter((name) => name !== permission.permission_key)
                                )
                            }
                        />
                    </Group>
                </Table.Td>
                <Table.Td>{permission.permission_key}</Table.Td>
                <Table.Td>{permission.description}</Table.Td>
            </Table.Tr>
        )
    })

    const roleEditForm = useForm({
        initialValues: {
            name: '',
            description: '',
        },
        enhanceGetInputProps: (payload) => {
            if (!payload.form.initialized) {
                return {disabled: true}
            }

            return {}
        },
    })

    useEffect(() => {
        if (roleQuery.data) {
            roleEditForm.initialize(roleQuery.data)
        }
    }, [roleQuery.data])

    return (
        <Box>
            <form onSubmit={roleEditForm.onSubmit((values) => roleEditMutation.mutate(values))}>
                <Group gap='sm' justify='flex-start' grow>
                    <TextInput
                        label='Имя'
                        placeholder='name'
                        maxLength={30}
                        w={100}
                        {...roleEditForm.getInputProps('name')}
                    />
                    <TextInput
                        label='Описание'
                        placeholder='description'
                        {...roleEditForm.getInputProps('description')}
                    />
                </Group>
                <Button type='submit' fullWidth size='compact-sm' mt='xs'>
                    Сохранить
                </Button>
                {roleEditMutation.isError && <Text onClick={() => roleEditMutation.reset()}>{editErrMsg}</Text>}
            </form>
            <Space h='md' />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            <Checkbox
                                onChange={toggleAll}
                                checked={
                                    permissionsToRemove.length === permissionsQuery.data?.length &&
                                    permissionsToRemove.length > 0
                                }
                                indeterminate={
                                    permissionsToRemove.length > 0 &&
                                    permissionsToRemove.length !== permissionsQuery.data?.length
                                }
                            />
                        </Table.Th>
                        <Table.Th>Имя роли</Table.Th>
                        <Table.Th>Описание</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            <Stack>
                <Group>
                    <Button
                        color='red'
                        onClick={() => permissionRemoveMutation.mutate()}
                        loading={permissionRemoveMutation.isPending}
                        disabled={permissionsToRemove.length < 1}
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
                                                placeholder='Найти права'
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
                            onClick={() => permissionsAssignMutation.mutate()}
                            loading={permissionsAssignMutation.isPending}
                            disabled={permissionsToAssign.length < 1}
                        >
                            Сохранить
                        </Button>
                        {permissionsAssignMutation.isError && (
                            <Text onClick={() => permissionsAssignMutation.reset()}>{errMsg}</Text>
                        )}
                    </>
                ) : null}
            </Stack>
        </Box>
    )
}
