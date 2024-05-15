import {Table, Group, Center, rem} from '@mantine/core'
import {IconChevronUp, IconChevronDown, IconSelector} from '@tabler/icons-react'
import classes from '../../css/Table.module.css'

interface ThProps {
    children: React.ReactNode
    reversed: boolean
    sorted: boolean
    onSort(): void
}

export default function SortedTh({children, reversed, sorted, onSort}: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector
    return (
        <Table.Th onClick={onSort}>
            {/* <UnstyledButton  className={classes.control}> */}
            <Group justify='space-between'>
                {children}
                <Center className={classes.icon}>
                    <Icon style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                </Center>
            </Group>
            {/* </UnstyledButton> */}
        </Table.Th>
    )
}
