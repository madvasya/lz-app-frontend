import {useEffect, useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, Title, Space} from '@mantine/core'
import {UserUpdate} from '../../models/User'
import UserService from '../../services/UserService'
import {notifications} from '@mantine/notifications'
import {useQuery} from '@tanstack/react-query'
import date from 'date-and-time'

export default function UserEditModal({close, userId}: {close: () => void; userId: number}) {
    const {data} = useQuery({queryKey: ['user', userId], queryFn: () => UserService.fetchUser(userId)})

    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            full_name: '',
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

    async function handleEdit(formData: UserUpdate) {
        try {
            if (form.isDirty()) {
                const response = await UserService.updateUser(formData, userId)
                notifications.show({
                    message: `Данные о пользователе '${response.data.username}' успешно изменены`,
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
            <Title order={3}>{data?.full_name}</Title>
            <Group gap='xs'>
                <Text size='sm' c='gray'>{`@${data?.username}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>{`User ID: ${data?.id}`}</Text>
                <Text size='sm' c='gray'>
                    ·
                </Text>
                <Text size='sm' c='gray'>
                    {data ? `Last edited on ${date.format(new Date(data?.edited_on), 'ddd, DD.MM.YYYY')}` : ''}
                </Text>
            </Group>
            <Space h='md' />
            <form onSubmit={form.onSubmit((values) => handleEdit(values))}>
                <TextInput label='Имя' placeholder='username' {...form.getInputProps('username')} />
                <TextInput mt='md' label='Email' placeholder='email' {...form.getInputProps('email')} />
                <TextInput mt='md' label='Полное имя' placeholder='full_name' {...form.getInputProps('full_name')} />
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
