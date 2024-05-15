import {Menu} from '@mantine/core'
import {ReactNode} from 'react'

interface IActionMenuItem {
    icon: ReactNode
    name: string
    action: () => void
    color: string | undefined
}

interface IActionMenuProps {
    items: IActionMenuItem[]
    target: ReactNode
}

export default function ActionMenuContainer({target, items}: IActionMenuProps) {
    const menuItems = items.map((item) => (
        <Menu.Item leftSection={item.icon} onClick={item.action} color={item.color} key={item.name}>
            {item.name}
        </Menu.Item>
    ))

    return (
        <Menu transitionProps={{transition: 'pop'}} withArrow position='bottom' withinPortal>
            <Menu.Target>{target}</Menu.Target>
            <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
    )
}
