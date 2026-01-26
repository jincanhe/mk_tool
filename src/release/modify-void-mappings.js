const fs = require('fs');
const path = require('path');

/**
 * 从路径中提取最后一个组件作为模块名
 * 例如: "../../../../../extension/battleground/declaration" -> "declaration"
 * 例如: "../../../../component/ui/list/ListView" -> "ListView"
 */
function extractModuleName(importPath) {
    // 移除开头的 ./ 或 ../
    let cleanPath = importPath.replace(/^\.{1,2}\//, '');
    
    // 分割路径并获取最后一部分
    const pathSegments = cleanPath.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // 移除文件扩展名（如果有的话）
    return lastSegment.replace(/\.[^.]*$/, '');
}

/**
 * 修改JavaScript文件中的void 0映射
 */
function modifyVoidMappings(filePath) {
    try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 正则表达式匹配 "路径": void 0, 模式
        const pattern = /("([^"]+)")\s*:\s*void\s+0\s*,/g;
        
        // 替换匹配的内容
        const modifiedContent = content.replace(pattern, (match, fullPath, importPath) => {
            const moduleName = extractModuleName(importPath);
            return `${fullPath}: "${moduleName}",`;
        });
        
        // 如果内容有变化，写回文件
        if (modifiedContent !== content) {
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            console.log(`✓ 成功修改文件: ${filePath}`);
            
            // 显示修改的数量
            const matches = content.match(pattern);
            const changeCount = matches ? matches.length : 0;
            console.log(`  - 共修改了 ${changeCount} 个映射`);
        } else {
            console.log(`⚠ 文件中没有找到需要修改的": void 0,"模式: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ 处理文件时出错: ${filePath}`);
        console.error(error);
    }
}

/**
 * 主函数
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('使用方法: node modify-void-mappings.js <文件路径>');
        console.log('例如: node modify-void-mappings.js jstest.js');
        return;
    }
    
    const filePath = args[0];
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 文件不存在: ${filePath}`);
        return;
    }
    
    console.log(`开始处理文件: ${filePath}`);
    modifyVoidMappings(filePath);
    console.log('处理完成！');
}

// 如果直接运行此脚本，执行主函数
if (require.main === module) {
    main();
}

module.exports = { modifyVoidMappings, extractModuleName };
