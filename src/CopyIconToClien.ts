/**
 * 更新icon脚本
 */


import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import * as readline from "readline";
import * as iconv from 'iconv-lite';
import { spawn } from "child_process";

interface ClientData {
    clientPath: string;
    prefix: string[];
    maxSize: number;
    onlyAdd: boolean;
    ignoreStrs?: string[];
}


export class CopyIconToClient {

    ui_clien_pathMap: Map<string, ClientData[]> = new Map();

    svnUpdatePath: string[] = [];  //svn 更新路径

    svnSubmitPath: Set<string> = new Set();  //svn 需要询问提交的路径
    rl: readline.Interface | null = null;
    ignoreFile: string[] = [];

    private _retainExactlyThree(path: string): string {
        const normalized = path.replace(/\\/g, '/');
        const parts = normalized.split(/\/+/).filter(p => p !== '');
        while (parts.length < 3) parts.unshift('');
        return parts.slice(-3).join('/');
    }

    private _init() {
        this.svnUpdatePath.push("../../mk/client/ext-res/shuzhi");
        this.svnUpdatePath.push("../../work/mk/art/导出/UI");
        this.svnUpdatePath.push("../../mk/client/assets/bundles/module/activity/ui/entrance");



        //ui目录对应的客户端文件夹
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon", [
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_"], maxSize: 0.05, onlyAdd: false}
        ]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/页签/页签活动入口", [{clientPath: "../../mk/client/ext-res/shuzhi/activityIcon", prefix: ["common_yqtb_"], maxSize: 0.05, onlyAdd: false}]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/主界面/活动入口", [{clientPath: "../../mk/client/assets/bundles/module/activity/ui/entrance", prefix: ["common_icon_"], maxSize: 0.05, onlyAdd: false}]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/头像框道具", [
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_"], maxSize: 0.05, onlyAdd: false},
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_img_"], maxSize: 0.05, onlyAdd: false}
        ]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/头像/头像框", [{clientPath: "../../mk/client/ext-res/shuzhi/touxiangkuang", prefix: ["common_img_"], maxSize: 0.05, onlyAdd: false}]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/英雄技能图标", [{clientPath: "../../mk/client/ext-res/shuzhi/skillicon", prefix: ["common_icon_"], maxSize: 0.05, onlyAdd: false}]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/称号", [
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_"], maxSize: 0.1, onlyAdd: false},
            {clientPath: "../../mk/client/ext-res/shuzhi/chenghao", prefix: ["common_chenghao_"], maxSize: 0.1, onlyAdd: true}
        ]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/战魂图标", [
            {clientPath: "../../mk/client/ext-res/shuzhi/zhanhun", prefix: ["common_icon_"], maxSize: 0.1, onlyAdd: false},
        ]);
        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/气泡框", [
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_"], maxSize: 0.1, onlyAdd: true},
            {clientPath: "../../mk/client/assets/bundles/module/chat/ui/chatPopover", prefix: ["common_img_"], maxSize: 0.1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/各模块/神器养成", [
            {clientPath: "../../mk/client/ext-res/shuzhi/shenqi/icon", prefix: ["sqlb_img_"], maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/各模块/神器养成/神器与线", [
            {clientPath: "../../mk/client/ext-res/shuzhi/shenqi/icon", prefix: ["sq_img_"],ignoreStrs:['效','果','图'] ,maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/各模块/神器养成/神器与线/神器（新）", [
            {clientPath: "../../mk/client/ext-res/shuzhi/shenqi/icon", prefix: ["sq_img_"],ignoreStrs:['效','果','图'] ,maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/各模块/神器PVE", [
            {clientPath: "../../mk/client/ext-res/shuzhi/shenqi/icon", prefix: ["sqpve_img_sq"],maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/神器图标", [
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_"],maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/神器图标/神器技能图标", [
            {clientPath: "../../mk/client/ext-res/shuzhi/skillicon", prefix: ["common_icon_sqskill_"],maxSize: 1, onlyAdd: true},
        ]);

        this.ui_clien_pathMap.set("../../work/mk/art/导出/UI/通用资源/icon/异宝图标", [
            {clientPath: "../../mk/client/ext-res/shuzhi/gudong/large", prefix: ["yibao_img_"],maxSize: 1, onlyAdd: true},
            {clientPath: "../../mk/client/ext-res/shuzhi/icon", prefix: ["common_icon_yibao"],maxSize: 1, onlyAdd: true},
        ]);
        

        //忽略文件  
        this.ignoreFile.push("common_yqtb_fuzhenlibao.png");
        this.ignoreFile.push("common_yqtb_maoxianzhanling.png");
        this.ignoreFile.push("common_yqtb_mojingrenwu.png");
        this.ignoreFile.push("common_yqtb_patazhanling.png");
        this.ignoreFile.push("common_yqtb_zhuanlunqiyuan.png");

        //活动入口
        this.ignoreFile.push("common_icon_fzhd.png");
        this.ignoreFile.push("common_icon_lyqy.png");
        this.ignoreFile.push("common_icon_xkpf.png");
        this.ignoreFile.push("图标说明.png");
        this.ignoreFile.push("common_icon_gszl.png");
        this.ignoreFile.push("common_icon_xfhl");
        this.ignoreFile.push("common_icon_yhxs.png");
        this.ignoreFile.push("common_icon_yhxsdi.png");
        this.ignoreFile.push("common_icon_zl_ryzl.png");
        this.ignoreFile.push("common_icon_zl_sbzl.png");
        this.ignoreFile.push("common_icon_xfhl.png");
        this.ignoreFile.push("common_icon_zhk_00.png");
        this.ignoreFile.push("common_icon_zhk_01.png");
        this.ignoreFile.push("common_icon_zhk_02.png");
        this.ignoreFile.push("common_icon_zhk_03.png");
        this.ignoreFile.push("common_icon_zhk_04.png");
        this.ignoreFile.push("common_icon_zhxz.png");
        this.ignoreFile.push("common_icon_zhanhunkong.png");
        this.ignoreFile.push("气泡框说明.jpg");
    }

    public main() {
        this._init();
        
        //用gbk 编码 exec svn中文才不乱码。。
        const ps = spawn('powershell.exe', [
            '-Command', 
            '[console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(936)'
        ]);
        
        ps.on('close', (code) => {
            console.log(`PowerShell编码设置[console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(936)\n`);
            this._svnup();
        });
        
        ps.on('error', (error) => {
            console.error(`PowerShell执行错误: ${error}`);
            this._svnup();
        });
    }

    private _svnup() {
        let curPath = this.svnUpdatePath.shift();
        let svnPath = path.join(__dirname, curPath);
        let svnCmd = `svn up ${svnPath}`;
        
        exec(svnCmd, { encoding: 'buffer' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行错误: ${error}`);
                return;
            }
            
            // 将GBK编码的buffer转换为UTF-8字符串
            const output = iconv.decode(stdout as Buffer, 'gbk');
            const errorOutput = stderr ? iconv.decode(stderr as Buffer, 'gbk') : '';
            
            console.log(`命令输出: ${output}`);
            if (errorOutput) {
                console.error(`命令错误: ${errorOutput}`);
            }
    
            if (this.svnUpdatePath.length > 0) {
                this._svnup();
            } else {
                this.checkUpdate();
            }
        });
    }

    checkUpdate() {
        let ui_files = [];
        let client_files = [];

        let totalCount = 0;
        for (let [uiPath, clientDatas] of this.ui_clien_pathMap) {
            for (let clientData of clientDatas) {
                ui_files = [];
                client_files = [];

                let clientPath = clientData.clientPath;
                let clientPrefix = clientData.prefix;
                let clientMaxSize = clientData.maxSize;
                let clientIgnoreStrs = clientData.ignoreStrs;
                let filePath = path.join(__dirname, uiPath);
                let files = fs.readdirSync(filePath);
                for (let file of files) {
                    let fileInfo = fs.statSync(path.join(filePath, file));
                    if (fileInfo.isDirectory()) {
                        continue;
                    }

                    if (this.ignoreFile.includes(file)) {
                        continue;
                    }

                    if(clientIgnoreStrs && clientIgnoreStrs.some(str => file.includes(str))) continue;

                    let curfileMb = Number((fileInfo.size / 1024 / 1024).toFixed(2));
                    if (curfileMb > clientMaxSize) {
                        console.log("\x1b[31m%s\x1b[0m", "警告：该文件大小异常", file, "大小为", curfileMb + "MB", "超过限制", clientMaxSize + "MB");
                        continue;
                    }

                    for (let prefix of clientPrefix) {
                        if (file.startsWith(prefix)) {
                            ui_files.push(file);
                            break;
                        }
                    }
                }

                filePath = path.join(__dirname, clientPath);
                files = fs.readdirSync(filePath);
                for (let file of files) {
                    let fileInfo = fs.statSync(path.join(filePath, file));
                    if (fileInfo.isDirectory() || file.endsWith(".meta")) {
                        continue;
                    }
                    client_files.push(file);
                }

                let curCount = 0;
                for (let file of ui_files) {
                    if (client_files.includes(file) ) {
                        if(clientData.onlyAdd) continue
                        let uiFilePath = path.join(__dirname, uiPath, file);
                        let clientFilePath = path.join(__dirname, clientPath, file);
                        let uiFileInfo = fs.statSync(uiFilePath);
                        let clientFileInfo = fs.statSync(clientFilePath);

                        // if (uiFileInfo.birthtime > clientFileInfo.birthtime || uiFileInfo.size != clientFileInfo.size) {//大小不一样  TODO 需要判断是否是同一张图片
                        if (uiFileInfo.size != clientFileInfo.size) {//大小不一样  TODO 需要判断是否是同一张图片
                            {
                                console.log(uiFilePath, "---", clientFilePath, "------修改", uiFileInfo.birthtime);
                                fs.copyFileSync(uiFilePath, clientFilePath);
                                this.svnSubmitPath.add(clientPath);
                                curCount++;
                                totalCount++;
                            }

                        }

                    } else {
                        let clientFilePath = path.join(__dirname, clientPath, file);
                        let uiFilePath = path.join(__dirname, uiPath, file);
                        console.log(uiFilePath, "---", clientFilePath, "------新增", "onlyAdd", clientData.onlyAdd);
                        fs.copyFileSync(uiFilePath, clientFilePath);
                        this.svnSubmitPath.add(clientPath);
                        curCount++;
                        totalCount++;
                    }
                }

                if(curCount > 0){
                    console.log(uiPath + '共[' + curCount +'] 个资源')
                }
            }
        }

        console.log('合计：' + '[' + totalCount +'] 个资源')

        // 在检查完成后询问用户是否要提交SVN
        this.askForSvnCommit();
    }

    askForSvnCommit() {
        if (this.svnSubmitPath.size == 0) {
            console.log("没有发现任何文件变动，无需提交SVN。");
            this.closeReadline()
            return;
        }

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.rl.question("是否要提交变更到SVN? (y/n): ", (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                console.log("正在提交变更到SVN...");
                // 开始处理第一个路径
                this.processNextPath();
            } else {
                console.log("已取消SVN提交。");
                this.closeReadline();
            }
        });
    }

    processNextPath() {
        if (this.svnSubmitPath.size === 0) {
            console.log("所有路径已处理完毕。");
            this.closeReadline();
            return;
        }

        // 获取下一个要处理的路径
        let curSubmitPath = this.svnSubmitPath.values().next().value;
        this.svnSubmitPath.delete(curSubmitPath);

        let svnPath = path.join(__dirname, curSubmitPath);
        console.log(`准备处理路径: ${svnPath}`);

        this.rl?.question(`是否提交路径 ${svnPath} 到SVN? (y/n): `, (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                // 执行SVN添加和提交
                this.executeSvnCommands(svnPath, () => {
                    // 处理下一个路径
                    this.processNextPath();
                });
            } else {
                console.log(`已跳过路径: ${svnPath}`);
                // 处理下一个路径
                this.processNextPath();
            }
        });
    }

    executeSvnCommands(svnPath: string, callback: () => void) {
        // 先执行svn add，添加新文件
        let addCmd = `svn add "${svnPath}\\*" --force`;
        console.log(`执行命令: ${addCmd}`);

        exec(addCmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`添加文件错误: ${error}`);
                callback();
                return;
            }

            console.log(`添加文件输出: ${stdout}`);

            // 执行svn commit提交变更  
            let commitCmd = `svn commit "${svnPath}" -m "add resource ${this._retainExactlyThree(svnPath)}"`;
            console.log(`执行命令: ${commitCmd}`);

            exec(commitCmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`提交错误: ${error}`);
                    callback();
                    return;
                }
                console.log(`提交输出: ${stdout}`);
                if (stderr) {
                    console.error(`提交错误输出: ${stderr}`);
                }
                console.log(`SVN提交完成: ${svnPath}`);
                callback();
            });
        });
    }

    closeReadline() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
        this.end()
    }

    end()
    {
        const ps = spawn('powershell.exe', [
            '-Command', 
            '[console]::OutputEncoding = [System.Text.Encoding]::UTF8'
        ]);
        
        ps.on('close', (code) => {
            console.log(`\n1PowerShell编码设置[console]::OutputEncoding = [System.Text.Encoding]::UTF8`);
        });
        
        ps.on('error', (error) => {
            console.error(`PowerShell执行错误: ${error}`);
        });
    }
}


let copyIconToClient = new CopyIconToClient();
copyIconToClient.main();
