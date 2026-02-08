pipeline {
    // 1. 指定在哪里运行，any 表示任何可用的 Jenkins 节点
    agent any

    stages {
        // 2. 环境检查阶段
        stage('环境检查') {
            steps {
                echo '正在检查系统环境...'
                sh 'java -version'
                sh 'git --version'
            }
        }

        // 3. 模拟构建阶段（这里可以改成你的编译命令）
        stage('模拟构建') {
            steps {
                echo '开始构建 mk_tool 项目...'
                // 假设你的项目里有个脚本，可以取消下面这一行的注释
                // sh 'chmod +x ./build.sh && ./build.sh' 
                echo '构建完成！'
            }
        }

        // 4. 测试阶段
        stage('自动化测试') {
            steps {
                echo '正在运行单元测试...'
                sh 'echo "Test Passed!"'
            }
        }
    }

    // 5. 构建后的收尾工作
    post {
        always {
            echo '不管成功还是失败，我都会执行这个动作（比如清理空间）'
        }
        success {
            echo '恭喜！构建成功了。'
        }
        failure {
            echo '哎呀，构建失败了，请检查代码。'
        }
    }
}