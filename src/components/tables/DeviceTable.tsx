import {ActionIcon, Checkbox, Group, Table, rem} from '@mantine/core'
import {useDeviceTableStore} from '../../pages/RoomProfile'
import {IconAdjustmentsHorizontal, IconArrowsMove, IconPencil} from '@tabler/icons-react'
import {DeviceRead} from '../../models/Device'
import {ModalContainer} from '../modals/ModalContainer'
import {useDisclosure} from '@mantine/hooks'
import {useQueryClient} from '@tanstack/react-query'
import DeviceEditModal from '../modals/DeviceEditModal'
import {useState} from 'react'
import SortedTh from './SortedColumnHeader'
import ActionMenuContainer from '../menus/ActionMenuContainer'
import DeviceConfigModal from '../modals/DeviceConfigModal'
import DeviceMoveModal from '../modals/DeviceMoveModal'

export default function DevicesTable({devices}: {devices: DeviceRead[] | undefined}) {
    const selection = useDeviceTableStore((state) => state.selection)
    const toggleRow = useDeviceTableStore((state) => state.toggleRow)
    const [deviceToEdit, setDeviceToEdit] = useState(0)
    const client = useQueryClient()
    const [editModalOpened, editModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['devices']}),
    })
    const [configModalOpened, configModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['devices']}),
    })
    const [moveModalOpened, moveModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['devices']}),
    })

    const [reverseSortDirection, setReverseSortDirection] = useState(false)
    const [sortBy, setSortBy] = useState<string | undefined>()
    const setOrderList = useDeviceTableStore((state) => state.setOrderList)
    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false
        setReverseSortDirection(reversed)
        setSortBy(field)
        setOrderList(field, reversed)
    }

    const deviceMenuItems = [
        {
            icon: <IconPencil style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Редактировать',
            action: editModalHandlers.open,
            color: undefined,
        },
        {
            icon: <IconAdjustmentsHorizontal style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Конфигурация',
            action: configModalHandlers.open,
            color: undefined,
        },
        {
            icon: <IconArrowsMove style={{width: rem(16), height: rem(16)}} stroke={1.5} />,
            name: 'Переместить',
            action: moveModalHandlers.open,
            color: undefined,
        },
    ]

    function deviceEditMenu(deviceId: number) {
        return (
            <ActionMenuContainer
                items={deviceMenuItems}
                target={
                    <ActionIcon variant='subtle' color='gray' onClick={() => setDeviceToEdit(deviceId)}>
                        <IconPencil style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                    </ActionIcon>
                }
            />
        )
    }

    const rows = devices?.map((device) => {
        return (
            <Table.Tr key={device.id}>
                <Table.Td w={100}>
                    <Group justify='flex-start'>
                        <Checkbox checked={selection.includes(device.id)} onChange={() => toggleRow(device.id)} />
                        {deviceEditMenu(device.id)}
                    </Group>
                </Table.Td>
                <Table.Td w={80}>{device.id}</Table.Td>
                <Table.Td w={150}>{device.name}</Table.Td>
                <Table.Td w={80}>{device.category_name}</Table.Td>
                <Table.Td>{device.description}</Table.Td>
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
                            Device name
                        </SortedTh>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Description</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            <ModalContainer
                title='Редактирование устройства'
                opened={editModalOpened}
                onClose={editModalHandlers.close}
            >
                <DeviceEditModal close={editModalHandlers.close} deviceId={deviceToEdit} />
            </ModalContainer>
            <ModalContainer title='Настройка устройства' opened={configModalOpened} onClose={configModalHandlers.close}>
                <DeviceConfigModal close={configModalHandlers.close} deviceId={deviceToEdit} />
            </ModalContainer>
            <ModalContainer title='Переместить устройство' opened={moveModalOpened} onClose={moveModalHandlers.close}>
                <DeviceMoveModal close={moveModalHandlers.close} deviceId={deviceToEdit} />
            </ModalContainer>
        </div>
    )
}
