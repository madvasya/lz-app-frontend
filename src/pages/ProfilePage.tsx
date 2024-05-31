import UserService from '../services/UserService'
// import useAuthStore from '../store/auth'
import {ActionIcon, FileInput, Group, NativeSelect, Pagination, Paper, Stack, Switch, Text, Title, rem} from '@mantine/core'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import date from 'date-and-time'
import dayjs from 'dayjs'
import {useDisclosure} from '@mantine/hooks'
import {useState} from 'react'
import {RehearsalRead} from '../models/Rehearsal'
import {IconPhoto, IconTrash} from '@tabler/icons-react'
import DeleteModal from '../components/modals/DeleteModal'
import {ModalContainer} from '../components/modals/ModalContainer'
import RehearsalService from '../services/RehearsalService'

function ProfilePage() {
    // const userPermissions = useAuthStore((state) => state.userPermissions)
    const client = useQueryClient()
    const {data} = useQuery({queryKey: ['userMe'], queryFn: () => UserService.fetchUserMe()})
    const [archive, archiveHandlers] = useDisclosure(false)
    const [activePage, setPage] = useState(1)
    const [showOnPage, setShowOnPage] = useState(5)
    const [rehearsalToDelete, setRehearsalToDelete] = useState<number>(0)

    const bookingsQuery = useQuery({
        queryKey: ['my_bookings', data?.id, archive, showOnPage, activePage],
        queryFn: () => UserService.fetchRehearsalsMy(archive, showOnPage, showOnPage * (activePage - 1)),
    })
    const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false, {
        onClose: () => client.invalidateQueries({queryKey: ['users']}),
    })

    const bookingCard = (rehearsal: RehearsalRead) => {
        const uploadAllowed = dayjs(rehearsal.start_time).subtract(20, 'minute') < dayjs() && dayjs(rehearsal.start_time).add(rehearsal.duration+1, 'hour') > dayjs()
        const icon = <IconPhoto style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
        return(<Paper shadow='xs' p='xs' maw={800} key={rehearsal.id}>
            <Group justify='space-between'>
                <Title order={6}>{rehearsal.band_name}</Title>
                <ActionIcon
                    color='red'
                    onClick={() => {
                        setRehearsalToDelete(rehearsal.id)
                        deleteModalHandlers.open()
                    }}
                    variant='outline'
                >
                    <IconTrash size='1rem' />
                </ActionIcon>
            </Group>
            <Text>{dayjs(rehearsal.start_time).format('DD.MM.YY')}</Text>
            <Text>
                {dayjs(rehearsal.start_time).format('HH:mm')} - {' '}
                {dayjs(rehearsal.start_time).add(rehearsal.duration, 'hour').format('HH:mm')}
            </Text>
            <Group>
                {rehearsal.rehearsal_participants.map((p, index) => (
                    <Group key={p.surname}>
                        <Text>{p.surname}</Text>
                        {index != rehearsal.rehearsal_participants.length - 1 && <Text>·</Text>}
                    </Group>
                ))}
            </Group>
            <Group>
            <FileInput leftSection={icon} size='xs' accept="image/png,image/jpeg" placeholder="Загрузите фото полученного ключа" disabled={!uploadAllowed}/>
            <FileInput leftSection={icon} size='xs' accept="image/png,image/jpeg" placeholder="Загрузите фото сданного ключа" disabled={!uploadAllowed}/>
            </Group>
        </Paper>)
    }

    return (
        <>
            {data ? (
                <Stack>
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

                    <Title order={4}>Мои бронирования</Title>
                    <Switch
                        checked={archive}
                        onChange={archiveHandlers.toggle}
                        label={'Показать прошедшие'}
                        labelPosition='left'
                    />

                    {bookingsQuery.data?.rehearsalArray.map((item) => bookingCard(item))}
                    {bookingsQuery.data && (
                        <Stack align='start'>
                            <Pagination
                                total={Math.ceil(bookingsQuery.data.count / showOnPage)}
                                value={activePage}
                                onChange={setPage}
                                mt='sm'
                            />
                            <NativeSelect
                                size='xs'
                                label='Показывать на странице'
                                maw={200}
                                value={showOnPage}
                                onChange={(event) => {
                                    setShowOnPage(Number(event.currentTarget.value))
                                    setPage(1)
                                }}
                                data={['5', '10', '25']}
                            />
                        </Stack>
                    )}
                    <ModalContainer
                        title='Вы уверены, что хотите отменить репетицию?'
                        opened={deleteModalOpened}
                        onClose={deleteModalHandlers.close}
                    >
                        <DeleteModal
                            close={deleteModalHandlers.close}
                            deleteMsg={''}
                            errorMsg='Ошибка при отмене репетиции'
                            successMsg='Репетиция успешно отменена'
                            clearSelection={() => {}}
                            deleteFn={RehearsalService.removeRehearsal}
                            selection={[rehearsalToDelete]}
                            queryToInvalidate={['my_bookings', data?.id]}
                        />
                    </ModalContainer>
                </Stack>
            ) : (
                <Text>Loading...</Text>
            )}
        </>
    )
}

export default ProfilePage
