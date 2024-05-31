import {Text, SimpleGrid, Stack, UnstyledButton, Button, Group, rem, CloseButton, SegmentedControl} from '@mantine/core'
import {useEffect, useState} from 'react'
import classes from '../css/TimetableTile.module.css'
import {create} from 'zustand'
import {useQuery} from '@tanstack/react-query'
import RehearsalService from '../services/RehearsalService'
import dayjs from 'dayjs'
import isoweek from 'dayjs/plugin/isoWeek'
import {RehearsalRead} from '../models/Rehearsal'
import {ModalContainer} from '../components/modals/ModalContainer'
import {useDisclosure} from '@mantine/hooks'
import BookRehearsalModal from '../components/modals/BookRehearsalModal'
dayjs.extend(isoweek)

interface BookingState {
    startIndex: number | undefined
    endIndex: number | undefined
    day: number | undefined
    setStartIndex: (index: number) => void
    setEndIndex: (index: number) => void
    setDay: (dow: number) => void
    handleSelect: (selectedDay: number, selectedIndex: number) => void
    resetSelection: () => void
    isChecked: (day: number, index: number) => boolean
}

export const useBookingStore = create<BookingState>()((set, get) => ({
    startIndex: undefined,
    endIndex: undefined,
    day: undefined,
    setStartIndex: (index) => set(() => ({startIndex: index})),
    setEndIndex: (index) => set(() => ({endIndex: index})),
    setDay: (name) => set(() => ({day: name})),
    handleSelect: (selectedDay, selectedIndex) =>
        set((state) => {
            if (state.startIndex === undefined || selectedDay != state.day) {
                return {startIndex: selectedIndex, endIndex: selectedIndex, day: selectedDay}
            } else {
                if (selectedIndex === state.startIndex) {
                    if (state.endIndex != undefined && state.startIndex < state.endIndex) {
                        return {startIndex: selectedIndex + 1}
                    } else {
                        return {
                            startIndex: undefined,
                            endIndex: undefined,
                        }
                    }
                } else if (selectedIndex > state.startIndex) {
                    return {endIndex: selectedIndex}
                } else {
                    return {endIndex: state.startIndex, startIndex: selectedIndex}
                }
            }
        }),
    resetSelection: () => set(() => ({startIndex: undefined, endIndex: undefined, day: undefined})),
    isChecked: (day, index) => {
        const state = get()
        return (
            day === state.day &&
            state.startIndex != undefined &&
            state.endIndex != undefined &&
            index <= state.endIndex &&
            index >= state.startIndex
        )
    },
}))

//(state.startIndex != undefined && endIndex != undefined && index <= endIndex && index >= startIndex)

interface TileProps {
    label: string
    clickHandler: () => void
    checked: boolean
    bookedBy: string | undefined
}

function Tile({label, clickHandler, checked, bookedBy}: Readonly<TileProps>) {
    return (
        <div className={classes.root}>
            <UnstyledButton
                className={classes.control}
                data-checked={checked || undefined}
                onClick={clickHandler}
                disabled={!!bookedBy}
            >
                <Text className={classes.label}>{label}</Text>
                <Text className={classes.description}>{bookedBy || 'Свободно'}</Text>
            </UnstyledButton>
        </div>
    )
}

interface DayProps {
    day: {dow: number; name: string}
    times: {hour: number; label: string}[]
    bookings: RehearsalRead[] | undefined
}

function Day({day, times, bookings}: DayProps) {
    const startIndex = useBookingStore((state) => state.startIndex)
    const endIndex = useBookingStore((state) => state.endIndex)
    const selectedDay = useBookingStore((state) => state.day)
    const handleSelect = useBookingStore((state) => state.handleSelect)
    //console.log(name, bookings)
    function bookedBy(time: number) {
        const found = bookings?.find(
            (booking) =>
                dayjs(booking.start_time).hour() <= time && time < dayjs(booking.start_time).hour() + booking.duration
        )
        return found?.band_name
    }

    const tiles = times.map((time, index) => {
        return (
            <Tile
                label={time.label}
                checked={
                    day.dow === selectedDay &&
                    startIndex != undefined &&
                    endIndex != undefined &&
                    index <= endIndex &&
                    index >= startIndex
                }
                clickHandler={() => handleSelect(day.dow, index)}
                key={time.hour}
                bookedBy={bookedBy(time.hour)}
            />
        )
    })
    return (
        <Stack gap={rem(2)}>
            <Text>{day.name}</Text>
            {tiles}
        </Stack>
    )
}

