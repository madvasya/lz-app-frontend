import {useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, Title, Space} from '@mantine/core'
import DeviceService from '../../services/DeviceService'
import {notifications} from '@mantine/notifications'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'
import {DeviceConfigField} from '../../models/Config'

export default function DeviceConfigModal({close, deviceId}: {close: () => void; deviceId: number}) {
    interface FormValues {
        config: DeviceConfigField[]
    }
    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        initialValues: {
            config: [],
        },
    })

    const {data} = useQuery({
        queryKey: ['device', deviceId],
        queryFn: () => DeviceService.fetchDevice(deviceId),
    })

    const configQuery = useQuery({
        queryKey: ['existingConfig', deviceId],
        queryFn: async () => {
            const data = await DeviceService.fetchDeviceConfig(deviceId)
            form.setFieldValue('config', data)
            form.resetDirty()
            return data
        },
    })

    const [errMsg, setErrMsg] = useState('')
    const queryClient = useQueryClient()
    const deviceConfigMutation = useMutation({
        mutationFn: (updatedFields: DeviceConfigField[]) => DeviceService.editDeviceConfig(deviceId, updatedFields),
        onSuccess: () => {
            notifications.show({
                message: `Конфигурация устройства успешно изменена`,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['devices']})
            deviceConfigMutation.reset()
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
                    let config: DeviceConfigField[] = []
                    for (let key in values.config) {
                        if (form.isDirty(`config.${key}`)) {
                            config.push(values.config[key])
                        }
                    }
                    deviceConfigMutation.mutate(config)
                })}
            >
                {configQuery.data?.map((field, index) => (
                    <TextInput
                        label={field.field_name}
                        description={field.description}
                        key={form.key(`config.${index}.field_name`)}
                        {...form.getInputProps(`config.${index}.value`)}
                    />
                ))}
                {configQuery.data?.length ? (
                    <Group justify='flex-end' mt='xl'>
                        <Button type='submit'>Сохранить</Button>
                    </Group>
                ) : (
                    <Text>No available config fields for device</Text>
                )}
                {deviceConfigMutation.isError && <Text onClick={() => deviceConfigMutation.reset()}>{errMsg}</Text>}
            </form>
        </Box>
    )
}
