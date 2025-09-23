/**
 * 字体处理工具 - 从Python font_procress.py转换而来
 * 功能：提取字符集并生成子集化字体
 */

import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import * as readline from "readline";
import { Font } from "opentype.js";
import opentype = require("opentype.js");

export class FontTools {
    private dir: string = __dirname;
    private tempHtml: string;
    private tempCss: string;
    private skipFiles: Set<string> = new Set([
        "LanguageText.ts", // 前端配置
        ".DS_Store"
    ]);
    private includeFilesRegular: Set<string> = new Set([
        ".ts",
        ".prefab"
    ]);
    private chars: Set<string> = new Set(); // 完整的字符集
    private rl: readline.Interface | null = null;

    constructor() {
        this.tempHtml = path.join(this.dir, 'font/template/font.html');
        this.tempCss = path.join(this.dir, 'font/template/font.css');
        
        // 确保模板目录存在
        if (!fs.existsSync(path.join(this.dir, 'font/template'))) {
            fs.mkdirSync(path.join(this.dir, 'font/template'), { recursive: true });
        }
        // 确保临时目录存在
        if (!fs.existsSync(path.join(this.dir, 'font/temp'))) {
            fs.mkdirSync(path.join(this.dir, 'font/temp'), { recursive: true });
        }
    }

    public static main() {
        console.log("字体处理工具启动中...");
        const fontTools = new FontTools();
        fontTools.parseCommandLineArguments();
    }

    private parseCommandLineArguments() {


        this.processFont()

        return;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("请选择操作模式：");
        console.log("1. 重建配置文件和字体(对应Python脚本的--rebuid)");
        console.log("2. 仅生成字体文件");
        console.log("3. 退出");

        this.rl.question("请输入选项(1-3): ", (answer) => {
            switch (answer) {
                case "1":
                    this.askForPaths(true);
                    break;
                case "2":
                    this.askForPaths(false);
                    break;
                case "3":
                    console.log("程序退出");
                    this.closeReadline();
                    break;
                default:
                    console.log("无效选项，请重新选择");
                    this.parseCommandLineArguments();
                    break;
            }
        });
    }

    private askForPaths(rebuild: boolean) {
        this.rl?.question("请输入项目分支路径: ", (brancePath) => {
            this.rl?.question("请输入配置目录路径: ", (configDir) => {
                this.rl?.question("是否拷贝生成的字体文件到目标位置? (y/n): ", (copyAnswer) => {
                    const isCopyFile = copyAnswer.toLowerCase() === 'y' || copyAnswer.toLowerCase() === 'yes';
                    
                    this.rl?.question("是否在完成后提交SVN? (y/n): ", (svnAnswer) => {
                        const doSvnCommit = svnAnswer.toLowerCase() === 'y' || svnAnswer.toLowerCase() === 'yes';
                        
                        console.log("处理中，请稍候...");
                        this.processFont(brancePath, configDir, rebuild, isCopyFile, doSvnCommit);
                        this.closeReadline();
                    });
                });
            });
        });
    }

    private closeReadline() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    private log(content: string) {
        console.log(content);
    }

    private segChar(sent: string, charDict: Set<string>) {
        // 首先分割英文以及英文和标点
        // 使用正则表达式分割非单词字符
        const parts = sent.split(/(\W)/);
        
        // 分割中文
        for (let part of parts) {
            if (part.trim().length > 0) {
                const chars = part.split(/([\\u4e00-\\u9fa5])/);
                for (let w of chars) {
                    for (let c of w.trim()) {
                        if (!charDict.has(c)) {
                            console.log(`加入字符 ${charDict.size} ${c}`);
                            charDict.add(c);
                        }
                    }
                }
            }
        }
    }

