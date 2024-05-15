import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {Text, Button, Group, Stack, NumberInput} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import StatsService from '../../services/StatsService'
import {AxiosError} from 'axios'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {DateTimePicker} from '@mantine/dates'
dayjs.extend(duration)

export default function GenerateStatsModal({
    close,
    deviceId,
    type,
}: {
    close: () => void
    deviceId: number
    type: string
}) {
    const queryClient = useQueryClient()

    const form = useForm({
        initialValues: {
            from: new Date(),
            to: new Date(),
            periodD: 0,
            periodH: 0,
            periodM: 0,
            periodS: 0,
        },
        transformValues: (values) => ({
            period: dayjs
                .duration({
                    days: values.periodD,
                    hours: values.periodH,
                    minutes: values.periodM,
                    seconds: values.periodS,
                })
                .toISOString(),
        }),
    })

    const statsGenerateMutation = useMutation({
        mutationFn: () =>
            StatsService.generateStats(
                deviceId,
                type,
                form.values.from,
                form.values.to,
                form.getTransformedValues().period
            ),
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
                    <Text>Сгенерировать за промежуток: </Text>
                    <Group justify='space-between' grow preventGrowOverflow={false}>
                        <DateTimePicker placeholder='c' required {...form.getInputProps('from')} />
                        -
                        <DateTimePicker placeholder='по' {...form.getInputProps('to')} minDate={form.values.from} />
                    </Group>
                    <Text>Период между записями: </Text>
                    <Group justify='space-between' grow>
                        <NumberInput placeholder='DD' label='Дней' {...form.getInputProps('periodD')} />
                        <NumberInput placeholder='HH' label='Часов' {...form.getInputProps('periodH')} />
                        <NumberInput placeholder='mm' label='Минут' {...form.getInputProps('periodM')} />
                        <NumberInput placeholder='ss' label='Секунд' {...form.getInputProps('periodS')} />
                    </Group>
                    <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                        {errMsg}
                    </Text>
                </Stack>
                <Group justify='flex-end' mt='xl'>
                    <Button type='submit'>Сгенерировать</Button>
                </Group>
            </form>
        </Stack>
    )
}
