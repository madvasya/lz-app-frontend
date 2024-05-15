import {useEffect, useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, Title, Space} from '@mantine/core'
import {RoomUpdate} from '../../models/Room'
import RoomService from '../../services/RoomService'
import {notifications} from '@mantine/notifications'
import {useQuery} from '@tanstack/react-query'

export default function RoomEditModal({close, roomId}: {close: () => void; roomId: number}) {
    const {data} = useQuery({
        queryKey: ['room', roomId],
        queryFn: () => RoomService.fetchRoom(roomId),
    })

    const form = useForm({
        initialValues: {
            name: '',
            area: 0,
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
    const errRef = useRef<HTMLDivElement>(null!)

    async function handleEdit(formData: RoomUpdate) {
        try {
            if (form.isDirty()) {
                const response = await RoomService.editRoom(roomId, formData)
                notifications.show({
                    message: `Данные о комнате '${response.name}' успешно изменены`,
                    color: 'green',
                })
            }
            close()
        } catch (err: any) {
            //console.log(err)
            //console.log(err.response?.data?.detail)
            if (!err?.response) {
                setErrMsg('No server response')
            } else if (err.response?.status === 409) {
                setErrMsg(err.response?.data.detail)
            } else {
                setErrMsg('Неизвестная ошибка')
                console.log(err.response?.data)
            }
            errRef.current.focus()
        }
    }

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
                <Text size='sm' c='gray'>{`Room ID: ${data?.id}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>
                    {`${data?.area} кв.м`}
                </Text>
            </Group>
            <Space h='md' />
            <form onSubmit={form.onSubmit((values) => handleEdit(values))}>
                <TextInput label='Имя' placeholder='name' {...form.getInputProps('name')} />
                <TextInput mt='md' label='Площадь' placeholder='area' {...form.getInputProps('area')} />
                <TextInput mt='md' label='Описание' placeholder='description' {...form.getInputProps('description')} />
                <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                    {errMsg}
                </Text>
                <Group justify='flex-end' mt='xl'>
                    <Button type='submit'>Сохранить</Button>
                </Group>
            </form>
        </Box>
    )
}
