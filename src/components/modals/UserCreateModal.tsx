import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {TextInput, PasswordInput, Text, Box, Button, Group} from '@mantine/core'
import {UserCreate} from '../../models/User'
import UserService from '../../services/UserService'
import {notifications} from '@mantine/notifications'

export default function UserCreateModal({close}: {close: () => void}) {
    const [_, setOpened] = useState(false)
    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            full_name: '',
            password: '',
        },
    })
    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef<HTMLDivElement>(null!)

    async function handleCreate(formData: UserCreate) {
        try {
            const response = await UserService.createUser(formData)
            notifications.show({
                message: `Пользователь '${response.data.username}' успешно добавлен`,
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
                setErrMsg('Неизвестная ошибка')
                console.log(err.response?.data)
            }
            errRef.current.focus()
        }
    }

    return (
        <Box>
            <form onSubmit={form.onSubmit((values) => handleCreate(values))}>
                <TextInput
                    label='Имя'
                    placeholder='username'
                    {...form.getInputProps('username')}
                    required
                    autoComplete='new-password'
                />
                <TextInput mt='md' label='Email' placeholder='email' {...form.getInputProps('email')} required />
                <TextInput
                    mt='md'
                    label='Полное имя'
                    placeholder='full_name'
                    {...form.getInputProps('full_name')}
                    required
                />
                <PasswordInput
                    label='Пароль'
                    required
                    placeholder='password'
                    onFocus={() => setOpened(true)}
                    onBlur={() => setOpened(false)}
                    mt='md'
                    autoComplete='new-password'
                    {...form.getInputProps('password')}
                />
                <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                    {errMsg}
                </Text>
                <Group justify='flex-start' mt='xl' grow>
                    <Button type='submit'>Добавить</Button>
                </Group>
            </form>
        </Box>
    )
}
