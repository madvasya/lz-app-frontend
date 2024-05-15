import {useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, NativeSelect} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {DeviceCreate} from '../../models/Device'
import DeviceService from '../../services/DeviceService'
import {useMutation, useQuery} from '@tanstack/react-query'
import {DeviceConfigField} from '../../models/Config'
import DeviceCategoryService from '../../services/DeviceCategoryService'
import {AxiosError} from 'axios'

export default function DeviceCreateModal({close, room_id}: {close: () => void; room_id: number}) {
    const [errMsg, setErrMsg] = useState('')
    const deviceCreateMutation = useMutation({
        mutationFn: ({device, config}: {device: DeviceCreate; config: DeviceConfigField[]}) => {
            return DeviceService.createDevice(device, config)
        },
        onSuccess: (data) => {
            notifications.show({
                message: `Устройство '${data.name}' успешно добавленo`,
                color: 'green',
            })
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

    interface FormValues {
        device: {
            name: string
            description: string
            room_id: number
            category_key: string
        }
        config: DeviceConfigField[]
    }

    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        initialValues: {
            device: {
                name: '',
                description: '',
                room_id: room_id,
                category_key: 'lamp',
            },
            config: [],
        },
    })

    const categoriesQuery = useQuery({
        queryKey: ['deviceCategories'],
        queryFn: () => DeviceCategoryService.fetchExistingCategories(),
    })

    const configTemplateQuery = useQuery({
        queryKey: ['configTemplate', form.getValues().device.category_key],
        queryFn: async () => {
            const data = await DeviceCategoryService.getConfigTemplate(form.getTransformedValues().device.category_key)
            form.setFieldValue(
                'config',
                data?.map((item) => ({
                    field_name: item.field_name,
                    value: item.default_value,
                }))
            )
            form.resetDirty()
            return data
        },
    })

    return (
        <Box>
            <form
                onSubmit={form.onSubmit((values) => {
                    const device = values.device
                    const config = values.config.filter((field) => field.value != null)
                    deviceCreateMutation.mutate({device, config})
                })}
            >
                <TextInput label='Имя устройства' placeholder='name' {...form.getInputProps('device.name')} required />
                <TextInput
                    mt='md'
                    label='Описание устройства'
                    placeholder='description'
                    {...form.getInputProps('device.description')}
                    required
                />

                <NativeSelect
                    label='Категория устройства'
                    {...form.getInputProps('device.category_key')}
                    onChange={(event) => form.setFieldValue('device.category_key', event.currentTarget.value)}
                    data={categoriesQuery.data?.map((item) => ({
                        label: item.name,
                        value: item.category_key,
                    }))}
                />

                {configTemplateQuery.data?.map((field, index) => (
                    <TextInput
                        label={field.field_name}
                        description={field.field_description}
                        placeholder={field.default_value}
                        key={form.key(`config.${index}.field_name`)}
                        {...form.getInputProps(`config.${index}.value`)}
                        required={!field.is_optional}
                    />
                ))}

                <Group justify='flex-start' mt='xl'>
                    <Button type='submit'>Добавить</Button>
                </Group>
                {deviceCreateMutation.isError && <Text onClick={() => deviceCreateMutation.reset()}>{errMsg}</Text>}
            </form>
        </Box>
    )
}
