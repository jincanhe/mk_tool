export enum OptionsEnum {
    master = 'master',
    master_new = 'master_new',
    master_new_useMasterArt = 'master_new_useMasterArt',
}

export class ClientArgsHelper {
    public static args: { [key: string]: string | boolean } = {};
    public static curBranch: OptionsEnum | "" = "";

    private static _clientSuffix_config: { [key in OptionsEnum]: string[] } = {
        //[clientPathSuffix, artPathSuffix]
        [OptionsEnum.master]: ["../../master", "../../work/art"],
        [OptionsEnum.master_new]: ["../../master_new", "../../work/art/art_调优版本"],
        [OptionsEnum.master_new_useMasterArt]: ["../../master_new", "../../work/art"],
    }

    public static updateDb_config: string[] = ["http://localhost:7456/update-db", "http://localhost:7457/update-db"];

    public static parseArgs() {
        const args = process.argv.slice(2);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                if (key === 'h') {
                    this.args['h'] = true;
                    continue;
                }

                // Check if key matches any OptionsEnum value
                if (Object.values(OptionsEnum).includes(key as OptionsEnum)) {
                    this.args[key] = true;
                    this.curBranch = key as OptionsEnum;
                    break;
                }
            }
        }

        if (this.args['h'] || this.curBranch === "") {
            const optionsHelp = Object.values(OptionsEnum).map(opt => {
                const config = this._clientSuffix_config[opt];
                return `  --${opt.padEnd(20)} [${config.map(s => `"${s}"`).join(", ")}]`;
            }).join('\n');

            console.log(`
Usage: ts-node [Script].ts [options]

Options:
${optionsHelp}
  --h                    Show this help message
`);
            process.exit(0);
        }
    }

    public static getClientPathSuffix(): string {
        if (this.curBranch === "") {
            throw new Error("未找到分支");
        }
        return this._clientSuffix_config[this.curBranch][0];
    }

    public static getArtPathSuffix(): string {
        if (this.curBranch === "") {
            throw new Error("未找到分支")
        }
        return this._clientSuffix_config[this.curBranch][1];
    }
}
