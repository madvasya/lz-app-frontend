import {useForm} from '@mantine/form'
import {TextInput, Text, Box, Button, Group, ActionIcon} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {RehearsalCreate} from '../../models/Rehearsal'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'
import RehearsalService from '../../services/RehearsalService'
import {IconTrash} from '@tabler/icons-react'
import { useBookingStore } from '../../pages/BookingPage'

interface FormValues {
    band_name: string;
    participants: string[]
  }

export default function BookRehearsalModal({
    start_time,
    duration,
    close,
}: {
    start_time: string
    duration: number
    close: () => void
}) {
    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        initialValues: {
            band_name: '',
            participants: [],
        },
    })
    const queryClient = useQueryClient()
    const resetSelection = useBookingStore((state) => state.resetSelection)


    const bookingMutation = useMutation({
        mutationFn: (rehearsal: RehearsalCreate) => RehearsalService.createRehearsal(rehearsal),
        onSuccess: () => {
            notifications.show({
                message: `Репетиция успешно забронирована`,
                color: 'green',
            })
            queryClient.invalidateQueries({queryKey: ['bookings']})
            resetSelection()
            close()
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.data.detail[0].msg) {
                    notifications.show({
                        message: error.response?.data.detail[0].msg,
                        color: 'red',
                    })
                } else {
                    notifications.show({
                        message: error.response?.data.detail,
                        color: 'red',
                    })
                }
            }
        },
    })
    const participants = form.getValues().participants.map((item, index) => (
        <Group key={item} mt='xs'>
            <TextInput
                placeholder='Иван Свеклов'
                withAsterisk
                style={{flex: 1}}
                key={form.key(`participants.${index}`)}
                {...form.getInputProps(`participants.${index}`)}
            />
            <ActionIcon color='red' onClick={() => form.removeListItem('participants', index)}>
                <IconTrash size='1rem' />
            </ActionIcon>
        </Group>
    ))

    return (
        <Box>
            <form
                onSubmit={form.onSubmit((values) =>
                    bookingMutation.mutate({
                        participants: values.participants,
                        start_time: start_time,
                        duration: duration,
                        band_name: values.band_name,
                    })
                )}
            >
                <TextInput
                    mt='md'
                    label='Название коллектива'
                    placeholder='Тупые козырьки'
                    {...form.getInputProps('band_name')}
                />
                <Box maw={500} mx='auto'>
                    {participants.length > 0 ? (
                        <Group mb='xs'>
                            <Text fw={500} size='sm' style={{flex: 1}}>
                                Имя участника
                            </Text>
                        </Group>
                    ) : (
                        <Text c='dimmed' ta='center'>
                            Добавьте участников...
                        </Text>
                    )}

                    {participants}

                    <Group justify='center' mt='md'>
                        <Button
                            onClick={() => form.insertListItem('participants', '')}
                        >
                            Добавить участника репетиции
                        </Button>
                    </Group>
                </Box>
                <Group justify='flex-start' mt='xl'>
                    <Button type='submit'>Забронировать репетицию</Button>
                </Group>
            </form>
        </Box>
    )
}
