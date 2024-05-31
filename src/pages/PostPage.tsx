import {Group, Stack, Text, Title, ActionIcon, Anchor, rem} from '@mantine/core'
import {IconArrowLeft, IconMessage, IconThumbDown, IconThumbUp} from '@tabler/icons-react'
import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router-dom'
import PostService from '../services/PostService'
import dayjs from 'dayjs'

function PostPage() {
    const {postId} = useParams()
    if (!postId) {
        return <Text>Room not found</Text>
    }
    const {data: post} = useQuery({
        queryKey: ['post', postId],
        queryFn: () => PostService.fetchPost(Number(postId)),
    })

    return (
        post && (
            <Stack>
                <Anchor component={Link} to='/' underline='never'>
                    <Group>
                        <IconArrowLeft style={{width: rem(16), height: rem(16)}} />
                        <Text>Назад</Text>
                    </Group>
                </Anchor>
                <Title order={4}>{post.title}</Title> <Text c='dark'>{post.text}</Text>
                <Group>
                    <Text size='sm' c='gray'>
                        Обубликовано {dayjs(post.created_on).format('DD.MM.YYYY')} пользователем {post.user.username}
                    </Text>
                </Group>
                <Group>
                    <IconMessage color='gray'></IconMessage>
                    <ActionIcon variant='subtle' c='gray' disabled>
                        <IconThumbUp />
                    </ActionIcon>

                    <Text size='sm' c='gray'>
                        {post.likes}
                    </Text>
                    <ActionIcon variant='subtle' c='gray' disabled>
                        <IconThumbDown />
                    </ActionIcon>
                    <Text size='sm' c='gray'>
                        {post.dislikes}
                    </Text>
                </Group>
            </Stack>
        )
    )
}

export default PostPage
