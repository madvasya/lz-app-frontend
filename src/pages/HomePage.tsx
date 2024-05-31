import {Title, Text, Stack, Group, Paper, Space, ActionIcon, Anchor} from '@mantine/core'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import PostService from '../services/PostService'
import dayjs from 'dayjs'
import {IconMessage, IconThumbDown, IconThumbUp} from '@tabler/icons-react'
import {Link} from 'react-router-dom'

function HomePage() {
    const postsQuery = useQuery({
        queryKey: ['posts'],
        queryFn: () => PostService.fetchPosts(),
    })
    const queryClient = useQueryClient()
    const reactOnPostMutation = useMutation({
        mutationFn: async ({like, id}: {like: boolean; id: number}) => {
            like ? await PostService.putLikeOnPost(id) : await PostService.putDislikeOnPost(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['posts']})
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const posts = postsQuery.data?.postArray.map((post) => {
        return (
            <Stack>
                <Anchor component={Link} to={`/news/${post.id}`}>
                    <Title order={4}>{post.title}</Title>{' '}
                </Anchor>

                <Text c='dark'>{post.text.substring(0, 120) + '...'}</Text>
                <Group>
                    <Text size='sm' c='gray'>
                        Обубликовано {dayjs(post.created_on).format('DD.MM.YYYY')} пользователем {post.user.username}
                    </Text>
                </Group>
                <Group>
                    <IconMessage color='gray'></IconMessage>
                    <ActionIcon
                        onClick={() => {
                            reactOnPostMutation.mutate({like: true, id: post.id})
                        }}
                        variant='subtle'
                        c='gray'
                    >
                        <IconThumbUp />
                    </ActionIcon>

                    <Text size='sm' c='gray'>
                        {post.likes}
                    </Text>
                    <ActionIcon
                        onClick={() => {
                            reactOnPostMutation.mutate({like: false, id: post.id})
                        }}
                        variant='subtle'
                        c='gray'
                    >
                        <IconThumbDown />
                    </ActionIcon>
                    <Text size='sm' c='gray'>
                        {post.dislikes}
                    </Text>
                </Group>
            </Stack>
        )
    })
    return (
        <div>
            <Title>Новости Лаборатории Звука</Title>
            <Space h='md'></Space>
            <Stack>
                {posts?.map((post) => (
                    <Paper shadow='xs' p='xs'>
                        {post}
                    </Paper>
                ))}
            </Stack>
        </div>
    )
}

export default HomePage