    private loadBaseChars(charDict: Set<string>) {
        const filePath = path.join(this.dir, "font/Fonts_CN.txt");
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            for (let line of lines) {
                this.segChar(line, charDict);
            }
        } else {
            console.log(`基础字符文件不存在: ${filePath}`);
        }
    }

    private grepFromFile(filePath: string, needMatchMultLine: boolean, charDict: Set<string>) {
        const fName = path.basename(filePath);
        if (this.skipFiles.has(fName)) {
            return;
        }

        let bOK = false;
        for (let includeFileEnd of this.includeFilesRegular) {
            if (fName.endsWith(includeFileEnd)) {
                bOK = true;
                break;
            }
        }

        if (!bOK) {
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 移除日志函数内容
            const ignorePatterns = /(cc\.log\(.*\)|cc\.warn\(.*\)|cc\.error\(.*\)|this\.log\(.*\)|console\.log\(.*\)|console\.error\(.*\)|console\.warn\(.*\))/g;
            let s = content.replace(ignorePatterns, "");
            
            // 提取多行模板字符串内容
            if (needMatchMultLine) {
                const multiLinePattern = /\`([^\`]*)\`/g;
                const results = s.match(multiLinePattern) || [];
                for (let result of results) {
                    // 去掉反引号
                    result = result.substring(1, result.length - 1);
                    this.segChar(result, charDict);
                }
            }

            // 按行分析提取字符串内容
            const lines = s.split('\n');
            for (let line of lines) {
                let stack: string[] = [];
                let isInDOT = false;
                let curDotFlag: string | null = null;  // 当前引号类型

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (isInDOT) {
                        stack.push(char);
                    }

                    if ((char === "'" || char === '"') && (!curDotFlag || curDotFlag === char)) {
                        if (isInDOT) {
                            // 检查是否有转义
                            if (stack.length >= 2 && stack[stack.length-2] === '\\') {
                                continue;
                            }
                            
                            // 已经在引号内，去除最后一次的引号，收集字符
                            const content = stack.slice(0, -1).join('');
                            stack = [];
                            this.segChar(content, charDict);
                            isInDOT = false;
                            curDotFlag = null;
                        } else {
                            isInDOT = true;
                            curDotFlag = char;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`处理文件出错: ${filePath}`, error);
        }
    }

    private workFlowForGrep(brancePath: string, configDirPath: string): string {
        this.chars.clear();
        this.loadBaseChars(this.chars);

        // 处理代码目录TODO
        // const scriptPath = path.join(brancePath, "client/assets/scripts/testFont");
        // if (fs.existsSync(scriptPath)) {
        //     this.processDirectory(scriptPath, false);
        // } else {
        //     console.log(`脚本目录不存在: ${scriptPath}`);
        // }

        // 将字符集转换为字符串
        let charStr = "";
        for (let c of this.chars) {
            charStr += c;
        }

        console.log(`提取字符集: ${charStr}`);
        return charStr;
    }

    private processDirectory(dirPath: string, needMatchMultLine: boolean) {
        if (!fs.existsSync(dirPath)) {
            return;
        }

        const files = fs.readdirSync(dirPath);
        for (let file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.processDirectory(fullPath, needMatchMultLine);
            } else {
                this.grepFromFile(fullPath, needMatchMultLine, this.chars);
            }
        }
    }

    private loadStream(fileName: string, ...args: any[]): string {
        if (fs.existsSync(fileName)) {
            let content = fs.readFileSync(fileName, 'utf-8');
            
            if (content.length > 0) {
                for (let i = 0; i < args.length; i++) {
                    content = content.replace(`\${${i}}`, String(args[i]));
                }
                return content;
            } else {
                throw new Error(`文件内容为空: ${fileName}`);
            }
        } else {
            throw new Error(`文件不存在: ${fileName}`);
        }
    }

    private makeFont(name: string, makeConfig: any, brancePath: string, configDir: string) {
        // 获取字符集
        let content = "";
        if (makeConfig.way === 'glup') {
            content = this.workFlowForGrep(brancePath, configDir);
        } else {
            content = makeConfig.content;
        }
        makeConfig.content = content;

        // 生成html
        const outHtml = path.join(this.dir, "font/temp", name + '.html');
        if (fs.existsSync(outHtml)) {
            fs.unlinkSync(outHtml);
        }

        // 如果模板文件不存在，创建默认模板
        if (!fs.existsSync(this.tempHtml)) {
            this.createDefaultTemplates();
        }

        const htmlStr = this.loadStream(this.tempHtml, name, content);
        fs.writeFileSync(outHtml, htmlStr);

        // 生成css
        const outCss = path.join(this.dir, "font/temp", name + '.css');
        if (fs.existsSync(outCss)) {
            fs.unlinkSync(outCss);
        }

        const cssStr = this.loadStream(this.tempCss, name, makeConfig['font-family']);
        fs.writeFileSync(outCss, cssStr);

        console.log(`生成结束 ${name}`);
    }

    private createDefaultTemplates() {
        // 创建默认的HTML模板
        const defaultHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>\${0}</title>
    <link rel="stylesheet" href="\${0}.css">
</head>
<body>
    <div class="content">\${1}</div>
</body>
</html>`;
        fs.writeFileSync(this.tempHtml, defaultHtml);

        // 创建默认的CSS模板
        const defaultCss = `@font-face {
    font-family: '\${0}';
    src: url('\${0}');
}
.content {
    font-family: '\${0}';
}`;
        fs.writeFileSync(this.tempCss, defaultCss);
    }

    private generate(sourceFont: string, fontSet: string, outFile: string) {
        //使用openType
        opentype.load(sourceFont, (err, font) => {
            if (err) throw err;
          
            // 2. 筛选字符
            const targetChars = fontSet.split('');
            const targetGlyphs = targetChars
              .map(char => font.charToGlyph(char))
              .filter(glyph => glyph !== null) as opentype.Glyph[];
          

            const newFont = new opentype.Font({
                familyName: 'SubsetFont',
                styleName: 'SubsetFont',
                unitsPerEm: font.unitsPerEm,
                ascender: font.ascender,
                descender: font.descender,
                glyphs: targetGlyphs
              });
              const buffer = newFont.toArrayBuffer();
              fs.writeFileSync(outFile, Buffer.from(buffer));

          });
        
    }

    private processFont(brancePath?: string, configDir?: string, rebuild?: boolean, isCopyFile?: boolean, doSvnCommit?: boolean) {
        const configPath = path.join(this.dir, "font/config.json");
        let startTime = Date.now();

        try {
            // 读取配置文件
            if (!fs.existsSync(configPath)) {
                console.error(`配置文件不存在: ${configPath}`);
                return;
            }

            const jsonData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

            rebuild = true
            // 是否重建
            if (rebuild) {
                const tmpDir = path.join(this.dir, "font/temp");
                if (fs.existsSync(tmpDir)) {
                    // 清空tmp目录
                    fs.readdirSync(tmpDir).forEach(file => {
                        fs.unlinkSync(path.join(tmpDir, file));
                    });
                } else {
                    fs.mkdirSync(tmpDir, { recursive: true });
                }

                // 生成配置文件
                for (let baseName in jsonData) {
                    this.makeFont(baseName, jsonData[baseName], brancePath, configDir);
                }

                // 保存更新后的配置
                fs.writeFileSync(configPath, JSON.stringify(jsonData, null, 4));
            }

            // 批量生成字体
            for (let baseName in jsonData) {
                const srcFontFile = path.join(this.dir, "font/源文件", baseName);
                const destFontFile = path.join(this.dir, "font/输出文件", baseName);

                this.generate(srcFontFile, jsonData[baseName].content, destFontFile);
            }

            // 复制文件到目标位置
            if (isCopyFile) {
                for (let baseName in jsonData) {
                    const makeConfig = jsonData[baseName];
                    const fontPath = path.join(this.dir, "tmp", baseName);
                    const destFile = path.join(brancePath, makeConfig.destPath);

                    if (fs.existsSync(fontPath)) {
                        // 确保目标目录存在
                        const destDir = path.dirname(destFile);
                        if (!fs.existsSync(destDir)) {
                            fs.mkdirSync(destDir, { recursive: true });
                        }

                        // 删除旧文件
                        if (fs.existsSync(destFile)) {
                            fs.unlinkSync(destFile);
                        }

                        // 复制新文件
                        console.log(`复制字体到: ${destFile}`);
                        fs.copyFileSync(fontPath, destFile);

                        // // 提交SVN
                        // if (doSvnCommit) {
                        //     const svnCmd = `svn commit -m "update font" "${destFile}"`;
                        //     console.log(`执行SVN提交: ${svnCmd}`);
                        //     exec(svnCmd, (error, stdout, stderr) => {
                        //         if (error) {
                        //             console.error(`SVN提交错误: ${error}`);
                        //             return;
                        //         }
                        //         console.log(`SVN提交输出: ${stdout}`);
                        //     });
                        // }
                    }
                }
            }

            const timeUsed = (Date.now() - startTime) / 1000;
            console.log(`所有任务完成! 用时 ${timeUsed} 秒`);

        } catch (error) {
            console.error("处理过程中出现错误:", error);
        }
    }
}

FontTools.main();

