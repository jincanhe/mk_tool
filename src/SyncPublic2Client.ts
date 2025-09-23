
import { exec } from "child_process";
import { SvnHelper } from "./help/SvnHelper";
export class SyncPublic2Client extends SvnHelper {
    public main() {
        this.svnUpdatePath = ["../../../mk/public"];
        this._svnup();
        this.svnUpPromise.then(() => {
        const pythonPath = "c:/Python27/python.exe";
        const scriptPath = "G:/mk/client/tools/code/syncPublicProto2Client.py";
        const command = `${pythonPath} ${scriptPath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行脚本失败: ${error}`);
            }else{
                console.log(`执行syncPublicProto2Client脚本成功: ${stdout}`);
                }   
            });
        });
    }
}

const syncPublic2Client = new SyncPublic2Client();
syncPublic2Client.main();
