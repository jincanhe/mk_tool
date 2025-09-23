import { exec } from "child_process";
import path = require("path");
import { PromiseHelper } from "./PromiseHelper";

export class SvnHelper {

    public svnUpdatePath: string[] = [];
    svnUpPromise: PromiseHelper<void> = new PromiseHelper<void>();
    protected _svnup() {

        if (this.svnUpdatePath.length == 0) {
            this.svnUpPromise.resolve();
            console.log("svnUpdatePath is empty");
            return;
        }

        let curPath = this.svnUpdatePath.shift();
        let svnPath = path.join(__dirname, curPath);
        let svnCmd = `svn up ${svnPath}`;
        exec(svnCmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行错误: ${error}`);
                return;
            }
            console.log(`命令输出: ` + stdout);
            if (stderr) {
                console.error(`命令错误: ${stderr}`);
            }

            if (this.svnUpdatePath.length > 0) {
                this._svnup();
            } else {
                this.svnUpPromise.resolve();
            }
        });


    }

}

