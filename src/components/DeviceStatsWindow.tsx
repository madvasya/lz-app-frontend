import {useRef, useState, MouseEvent} from 'react'
import {Text, Group, Title, Tabs, Stack, Loader, Button} from '@mantine/core'
import DeviceService from '../services/DeviceService'
import {skipToken, useQuery, useQueryClient} from '@tanstack/react-query'
import DeviceCategoryService from '../services/DeviceCategoryService'
import {DeviceRead} from '../models/Device'
import {DateTimePicker, DatesProvider} from '@mantine/dates'
import {Chart, getElementAtEvent} from 'react-chartjs-2'
import 'chart.js/auto'
import {InteractionItem, Chart as ChartJS} from 'chart.js/auto'
import {ModalContainer} from './modals/ModalContainer'
import {useDisclosure} from '@mantine/hooks'
import EditStatRecordModal from './modals/EditStatRecordModal'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import GenerateStatsModal from './modals/GenerateStatsModal'
import DeleteStatsModal from './modals/DeleteStatsModal'
dayjs.extend(duration)

export default function DeviceStatsWindow({device}: {device: DeviceRead | undefined}) {
    const [showFrom, setShowFrom] = useState<Date | null>()
    const [showTo, setShowTo] = useState<Date | null>()
    const [activeTab, setActiveTab] = useState<string | null>()
    const client = useQueryClient()
    const {data: statTypes} = useQuery({
        queryKey: ['stat_types', device?.category_key],
        queryFn: device?.category_key
            ? async () => {
                  const data = await DeviceCategoryService.fetchStatTypesForCategory(device?.category_key)
                  if (data.length < 1) {
                      setActiveTab(null)
                  } else {
                      setActiveTab(data[0].name)
                  }
                  return data
              }
            : skipToken,
    })
    const [editModalOpened, editModalHandlers] = useDisclosure(false, {
        onClose: () =>
            client.invalidateQueries({
                queryKey: ['device_stats', device?.id, activeTab, showFrom, showTo],
            }),
    })
    const [generateModalOpened, generateModalHandlers] = useDisclosure(false, {
        onClose: () =>
            client.invalidateQueries({
                queryKey: ['device_stats', device?.id, activeTab, showFrom, showTo],
            }),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () =>
            client.invalidateQueries({
                queryKey: ['device_stats', device?.id, activeTab, showFrom, showTo],
            }),
    })
    const [modalState, setModalState] = useState<{
        id: number
        value: number
    }>({id: 0, value: 0})

    const statsQuery = useQuery({
        queryKey: ['device_stats', device?.id, activeTab, showFrom, showTo],
        queryFn:
            activeTab && device
                ? () => DeviceService.fetchDeviceStats(device.id, activeTab, undefined, undefined, showFrom, showTo)
                : skipToken,
    })
    const statsData = {
        labels: statsQuery.data?.map((row) => dayjs(row.timestamp).format('DD.MM.YY HH:mm:ss')),
        ids: statsQuery.data?.map((row) => row.id),
        datasets: [
            {
                label: activeTab ? activeTab : '',
                data: statsQuery.data?.map((row) => row.value),
                borderColor: 'rgb(34, 139, 230)',
                backgroundColor: 'rgba(34, 139, 230, 0.5)',
            },
        ],
    }

    const printElementAtEvent = (element: InteractionItem[]) => {
        if (!element.length) return

        const {datasetIndex, index} = element[0]

        console.log(statsData.ids?.[index])
        console.log(statsData.datasets[datasetIndex].data?.[index])
        const recordId = statsData.ids?.[index]
        const value = statsData.datasets[datasetIndex].data?.[index]
        if (recordId != undefined && value != undefined) {
            setModalState({id: recordId, value})
            editModalHandlers.open()
        }
    }

    const chartRef = useRef<ChartJS>(null)

    const handleGraphClick = (event: MouseEvent<HTMLCanvasElement>) => {
        const chart = chartRef.current
        if (!chart) {
            return
        }

        printElementAtEvent(getElementAtEvent(chart, event))
    }
    return device ? (
        <>
            <DatesProvider
                settings={{
                    locale: 'ru',
                    firstDayOfWeek: 1,
                    weekendDays: [0, 6],
                    timezone: 'UTC',
                }}
            >
                <Stack>
                    <Title order={3}>{device?.name}</Title>
                    <Group gap='xs'>
                        <Text size='sm' c='gray'>
                            {device?.description}
                        </Text>
                        <Text size='sm' c='gray'>
                            ·
                        </Text>
                        <Text size='sm' c='gray'>{`Device ID: ${device?.id}`}</Text>
                        <Text size='sm' c='gray'>
                            ·
                        </Text>
                        <Text size='sm' c='gray'>
                            {device?.category_name}
                        </Text>
                    </Group>
                    <Group>
                        <Text>Показывать за период: </Text>
                        <DateTimePicker clearable placeholder='c' miw={140} value={showFrom} onChange={setShowFrom} />
                        -
                        <DateTimePicker clearable miw={140} placeholder='по' value={showTo} onChange={setShowTo} />
                    </Group>
                    {statTypes?.length ? (
                        <Stack w={800}>
                            <Tabs value={activeTab} onChange={setActiveTab}>
                                <Tabs.List grow justify='space-between'>
                                    {statTypes.map((item) => (
                                        <Tabs.Tab value={item.name} key={item.id}>
                                            {item.description}
                                        </Tabs.Tab>
                                    ))}
                                </Tabs.List>
                                {statTypes.map((item) => (
                                    <Tabs.Panel value={item.name} key={item.id}>
                                        {statsQuery.isPending ? (
                                            <Text>Loading...</Text>
                                        ) : (
                                            <Chart
                                                type='line'
                                                ref={chartRef}
                                                options={{responsive: true}}
                                                data={statsData}
                                                onClick={handleGraphClick}
                                            />
                                        )}
                                    </Tabs.Panel>
                                ))}
                            </Tabs>
                            <Group>
                                <Button onClick={generateModalHandlers.open}>Сгенерировать</Button>
                                <Button color='red' onClick={deleteModalHandlers.open}>
                                    Удалить
                                </Button>
                            </Group>
                        </Stack>
                    ) : (
                        <Text size='sm' c='gray'>
                            Нет доступной статистики для устройства
                        </Text>
                    )}
                </Stack>
                <ModalContainer
                    title='Изменить значение записи'
                    opened={editModalOpened}
                    onClose={editModalHandlers.close}
                >
                    <EditStatRecordModal close={editModalHandlers.close} deviceId={device.id} record={modalState} />
                </ModalContainer>
                {activeTab && (
                    <>
                        <ModalContainer
                            title='Сгенерировать статистику'
                            opened={generateModalOpened}
                            onClose={generateModalHandlers.close}
                            closeOnClickOutside={false}
                        >
                            <GenerateStatsModal
                                close={generateModalHandlers.close}
                                deviceId={device.id}
                                type={activeTab}
                            />
                        </ModalContainer>
                        <ModalContainer
                            title='Удалить статистику за период'
                            opened={deleteModalOpened}
                            onClose={deleteModalHandlers.close}
                            closeOnClickOutside={false}
                        >
                            <DeleteStatsModal close={deleteModalHandlers.close} deviceId={device.id} type={activeTab} />
                        </ModalContainer>
                    </>
                )}
            </DatesProvider>
        </>
    ) : (
        <Loader color='blue' />
    )
}
