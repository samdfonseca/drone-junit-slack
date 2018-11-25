import { SlackAttachment } from './slack'

export class Failure {
  public readonly xml_name: string = 'failure'
  public message?: string
  public type?: string
  public text?: string

  constructor(args: { message?: string; type?: string; text?: string }) {
    this.message = args.message
    this.type = args.type
    this.text = args.text
  }
}

export class TestCase {
  public readonly xml_name: string = 'testcase'
  public name?: string
  public id?: string
  public time?: number
  public failures?: Failure[]
  public skipped?: boolean

  public get is_failed(): boolean {
    return (this.failures || []).length > 0
  }

  public toSlackAttachment(): SlackAttachment {
    const failureMessages = (this.failures || []).map((failure) => failure.message)
    return {
      fallback: `TestCase ${this.name} failed: ${failureMessages.join('\n')}`,
      color: '#ff0000',
      title: this.name,
      text: failureMessages.join('\n'),
      fields: [{ title: 'Result', value: 'Failed', short: false }],
    }
  }
}

export class TestSuite {
  public readonly xml_name: string = 'testsuite'
  public name?: string
  public id?: string
  public tests?: number
  public failures?: number
  public time?: number
  public testcases?: TestCase[]

  public get skipped(): number {
    return (this.testcases || []).filter((test) => test.skipped).length
  }

  public get passed(): number {
    return (this.tests || 0) - this.skipped - (this.failures || 0)
  }

  public get is_failed(): boolean {
    return (this.failures || 0) > 0
  }

  public toSlackMessage(): any {
    return {
      text: '',
      attachments: (this.testcases || [])
        .filter((test) => test.is_failed)
        .map((test) => test.toSlackAttachment()),
    }
  }
}

export class TestSuites {
  public readonly xml_name: string = 'testsuites'
  public name?: string
  public id?: string
  public tests?: number
  public failures?: number
  public time?: number
  public testsuites?: TestSuite[]

  public get skipped(): number {
    return (this.testsuites || []).reduce((total, suite) => total + suite.skipped, 0)
  }

  public get passed(): number {
    return (this.testsuites || []).reduce((total, suite) => total + suite.passed, 0)
  }

  public toSlackMessage(): any {
    const text = `${this.name} ${this.failures === 0 ? 'passed' : 'failed'}`
    return {
      text: '',
      attachments: [
        {
          fallback: text,
          color: this.failures === 0 ? '#36a64f' : '#ff0000',
          title: `${process.env.DRONE_REPO_OWNER}/${process.env.DRONE_REPO_NAME}`,
          title_link: process.env.DRONE_BUILD_LINK,
          fields: [
            { title: 'Passed', value: this.passed.toString(), short: true },
            { title: 'Failed', value: (this.failures || 0).toString(), short: true },
          ],
        },
      ],
    }
  }
}
