import parseArgs from 'minimist'

export class Opts {
  private readonly argv: any

  constructor() {
    this.argv = parseArgs(process.argv.slice(2))
  }

  private getOpt(opt: string): string {
    const val = this.argv[opt] || process.env[`PLUGIN_${opt.toUpperCase()}`]
    if (typeof val === 'undefined') throw new Error(`missing required arg: ${opt}`)
    return val
  }

  public get channel(): string {
    return this.getOpt('channel')
  }

  public get junit_file(): string {
    return this.getOpt('junit_file')
  }
}
