import {HoverCard, ActionIcon, rem, Stack, Badge} from '@mantine/core'
import {IconDots} from '@tabler/icons-react'

export default function BadgesList(items: string[], colorMapper: (item: string) => string) {
    return (
        <HoverCard position='right' shadow='md'>
            <HoverCard.Target>
                <ActionIcon variant='subtle' color='gray'>
                    <IconDots style={{width: rem(16), height: rem(16)}} stroke={1.5} />
                </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <Stack>
                    {items.map((item) => (
                        <Badge color={colorMapper(item)} key={item}>
                            {item}
                        </Badge>
                    ))}
                </Stack>
            </HoverCard.Dropdown>
        </HoverCard>
    )
}
