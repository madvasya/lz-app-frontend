import {useRef, useState} from 'react'
import {useForm} from '@mantine/form'
import {Text, Box, Button, Group, PasswordInput, Title, Space} from '@mantine/core'
import UserService from '../../services/UserService'
import {notifications} from '@mantine/notifications'
import {useQuery} from '@tanstack/react-query'
import {useDisclosure} from '@mantine/hooks'
import date from 'date-and-time'

export default function UserChangePasswordModal({close, userId}: {close: () => void; userId: number}) {
    const [visible, {toggle}] = useDisclosure(false)
    const form = useForm({
        initialValues: {
            password: '',
            passwordConfirm: '',
        },
        validateInputOnChange: true,

        validate: (values) => ({
            passwordConfirm: values.password != values.passwordConfirm ? 'Пароли должны совпадать' : null,
        }),
    })

    const {data} = useQuery({queryKey: ['user', userId], queryFn: () => UserService.fetchUser(userId)})

    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef<HTMLDivElement>(null!)

    async function handleEdit(formData: {password: string; passwordConfirm: string}) {
        try {
            if (form.isDirty()) {
                await UserService.updateUserPassword(userId, formData.password)
                notifications.show({
                    message: `Пароль успешно изменён`,
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
                <PasswordInput
                    label='Новый пароль'
                    visible={visible}
                    onVisibilityChange={toggle}
                    autoComplete='new-password'
                    {...form.getInputProps('password')}
                />
                <PasswordInput
                    label='Подтвердите пароль'
                    visible={visible}
                    onVisibilityChange={toggle}
                    {...form.getInputProps('passwordConfirm')}
                />
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
