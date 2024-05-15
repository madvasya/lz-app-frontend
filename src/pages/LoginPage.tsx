import React, {useRef, useState, useEffect} from 'react'
import useAuthStore from '../store/auth'
import {useNavigate, useLocation} from 'react-router-dom'
import {TextInput, PasswordInput, Text, Stack, Button, Container} from '@mantine/core'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const login = useAuthStore((state) => state.login)

    const from = location.state?.from?.pathname || '/'

    const userRef = useRef<HTMLInputElement>(null!)
    const errRef = useRef<HTMLDivElement>(null!)

    const [user, setUser] = useState('')
    const [pwd, setPwd] = useState('')
    const [errMsg, setErrMsg] = useState('')

    useEffect(() => {
        userRef.current?.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [user, pwd])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        try {
            await login(user, pwd)
            setUser('')
            setPwd('')
            navigate(from, {replace: true})
        } catch (err: any) {
            //console.log(err)
            //console.log(err.response?.data?.detail)
            if (!err?.response) {
                setErrMsg('No server response')
            } else if (err.response?.status === 400) {
                setErrMsg(err.response?.data.detail)
            } else {
                setErrMsg('Login Failed')
            }
            errRef.current.focus()
        }
    }

    return (
        <Container maw={700} mt='xl'>
            <Stack align='stretch'>
                <Text ta='center'>Войдите, чтобы просматривать страницу по адресу {from}</Text>
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            placeholder='Логин'
                            value={user}
                            onChange={(event) => setUser(event.currentTarget.value)}
                            id='username'
                            autoComplete='on'
                        />
                        <PasswordInput
                            placeholder='Пароль'
                            value={pwd}
                            id='password'
                            onChange={(event) => setPwd(event.currentTarget.value)}
                        />
                        <Text ref={errRef} className={errMsg ? '' : 'invisible'} aria-live='assertive'>
                            {errMsg}
                        </Text>
                        <Button type='submit'>Вход</Button>
                    </Stack>
                </form>

                {/* <Text ta="center">
                    Need an account?<br />
                    <Anchor href="https://t.me/madvasya">Contact sUpErAdMiN</Anchor>
                </Text> */}
            </Stack>
        </Container>
    )
}

export default LoginPage
