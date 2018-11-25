import fs from 'fs'
import xml2js from 'xml2js'
import { Failure, TestCase, TestSuite, TestSuites } from './junit'

type testCaseObj = {
  $: { name: string; classname?: string; time?: string }
  failure?: string[]
  skipped?: string[]
}

type testSuiteObj = {
  $: {
    name: string
    errors?: string
    failures?: string
    skipped?: string
    timestamp?: string
    time?: string
    tests?: string
  }
  testcase: testCaseObj[]
}

type testSuitesObj = {
  $: {
    name: string
    errors?: string
    failures: string
    skipped?: string
    timestamp?: string
    time?: string
    tests?: string
  }
  testsuite: testSuiteObj[]
}

function parseJUnitXml(xml: string): Promise<Object> {
  const parser = new xml2js.Parser()
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err: Error, result: any) => {
      if (err !== null) reject(err.message)
      else resolve(result)
    })
  })
}

function parseTestCase(tc: testCaseObj): TestCase {
  const testcase = new TestCase()
  testcase.name = tc.$.name
  testcase.time = Number(tc.$.time)
  testcase.skipped = typeof tc.skipped !== 'undefined'
  testcase.failures = (tc.failure || []).map((failure: string) => new Failure({ message: failure }))
  return testcase
}

function parseTestSuite(ts: testSuiteObj): TestSuite {
  const testsuite = new TestSuite()
  testsuite.name = ts.$.name
  testsuite.tests = Number(ts.$.tests)
  testsuite.failures = Number(ts.$.failures)
  testsuite.time = Number(ts.$.time)
  testsuite.testcases = ts.testcase.map((testcase: testCaseObj) => parseTestCase(testcase))
  return testsuite
}

function parseTestSuites(tss: testSuitesObj): TestSuites {
  const testsuites = new TestSuites()
  testsuites.name = tss.$.name
  testsuites.tests = Number(tss.$.tests)
  testsuites.failures = Number(tss.$.failures)
  testsuites.time = Number(tss.$.time)
  testsuites.testsuites = tss.testsuite.map((testsuite: testSuiteObj) => parseTestSuite(testsuite))
  return testsuites
}

export async function parse(xml: string): Promise<TestSuites> {
  const result = <{ testsuites: testSuitesObj }>await parseJUnitXml(xml)
  return parseTestSuites(result.testsuites)
}

export async function parseFile(fname: string): Promise<TestSuites> {
  return await parse(fs.readFileSync(fname).toString())
}
