'use strict';
const {spawn, execSync} = require('child_process');

const tscFile = require.resolve('typescript/bin/tsc');
const gulpFile = require.resolve('gulp/bin/gulp');
const path = require('path');
const BaseCommand = require('./base');
const { loadName, isExistSync } = require('../util/helper');
const { installPackage } = require('../util/shell');


module.exports = class BuildCommand extends BaseCommand {

    command () {
        return 'build';
    }

    description ()  {
        return '本地打包命令';
    }

    option () {
        return [
            ['    --framework', '是否打包框架; 默认打包应用'],
            ['    --tsconfig [value]', 'typescript文件配置; 默认 process.cwd() + /tsconfig.json'],
            ['    --ignore-tar', '是否忽略达成tar.gz包; 默认打包成 包名.tar.gz'],
            ['    --ignore-install', '是否忽略安装; 默认 安装node_modules包'],
            ['    --name [value]', '打包后报名; 默认 package.json 的 name 字段'],
            ['    --src [value]', '编译目录; 默认 ./src/'],
            ['    --dist [value]', '编译后目录; 默认 ./dist/'],
            ['    --sourcemap', '编译携带sourcemap; 默认不携带'],
            ['    --nodemodules-tar', '是否将node_modules打包成tar.gz'],
            ['    --after-build "[value]"', 'build后置command命令操作, 特别用于新增打包文件'],
            ['     --copy-nodemodules', '直接复制node_modules到 目标目录'],
            ['    --exec [value]', 'default: npm, yarn', 'npm'],
            ['    --registry [value]', 'default none '],
        ];
    }

    async action (options) {
        const context = this;
        const logger = this.logger;
        process.env.TS_BIN_SRC_PATH = path.resolve(process.cwd(), './', options.src ||  './src/');
        process.env.TS_BIN_DIST_PATH = path.resolve(process.cwd(),  './', options.dist || './dist/');
        options.exec = options.exec || 'npm';
        
        options.name = loadName(options);
        const afterBuildShell = options.afterBuild;
        // 使用gulp的 del 任务
        await context.runGulp(options, 'del');

        // tsconfig项目配置
        // 1. 如果指定tsconfig 读取 tsconfig 配置
        let tsconfig = path.resolve(process.cwd(), './', options.tsconfig || './tsconfig.json');

        const commandArgs = [
            tscFile,
            '--project',
            tsconfig
        ];
        if (options.sourcemap) {
            commandArgs.push('--sourceMap');
        } 


        const child = spawn(process.argv[0], commandArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        // build 执行完成
        child.on('close', (code) => {
            if (code === 0) {
                logger.log('tsc end...');
                _run();
            } else {
                process.exit(code);
            }
        });

        async function _run () {
            const isApp = !options.framework;
            const ignoreInstall = !!options.ignoreInstall;
            try {
                await context.runGulp(options, 'copy');
                await context.runGulp(options, 'copy-build');
                if (options.copyNodemodules) {
                    await context.runGulp(options, 'copy-nodemodules');
                }
                if (afterBuildShell) {
                    logger.info('run after build shell: ' + afterBuildShell);
                    await context.runShell(afterBuildShell);
                }
                if (isApp && !ignoreInstall) {
                    await installPackage(path.resolve(process.cwd(), process.env.TS_BIN_DIST_PATH), options.exec, options.registry);
                }
                if (!options.ignoreTar) {
                    if (options.nodemodulesTar) {
                        await context.runGulp(options, 'tar-nodemodules');
                        await context.runGulp(options, 'del-nodemodules');
                    }
                    await context.runGulp(options, 'tar');

                    if (options.nodemodulesTar) {
                        await context.runGulp(options, 'del-nodemodules-tar');
                    }
                }
            } catch (e) {
                logger.error(e.stack || e.message);
                process.exit();                
            }
        }
    }

    async runShell (shell) {
        const logger = this.logger;
        const [command, ...args ] = shell.split(' ');
        const proc = spawn(command, args);
        proc.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        proc.stderr.on('data', (data) => {
            process.stderr.write(`${data}`);
        });

        return await new Promise((resolve, reject) => {
            proc.on('close', (code) => {
                if (code !== 0) {
                    reject('runShell error code:' + code); 
                } else {
                    resolve(code);
                }
            });
        });
    }

    /**
     * 打包操作
     */
    async runGulp (options, job) {
        let resolve, reject;
        const logger = this.logger;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        const gulpConfigFile = path.resolve(__dirname, '../../gulpfile.js');
        const isFramework = !!options.framework;
        const ignoreInstall = !!options.ignoreInstall;
        const command = process.argv[0];
        const commandArgs = [
            gulpFile,
            `--gulpfile`,
            gulpConfigFile,
            `--cwd`,
            process.cwd(),
            job
        ];

        if (!isFramework) {
            commandArgs.push('--app');
        }

        if (ignoreInstall) {
            commandArgs.push('--ignore-install');
        }

        if (options.name) {
            commandArgs.push('--name', options.name);
        }

        const child = spawn(command, commandArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: [null, 'inherit', 'inherit']
        });

        child.on('exit', (code, signal) => {
            if (code !== 0) {
                logger.error(`spawn ${command} ${commandArgs.join(' ')} fail, exit code: ${code}`);
                reject(code);
            } else {
                resolve();
            }
        });

        return promise;
    }

}

