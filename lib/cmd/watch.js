'use strict';
const spawn = require('child_process').spawn;
const path = require('path');
const os = require('os');
const BaseCommand = require('./base');


module.exports = class WatchCommand extends BaseCommand {

    command () {
        return 'watch';
    }

    description() {
        return '本地watch开发';
    }

    option () {
        return [
            ['    --env [value]', '环境变量; 默认 local'],            
            ['-h, --host [value]', '启动ip; 默认 0.0.0.0'],
            ['-p, --port [value]', '端口号; 默认 8000'],
            ['    --app [value]', '启动入口; 默认 ./src/app.ts'],
            ['-w, --watch "[value]"', 'nodemon 监控文件列表; 默认 ./src/ '],
            ['-i, --ignore "[value]"', 'nodemon 忽略监控文件列表; 默认 无'],
            ['-e, --exec "[value]"', '启动脚本; 默认 nodemon'],
            ['    --args "[value]"', '额外参数; 默认 无'],
            ['    --tsconfig [value]', 'typescript文件配置; 默认 process.cwd() + /tsconfig.json'],

        ];
    }

    async action (options) {
        const nodemonFile = require.resolve('nodemon/bin/nodemon');
        const tsNodeFile = require.resolve('ts-node/dist/bin');

        process.env.NODE_ENV = options.env || process.env.NODE_ENV || 'local';
        process.env.HOST = options.host || process.env.HOST || '0.0.0.0';
        process.env.PORT = options.port || process.env.PORT || 8000;

        // 设置 npm 不更新
        process.env.NO_UPDATE_NOTIFIER = true;

        // ts-node 支持 tsc
        process.env.TS_NODE_FILES = true;
    
        const execBin = (os.platform() === 'win32' ? `"${process.argv[0]}" ` : '') + tsNodeFile;
    
        options.exec = options.exec || execBin;
    
        options.watch = options.watch ? options.watch.split(/\s/) : [];
        options.ignore = options.ignore ? options.ignore.split(/\s/) : [];

        // tsconfig项目配置
        let tsconfig = path.resolve(process.cwd(), './', options.tsconfig || './tsconfig.json');

        let commandArgs = [
            nodemonFile
        ];
        
        options.watch.forEach((arg) => {
            commandArgs.push('--watch', arg);
        });
    
        options.ignore.forEach((arg) => {
            commandArgs.push('--ignore', arg);
        });
    
        commandArgs.push('-e', 'ts,tsx,js');
        commandArgs.push('--exec', `"${options.exec}" --project ${tsconfig}`);
    
        if (options.app) {
            commandArgs.push(options.app);
        }
    
        const args = options.args ? options.args.split(/\s/) : [];
        commandArgs = commandArgs.concat(args);
    
        // 启动容器
        const run = spawn(process.argv[0], commandArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: ['ignore', 'inherit', 'inherit']
        });
    }
};
