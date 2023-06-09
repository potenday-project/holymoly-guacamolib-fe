import { useQuery } from '@tanstack/react-query'
import { useScrollContainer } from 'react-indiana-drag-scroll'
import styled from 'styled-components'

import { getHotTopics, topicKeys } from '@/api/topic'
import { HotTopic } from '@/components'

export default function HotTopics() {
  const scrollContainer = useScrollContainer()

  const {
    data: hotTopics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: topicKeys.hot,
    queryFn: getHotTopics,
  })

  if (isLoading) return <div>로딩 중...</div>
  if (isError) return <div>에러!</div>

  return (
    <List ref={scrollContainer.ref}>
      {hotTopics.length === 0 && <NoTopic>주제가 하나도 없어요.</NoTopic>}
      {hotTopics.map((hotTopic) => (
        <li key={hotTopic.id}>
          <HotTopic topic={hotTopic} />
        </li>
      ))}
    </List>
  )
}

const List = styled.ul`
  display: flex;
  gap: 12px;
  height: 221px;
  overflow-x: hidden;
`

const NoTopic = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`
