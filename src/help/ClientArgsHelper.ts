export class ClientArgsHelper {
    public static args: { [key: string]: string | boolean } = {};
    public static curBranch: string = "";

    private static _allowedOptions = ['mk', 'mk_new', 'h', 'new', 'new_useold'];
    private static _clientSuffix_config: { [key: string]: string } = {
        "mk": "../../../mk",
        "new_useold": "../../../mk_new",
        "mk_new": "../../../mk_new",
        "new": "../../../mk_new"
    }


    private static _artSuffix_config: { [key: string]: string } = {
        "mk": "../../work/mk/art",
        "new_useold": "../../work/mk/art",
        "mk_new": "../../work/mk/art/art_调优版本",
        "new": "../../work/mk/art/art_调优版本"
    }

    public static parseArgs() {
        const args = process.argv.slice(2);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                if (this._allowedOptions.indexOf(key) === -1) {
                    continue;
                }
                this.args[key] = true;
                this.curBranch = key;
                break
            }
        }
        if (this.args['h'] || this.curBranch == "") {
            console.log(`
Usage: ts-node [Script].ts [options]

Options:
  --mk        Execute for mk
  --new_mk    Execute for new_mk
  --new       Execute for new
  --h         Show this help message
`);
            process.exit(0);
        }
    }

    public static getClientPathSuffix(): string {
        return this._clientSuffix_config[this.curBranch];
    }

    public static getArtPathSuffix(): string {
        return this._artSuffix_config[this.curBranch];
    }
}
