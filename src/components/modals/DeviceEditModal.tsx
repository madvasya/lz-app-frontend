import {useEffect, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, Title, Space} from '@mantine/core'
import {DeviceUpdate} from '../../models/Device'
import DeviceService from '../../services/DeviceService'
import {notifications} from '@mantine/notifications'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'

export default function DeviceEditModal({close, deviceId}: {close: () => void; deviceId: number}) {
    const {data} = useQuery({
        queryKey: ['device', deviceId],
        queryFn: () => DeviceService.fetchDevice(deviceId),
    })

    const form = useForm({
        mode: 'uncontrolled',
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
        if (data) {
            form.initialize(data)
        }
    }, [data])

    const [errMsg, setErrMsg] = useState('')
    const queryClient = useQueryClient()
    const deviceEditMutation = useMutation({
        mutationFn: (updatedDevice: DeviceUpdate) => DeviceService.editDevice(deviceId, updatedDevice),
        onSuccess: (data) => {
            notifications.show({
                message: `Информация об устройстве '${data.name}' успешно изменена`,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['devices']})
            deviceEditMutation.reset()
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

    return (
        <Box>
            <Title order={3}>{data?.name}</Title>
            <Group gap='xs'>
                <Text size='sm' c='gray'>
                    {data?.description}
                </Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>{`Device ID: ${data?.id}`}</Text>
            </Group>
            <Space h='md' />
            <form
                onSubmit={form.onSubmit(<T extends typeof form.values>(values: T) => {
                    console.log(values)
                    for (let key in values) {
                        if (!form.isDirty(key)) {
                            delete values[key]
                        }
                    }
                    console.log(values)
                    deviceEditMutation.mutate(values)
                })}
            >
                <TextInput label='Имя устройства' placeholder='name' {...form.getInputProps('name')} />
                <TextInput mt='md' label='Описание' placeholder='description' {...form.getInputProps('description')} />
                <Group justify='flex-end' mt='xl'>
                    <Button type='submit'>Сохранить</Button>
                </Group>
                {deviceEditMutation.isError && <Text onClick={() => deviceEditMutation.reset()}>{errMsg}</Text>}
            </form>
        </Box>
    )
}