function BookingPage() {
    const [bookModalOpened, bookModalHandlers] = useDisclosure(false)
    const [currentWeek, setCurrentWeek] = useState<number>(dayjs().isoWeek())
    useEffect(() => {
        setCurrentWeek(dayjs().isoWeek())
    }, [])

    const availableHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const times = availableHours.map((hour) => {
        return {hour: hour, label: dayjs().hour(hour).minute(0).format('HH:mm')}
    })
    const availableDays = [1, 2, 3, 4, 5, 6]
    const daysLabels = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    const days = availableDays.map((dow, index) => {
        return {dow: dow, name: `${daysLabels[index]} ${dayjs().isoWeek(currentWeek).isoWeekday(dow).format('DD.MM')}`}
    })
    const startIndex = useBookingStore((state) => state.startIndex)
    const endIndex = useBookingStore((state) => state.endIndex)
    const day = useBookingStore((state) => state.day)
    const [startTime, setStartTime] = useState<string>('00:00')

    const resetSelection = useBookingStore((state) => state.resetSelection)
    const bookingsQuery = useQuery({
        queryKey: ['bookings', currentWeek],
        queryFn: () =>
            RehearsalService.fetchRehearsals(
                undefined,
                undefined,
                dayjs().isoWeek(currentWeek).startOf('isoWeek').format(),
                dayjs().isoWeek(currentWeek).endOf('isoWeek').format()
            ),
    })
    //console.log(currentWeek, dayjs().startOf('isoWeek').format(), bookingsQuery.data)
    return (
        <div>
            <Group>
                {startIndex != undefined && endIndex != undefined && (
                    <>
                        <Text>
                            Выбранное время: {days[day! - 1].name}, {times[startIndex].label} - {times[endIndex].label},{' '}
                            {endIndex - startIndex + 1} ч
                        </Text>
                        <CloseButton onClick={resetSelection} />
                    </>
                )}
                <Button
                    onClick={() => {
                        const start_time = dayjs()
                            .isoWeek(currentWeek)
                            .isoWeekday(day!)
                            .hour(availableHours[startIndex!])
                            .minute(0)
                            .second(0)
                            .format()
                        console.log(day, times[startIndex!], endIndex! - startIndex! + 1, start_time)
                        // bookingMutation.mutate({
                        //     band_name: 'pizda',
                        //     duration: endIndex! - startIndex! + 1,
                        //     participants: ['Зуевичков'],
                        //     start_time: start_time,
                        // })
                        setStartTime(start_time)
                        bookModalHandlers.open()
                        //resetSelection()
                    }}
                    disabled={startIndex === undefined || endIndex === undefined}
                >
                    Забронировать
                </Button>
                <SegmentedControl
                    value={currentWeek === dayjs().isoWeek() ? 'current' : 'next'}
                    onChange={(value) =>
                        setCurrentWeek(value === 'current' ? dayjs().isoWeek() : dayjs().isoWeek() + 1)
                    }
                    data={[
                        {label: 'Текущая неделя', value: 'current'},
                        {label: 'Следующая неделя', value: 'next'},
                    ]}
                />
            </Group>
            <SimpleGrid cols={{base: 1, xs: 7}} spacing={rem(2)}>
                {days.map((day, index) => {
                    return (
                        <Day
                            key={day.dow}
                            day={day}
                            times={times}
                            bookings={bookingsQuery.data?.rehearsalArray.filter(
                                (booking) => dayjs(booking.start_time).isoWeekday() === index + 1
                            )}
                        />
                    )
                })}
            </SimpleGrid>
            <ModalContainer title='Забронировать репетицию' opened={bookModalOpened} onClose={bookModalHandlers.close}>
                <BookRehearsalModal
                    duration={endIndex! - startIndex! + 1}
                    start_time={startTime}
                    close={bookModalHandlers.close}
                />
            </ModalContainer>
        </div>
    )
}

export default BookingPage
