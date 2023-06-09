export type Topic = {
  id: string
  title: string
  content: string
  firstOption: { content: string; count: number }
  secondOption: { content: string; count: number }
  voteCount: number
  commentCount: number
  createAt: string
}

export type NewTopic = Pick<Topic, 'title' | 'content'> & {
  firstOption: string
  secondOption: string
  password: string
}
