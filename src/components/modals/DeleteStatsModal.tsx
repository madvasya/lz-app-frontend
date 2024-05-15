import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {Text, Button, Group, Stack} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import StatsService from '../../services/StatsService'
import {AxiosError} from 'axios'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {DateTimePicker} from '@mantine/dates'
dayjs.extend(duration)

export default function DeleteStatsModal({close, deviceId, type}: {close: () => void; deviceId: number; type: string}) {
    const queryClient = useQueryClient()

    const form = useForm({
        initialValues: {
            from: new Date(),
            to: new Date(),
        },
    })

    const statsGenerateMutation = useMutation({
        mutationFn: () => StatsService.removeRecords(deviceId, type, form.values.from, form.values.to),
        onSuccess: (data) => {
            notifications.show({
                message: data,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['device_stats', deviceId]})
            statsGenerateMutation.reset()
            close()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.data.detail[0].msg) {
                    setErrMsg(error.response?.data.detail[0].msg)
                } else {
                    setErrMsg(error.response?.data.detail)
                }
            }
        },
    })

    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef<HTMLDivElement>(null!)

    return (
        <Stack>
            <Group gap='xs'>
                <Text size='sm' c='gray'>
                    {`Тип: ${type}`}
                </Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>{`Device ID: ${deviceId}`}</Text>
            </Group>
            <form onSubmit={form.onSubmit(() => statsGenerateMutation.mutate())}>
                <Stack>
                    <Text>Удалить за промежуток: </Text>
                    <Group justify='space-between' grow preventGrowOverflow={false}>
                        <DateTimePicker placeholder='c' required {...form.getInputProps('from')} />
                        -
                        <DateTimePicker placeholder='по' {...form.getInputProps('to')} minDate={form.values.from} />
                    </Group>
                    <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                        {errMsg}
                    </Text>
                </Stack>
                <Group justify='flex-end' mt='xl'>
                    <Button type='submit' color='red'>
                        Удалить
                    </Button>
                </Group>
            </form>
        </Stack>
    )
}
