import * as path from "path";
import { exec } from "child_process";
import { SvnHelper } from "./help/SvnHelper";
import { ClientArgsHelper } from "./help/ClientArgsHelper";

export class SyncPublic2Client extends SvnHelper {
    public main() {
        ClientArgsHelper.parseArgs();
        let suffix = ClientArgsHelper.getClientPathSuffix();
        if (!suffix) {
            console.error("未找到分支配置: " + ClientArgsHelper.curBranch);
            return;
        }
        console.log("执行分支： " + ClientArgsHelper.curBranch);
        console.log("Path: " + path.join(__dirname, suffix));
        this.svnUpdatePath = [path.join(suffix, "public")];
        this._svnup();
        this.svnUpPromise.then(() => {
            const pythonPath = "c:/Python27/python.exe";
            const scriptPath = path.join(__dirname, suffix, "client/tools/code/syncPublicProto2Client.py");
            const command = `${pythonPath} ${scriptPath}`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`执行脚本失败: ${error}`);
                } else {
                    console.log(`执行syncPublicProto2Client脚本成功: ${stdout}`);
                }
            });
        });
    }
}

const syncPublic2Client = new SyncPublic2Client();
syncPublic2Client.main();
