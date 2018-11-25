import { WebClient } from '@slack/client'

export interface SlackAttachment {
  fallback: string
  color?: string
  pretext?: string
  author_name?: string
  author_link?: string
  author_icon?: string
  title?: string
  title_link?: string
  text?: string
  fields?: { title: string; value: string; short: boolean }[]
  image_url?: string
  thumb_url?: string
  footer?: string
  footer_icon?: string
  ts?: number
}

export function getWebClient(token?: string): WebClient {
  token = token || process.env.SLACK_TOKEN
  if (typeof token === 'undefined') throw new Error('SLACK_TOKEN environment variable not defined')
  return new WebClient(token)
}

export function getChannelId(channelName: string): Promise<string> {
  const params = {
    exclude_archived: true,
    types: 'public_channel',
    limit: 100,
  }
  function pageLoaded(res: {
    channels?: any[]
    response_metadata?: { next_cursor?: string }
  }): any {
    const channel = (res.channels || []).find(
      (channel: { id: string; name: string }) => channel.name === channelName,
    )
    if (typeof channel === 'undefined') {
      if (
        res.response_metadata &&
        res.response_metadata.next_cursor &&
        res.response_metadata.next_cursor !== ''
      ) {
        // @ts-ignore
        params.cursor = res.response_metadata.next_cursor
        return getWebClient()
          .conversations.list(params)
          .then(pageLoaded)
      }
    }
    return typeof channel !== 'undefined' ? channel.id : undefined
  }
  return getWebClient()
    .conversations.list(params)
    .then(pageLoaded)
}
