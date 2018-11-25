import { Failure, TestCase, TestSuite, TestSuites } from './junit'
import { parseFile } from './parser'
import { getChannelId, getWebClient } from './slack'
import { Opts } from './opts'

function sendTestSuitesSlackMessage(channel: string, suites: TestSuites): Promise<any> {
  return getWebClient()
    .chat.postMessage({ channel, ...suites.toSlackMessage() })
    .then(() => {
      return Promise.all(
        (suites.testsuites || [])
          .filter((suite) => suite.is_failed)
          .map((suite) => {
            return getWebClient().chat.postMessage({
              channel,
              ...suite.toSlackMessage(),
            })
          }),
      )
    })
}

export function main() {
  const opts = new Opts()
  getChannelId(opts.channel).then((channel_id) => {
    return parseFile(opts.junit_file).then((suites) =>
      sendTestSuitesSlackMessage(channel_id, suites),
    )
  })
}
