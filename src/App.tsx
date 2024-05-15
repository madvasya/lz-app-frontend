import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/UsersPage'
import StatsPage from './pages/StatsPage'
import {Routes, Route, Outlet, Link, useLocation} from 'react-router-dom'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import {AppShell, Burger, Group, UnstyledButton} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'
import classes from './css/Navbar.module.css'
import {LZIcon} from './assets/LZicon'
import UserStatus from './components/UserStatus'
import RoomProfile from './pages/RoomProfile'
import NewsPage from './pages/NewsPage'
import AboutPage from './pages/AboutPage'
import BookingPage from './pages/BookingPage'

function App() {
    return (
        <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='*' element={<div>Page not found</div>} />
            <Route element={<Layout />}>
                <Route path='/' element={<HomePage />} />
                <Route path='/me' element={<ProfilePage />} />
                <Route path='/booking' element={<BookingPage />} />
                <Route path='/about' element={<AboutPage />} />
                <Route path='/users' element={<UsersPage />} />
                <Route path='/news'>
                    <Route path='' element={<NewsPage />} />
                    <Route path=':postId' element={<RoomProfile />} />
                </Route>
                <Route path='/rules' element={<StatsPage />} />
            </Route>
        </Routes>
    )
}

function Layout() {
    const [opened, {toggle, close}] = useDisclosure()
    const link = [
        {page: 'Забронировать репетицию', to: '/booking'},
        {page: 'Новости', to: '/news'},
        {page: 'История', to: '/about'},
        {page: 'Правила', to: '/rules'},
        {page: 'Пользователи', to: '/users'},
    ]
    const location = useLocation()

    return (
        <RequireAuth>
            <AppShell
                header={{height: 60}}
                navbar={{width: 300, breakpoint: 'sm', collapsed: {desktop: true, mobile: !opened}}}
                padding='md'
            >
                <AppShell.Header>
                    <Group h='100%' px='md'>
                        <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
                        <Group justify='space-between' style={{flex: 1}}>
                            <LZIcon size={40} />
                            <Group ml='xl' gap={0} visibleFrom='sm'>
                                {link.map((link) => (
                                    <UnstyledButton
                                        component={Link}
                                        to={link.to}
                                        className={
                                            link.to != location.pathname ? classes.control : classes.controlactive
                                        }
                                        key={link.page}
                                    >
                                        {link.page}
                                    </UnstyledButton>
                                ))}
                                <UserStatus />
                            </Group>
                        </Group>
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar py='md' px={5}>
                    {link.map((link) => (
                        <UnstyledButton
                            component={Link}
                            to={link.to}
                            onClick={close}
                            className={link.to != location.pathname ? classes.control : classes.controlactive}
                            key={link.page}
                        >
                            {link.page}
                        </UnstyledButton>
                    ))}
                    <UserStatus />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>
            </AppShell>
        </RequireAuth>
    )
}

export default App
