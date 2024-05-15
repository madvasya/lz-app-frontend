import RequirePermission from '../components/RequirePermission'
import {useState} from 'react'
import {Button, Flex, Box, NavLink, Divider, ScrollArea, CloseButton, Text, Stack, Select} from '@mantine/core'
import {IconFilter} from '@tabler/icons-react'
import {useDisclosure, useViewportSize} from '@mantine/hooks'
import {useQuery} from '@tanstack/react-query'
import DeviceService from '../services/DeviceService'
import DeviceStatsWindow from '../components/DeviceStatsWindow'
import DeviceCategoryService from '../services/DeviceCategoryService'
import RoomService from '../services/RoomService'

function StatsPage() {
    const [roomFilter, setRoomFilter] = useState<string | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<string | null>()

    const [filterDropdownOpened, filterDropdownHandlers] = useDisclosure(false)
    const [active, setActive] = useState<number | undefined>()

    const {data: devices} = useQuery({
        queryKey: ['devices', roomFilter, categoryFilter],
        queryFn: async () => {
            const data = await DeviceService.fetchDevices(
                undefined,
                undefined,
                roomFilter ? roomFilter : undefined,
                categoryFilter ? categoryFilter : undefined
            )
            if (data.count > 0) {
                setActive(data.deviceArray[0].id)
            }
            return data
        },
    })
    const {data: rooms} = useQuery({
        queryKey: ['rooms'],
        queryFn: () => RoomService.fetchRooms(),
    })
    const {data: categories} = useQuery({
        queryKey: ['deviceCategories'],
        queryFn: () => DeviceCategoryService.fetchExistingCategories(),
    })

    const links = devices?.deviceArray.map((item) => (
        <NavLink
            active={item.id === active || undefined}
            key={item.id}
            onClick={() => setActive(item.id)}
            label={item.name}
        />
    ))

    return (
        <RequirePermission permission='room_read'>
            <Flex justify='flex-start' align='flex-start' direction='row' wrap='nowrap' gap='md'>
                <Box>
                    {filterDropdownOpened ? (
                        <Stack>
                            <CloseButton onClick={filterDropdownHandlers.close} />
                            <Select
                                placeholder='Категория'
                                clearable
                                onChange={setCategoryFilter}
                                value={categoryFilter}
                                data={categories?.map((item) => ({
                                    label: item.name,
                                    value: String(item.id),
                                }))}
                            />
                            <Select
                                placeholder='Комната'
                                clearable
                                onChange={setRoomFilter}
                                value={roomFilter}
                                data={rooms?.roomArray?.map((item) => ({
                                    label: item.name,
                                    value: String(item.id),
                                }))}
                            />
                        </Stack>
                    ) : (
                        <Button
                            variant='outline'
                            aria-label='Фильтры для статистики'
                            onClick={filterDropdownHandlers.open}
                            leftSection={<IconFilter style={{width: '80%', height: '80%'}} stroke={1.5} />}
                        >
                            Фильтр
                        </Button>
                    )}
                    <Divider my='md' />
                    <ScrollArea h={useViewportSize().height - 170} miw={200}>
                        {links}
                    </ScrollArea>
                </Box>
                {active && devices ? (
                    <DeviceStatsWindow device={devices?.deviceArray.find((i) => i.id === active)} />
                ) : (
                    <Text>Выберите устройство, чтобы просмотреть статистику</Text>
                )}
            </Flex>
        </RequirePermission>
    )
}

export default StatsPage
