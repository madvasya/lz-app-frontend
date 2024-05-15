import {Modal, ModalProps} from '@mantine/core'
import {ReactNode} from 'react'

interface IModalContainerProps extends ModalProps {
    children: ReactNode
    opened: boolean
    title: string
    onClose: () => void
}

export const ModalContainer = ({children, opened, onClose, title, ...rest}: IModalContainerProps) => {
    return (
        <Modal title={title} opened={opened} onClose={onClose} centered keepMounted={false} {...rest}>
            {children}
        </Modal>
    )
}
