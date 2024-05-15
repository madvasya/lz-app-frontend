import {
    Title,
    Text,
    Container,
    SimpleGrid,
    Skeleton,
    Stack,
    Paper,
    Table,
    Checkbox,
    Box,
    UnstyledButton,
    Button,
    Group,
} from '@mantine/core'
import {useState} from 'react'
import classes from '../css/TimetableTile.module.css'
import {create} from 'zustand'

interface BookingState {
    startIndex: number | undefined
    endIndex: number | undefined
    day: string | undefined
    setStartIndex: (index: number) => void
    setEndIndex: (index: number) => void
    setDay: (name: string) => void
    handleSelect: (selectedDay: string, selectedIndex: number) => void
    resetSelection: () => void
    isChecked: (day: string, index: number) => boolean
}

const useBookingStore = create<BookingState>()((set, get) => ({
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
            <UnstyledButton className={classes.control} data-checked={checked || undefined} onClick={clickHandler} disabled={!!bookedBy}>
                <Text className={classes.label}>{label}</Text>
                <Text className={classes.description}>{bookedBy || "Свободно"}</Text>
            </UnstyledButton>
        </div>
    )
}

interface DayProps {
    height: number
    resetSelection: () => void
    name: string
    times: string[]
}

function Day({height, resetSelection, name, times}: DayProps) {
    const startIndex = useBookingStore((state) => state.startIndex)
    const endIndex = useBookingStore((state) => state.endIndex)
    const selectedDay = useBookingStore((state) => state.day)
    const handleSelect = useBookingStore((state) => state.handleSelect)

    const tiles = times.map((time, index) => {
        return (
            <Tile
                label={time}
                checked={
                    name === selectedDay &&
                    startIndex != undefined &&
                    endIndex != undefined &&
                    index <= endIndex &&
                    index >= startIndex
                }
                clickHandler={() => handleSelect(name, index)}
                key={time}
                bookedBy={undefined}
            />
        )
    })
    return (
        <Stack gap='xs'>
            <Text>{name}</Text>
            {tiles}
        </Stack>
    )
}

function BookingPage() {
    const height = 50

    const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    const days = ['Поебельник', 'Вротник', 'Перда', 'Шитверг', 'Пяница', 'Субта']
    const startIndex = useBookingStore((state) => state.startIndex)
    const endIndex = useBookingStore((state) => state.endIndex)
    const day = useBookingStore((state) => state.day)
    const resetSelection = useBookingStore((state) => state.resetSelection)
    return (
        <div>
            <Title order={3}>Бронирование репетиций</Title>
            <Group>
                {startIndex != undefined && endIndex != undefined && (
                    <Text>
                        ыыы: {day}, {times[startIndex]} - {times[endIndex]}
                    </Text>
                )}
                <Button
                    onClick={() => {
                        console.log(day, times[startIndex!], endIndex! - startIndex! + 1)
                        resetSelection()
                    }}
                    disabled={startIndex === undefined || endIndex === undefined}
                >
                    ВШТАНАТЬ НАСРЫ
                </Button>
            </Group>
            <SimpleGrid cols={{base: 1, xs: 7}} spacing='xs'>
                {days.map((day) => {
                    return <Day key={day} height={height} resetSelection={console.log} name={day} times={times} />
                })}
            </SimpleGrid>
        </div>
    )
}

export default BookingPage
