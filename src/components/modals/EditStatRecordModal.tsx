import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Button, Group} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import StatsService from '../../services/StatsService'
import {AxiosError} from 'axios'

export default function EditStatRecordModal({
    close,
    deviceId,
    record,
}: {
    close: () => void
    deviceId: number
    record: {id: number; value: number}
}) {
    const queryClient = useQueryClient()

    const form = useForm({
        initialValues: {
            value: record.value,
        },
    })

    const statsEditMutation = useMutation({
        mutationFn: (newValue: number) => StatsService.editRecord(deviceId, record.id, newValue),
        onSuccess: () => {
            notifications.show({
                message: `Информация успешно изменена`,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['device_stats', deviceId]})
            statsEditMutation.reset()
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
        <form onSubmit={form.onSubmit((values) => statsEditMutation.mutate(values.value))}>
            <TextInput mt='md' label='Значение' placeholder='value' {...form.getInputProps('value')} />
            <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                {errMsg}
            </Text>
            <Group justify='flex-end' mt='xl'>
                <Button type='submit'>Сохранить</Button>
            </Group>
        </form>
    )
}
