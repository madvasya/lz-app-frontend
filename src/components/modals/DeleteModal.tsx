import {Text, Box, Button} from '@mantine/core'
import {notifications} from '@mantine/notifications'
import {QueryKey, useMutation, useQueryClient} from '@tanstack/react-query'
import handleError from '../../shared/handleError'

interface DeleteModalProps {
    close: () => void
    deleteMsg: string
    errorMsg: string
    successMsg: string
    selection: number[]
    clearSelection: () => void
    queryToInvalidate: QueryKey | undefined
    deleteFn: (id: number) => Promise<string>
}

export default function DeleteModal({
    close,
    deleteMsg,
    errorMsg,
    successMsg,
    selection,
    clearSelection,
    queryToInvalidate,
    deleteFn,
}: Readonly<DeleteModalProps>) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteFn(id),
        onSuccess: () => {
            notifications.show({
                message: successMsg,
                color: 'green',
            })
        },
        onError: (error, variables) => {
            const errTitle = `${errorMsg} id=${variables}`
            notifications.show({
                title: errTitle,
                message: handleError(error),
                color: 'red',
            })
        },
    })
    async function handleDelete() {
        for (let id of selection) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({queryKey: queryToInvalidate})
                    clearSelection()
                    close()
                },
            })
        }
    }

    return (
        <Box>
            <Text>{deleteMsg}</Text>
            <Button onClick={handleDelete} color='red' mt='md' loading={deleteMutation.isPending}>
                Удалить
            </Button>
        </Box>
    )
}
