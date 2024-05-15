import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group} from '@mantine/core'
import {randomId} from '@mantine/hooks'
import {notifications} from '@mantine/notifications'
import {RoomCreate} from '../../models/Room'
import RoomService from '../../services/RoomService'

export default function RoomCreateModal({close}: {close: () => void}) {
    const form = useForm({
        initialValues: {
            name: '',
            area: 1,
            description: '',
        },
    })
    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef<HTMLDivElement>(null!)

    async function handleCreate(formData: RoomCreate) {
        try {
            const response = await RoomService.createRoom(formData)
            notifications.show({
                message: `Комната '${response.name}' успешно добавленa`,
                color: 'green',
            })
            close()
        } catch (err: any) {
            //console.log(err)
            //console.log(err.response?.data?.detail)
            if (!err?.response) {
                setErrMsg('No server response')
            } else if (err.response?.status === 409) {
                setErrMsg(err.response?.data.detail)
            } else {
                setErrMsg('Unknown error')
                console.log(err.response?.data)
            }
            errRef.current.focus()
        }
    }

    return (
        <Box>
            <form onSubmit={form.onSubmit((values) => handleCreate(values))}>
                <TextInput label='Название комнаты' placeholder='name' {...form.getInputProps('name')} required />
                <TextInput mt='md' label='Описание' placeholder='description' {...form.getInputProps('description')} />
                <TextInput mt='md' label='Площадь' placeholder='area' {...form.getInputProps('area')} />
                <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                    {errMsg}
                </Text>
                <Group justify='flex-start' mt='xl'>
                    <Button
                        variant='outline'
                        onClick={() =>
                            form.setValues({
                                name: randomId(),
                                description: randomId(),
                            })
                        }
                    >
                        Сгенерировать
                    </Button>
                    <Button type='submit'>Добавить</Button>
                </Group>
            </form>
        </Box>
    )
}
