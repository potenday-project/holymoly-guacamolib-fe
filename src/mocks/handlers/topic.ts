import { rest } from 'msw'

import { db } from '../db'

type TopicSchema = {
  id: string
  content: string
  firstOption: {
    content?: string
    count?: number
  }
  secondOption: {
    content?: string
    count?: number
  }
  createdAt: Date
}

function refineTopic(topic: TopicSchema) {
  return {
    id: topic.id,
    content: topic.content,
    firstOption: { content: topic.firstOption.content },
    secondOption: { content: topic.secondOption.content },
    createdAt: topic.createdAt,
  }
}

const handlers = [
  // 전체 주제
  rest.get('/topics', (_, res, ctx) => {
    const topics = db.topic.getAll().map((topic) => refineTopic(topic))

    if (topics) return res(ctx.json({ statusCode: 200, data: topics }))
    else res(ctx.json({ statusCode: 500, data: '주제들을 가져오지 못했어요.' }))
  }),

  // 단일 주제
  rest.get('/topics/:topicId', (req, res, ctx) => {
    const { topicId } = req.params as { topicId: string }
    const topic = db.topic.findFirst({
      where: { id: { equals: topicId } },
    })

    if (topic)
      return res(ctx.json({ statusCode: 200, data: refineTopic(topic) }))
    else
      return res(ctx.json({ statusCode: 404, data: '존재하지 않는 주제예요.' }))
  }),

  // 주제 생성
  rest.post('/topics', async (req, res, ctx) => {
    const { topic } = await req.json()
    const createdTopic = db.topic.create(topic)

    if (createdTopic) return res(ctx.json({ statusCode: 204 }))
    else
      return res(ctx.json({ statusCode: 500, data: '주제를 만들지 못했어요.' }))
  }),

  // 주제 삭제
  rest.delete('/topics/:topicId', async (req, res, ctx) => {
    const { topicId } = req.params as { topicId: string }
    const password = await req.text()

    if (!password)
      return res(
        ctx.json({ statusCode: 401, data: '비밀번호를 확인해주세요.' }),
      )

    const foundTopic = db.topic.findFirst({
      where: { id: { equals: topicId } },
    })

    if (!foundTopic)
      return res(ctx.json({ statusCode: 404, data: '존재하지 않는 주제예요.' }))

    const isPasswordMatch = foundTopic.password === password

    if (!isPasswordMatch)
      return res(
        ctx.json({ statusCode: 401, data: '비밀번호를 확인해주세요.' }),
      )

    const deleted = db.topic.delete({
      where: { id: { equals: topicId } },
    })

    if (deleted) return res(ctx.status(204))
    else return res(ctx.status(500))
  }),

  // 투표
  rest.post('/topic/:topicId/vote', async (req, res, ctx) => {
    const { topicId } = req.params as { topicId: string }
    const { votedOption } = (await req.json()) as {
      votedOption: 'firstOption' | 'secondOption'
    }

    const foundTopic = db.topic.findFirst({
      where: { id: { equals: topicId } },
    })

    if (!foundTopic)
      return res(ctx.json({ statusCode: 404, data: '존재하지 않는 주제예요.' }))

    const updatedTopic = db.topic.update({
      where: { id: { equals: topicId } },
      data: {
        [votedOption]: {
          count: (prevCount: number) => prevCount + 1,
        },
      },
    })

    if (updatedTopic) return res(ctx.json({ statusCode: 204 }))
  }),
]

export default handlers