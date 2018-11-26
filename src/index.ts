import { Failure, TestCase, TestSuite, TestSuites } from './junit'
import { parseFile } from './parser'
import { getChannelId, getWebClient } from './slack'
import { Opts } from './opts'

export function buildTestSuitesSlackMessages(channel: string, suites: TestSuites): any[] {
  return [
    { channel, ...suites.toSlackMessage() },
    ...(suites.testsuites || [])
      .filter((suite) => suite.is_failed)
      .map((suite) => {
        return { channel, ...suite.toSlackMessage() }
      }),
  ]
}

export async function main() {
  const opts = new Opts()
  const channel_id = await getChannelId(opts.channel)
  const suites = await parseFile(opts.junit_file)
  const messages = buildTestSuitesSlackMessages(channel_id, suites)
  messages.forEach(async (message) => {
    try {
      await getWebClient().chat.postMessage(message)
    } catch (err) {
      console.error(err)
    }
  })
}
