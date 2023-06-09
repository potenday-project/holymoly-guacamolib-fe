import { rest } from 'msw'

import { db } from '../db'

type NewComment = {
  newComment: { content?: string; password?: string }
}

const handlers = [
  // 특정 주제의 댓글 목록
  rest.get('/topics/:topicId/comments', (req, res, ctx) => {
    const { topicId } = req.params as { topicId: string }
    const size = Number(req.url.searchParams.get('size')) || 10
    const page = Number(req.url.searchParams.get('page')) || 0

    if (!topicId)
      return res(ctx.status(404), ctx.json({ msg: '존재하지 않는 주제예요.' }))

    const foundComments = db.comment.findMany({
      where: { topicId: { equals: topicId } },
      take: size,
      skip: page * size,
      orderBy: { createdAt: 'asc' },
    })

    if (foundComments) return res(ctx.status(200), ctx.json(foundComments))
  }),

  // 댓글 작성
  rest.post('/topics/:topicId/comments', async (req, res, ctx) => {
    const { topicId } = req.params as { topicId: string }
    const foundTopic = db.topic.findFirst({
      where: { id: { equals: topicId } },
    })

    if (!foundTopic)
      return res(ctx.status(404), ctx.json({ msg: '존재하지 않는 주제예요.' }))

    const {
      newComment: { content, password },
    } = await req.json<NewComment>()

    if (!content || !password)
      return res(ctx.status(400), ctx.json({ msg: '입력값을 확인해주세요' }))

    const index = foundTopic.commentCount + 1
    const updatedTopic = db.topic.update({
      where: { id: { equals: topicId } },
      data: { commentCount: (prevCount) => prevCount + 1 },
    })
    const createdComment = db.comment.create({
      topicId,
      index,
      content,
      password,
    })

    if (updatedTopic && createdComment)
      return res(
        ctx.status(200),
        ctx.json({ createdCommentId: createdComment.id }),
      )
    else
      return res(ctx.status(500), ctx.json({ msg: '댓글을 작성하지 못했어요' }))
  }),

  // 댓글 삭제
  rest.delete('/topics/:topicId/comments/:commentId', async (req, res, ctx) => {
    const { topicId, commentId } = req.params as {
      topicId: string
      commentId: string
    }
    const password = await req.text()

    if (!password)
      return res(ctx.status(401), ctx.json({ msg: '비밀번호를 확인해주세요.' }))

    const foundTopic = db.topic.findFirst({
      where: { id: { equals: topicId } },
    })

    if (!foundTopic)
      return res(ctx.status(404), ctx.json({ msg: '존재하지 않는 주제예요.' }))

    const foundComment = db.comment.findFirst({
      where: { id: { equals: commentId } },
    })

    if (!foundComment)
      return res(
        ctx.status(404),
        ctx.json({ msg: '존재하지 않는 댓글이에요.' }),
      )

    const isPasswordMatch = foundComment.password === password

    if (!isPasswordMatch)
      return res(ctx.status(401), ctx.json({ msg: '비밀번호를 확인해주세요.' }))

    const deleted = db.comment.delete({
      where: { id: { equals: commentId } },
    })

    if (deleted)
      return res(ctx.status(200), ctx.json({ deletedCommentId: deleted.id }))
    else
      return res(
        ctx.status(500),
        ctx.json({ msg: '댓글을 삭제하지 못했어요.' }),
      )
  }),
]

export default handlers
