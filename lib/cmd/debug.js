'use strict';
const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const BaseCommand = require('./base');
const {createNodeEnv} = require('../util/helper');

module.exports = class DevCommand extends BaseCommand {

    command () {
        return 'debug';
    }

    description ()  {
        return '本地开发';
    }

    option () {
        return [
            ['    --env [value]', '环境变量; 默认 local'],
            ['-h, --host [value]', '启动ip; 默认 0.0.0.0'],
            ['-p, --port [value]', '端口号; 默认 8000'],
            ['    --inspect [value]', '启动监听; 默认 0.0.0.0:9229'],
            ['    --inspect-brk [value]', '启动监听, 开始时断点模式'],
            ['-w, --watch "[value]"', 'nodemon 监控文件列表; 默认 ./src/ '],
            ['-i, --ignore "[value]"', 'nodemon 忽略监控文件列表; 默认 无'],
            ['    --app [value]', '启动入口; 默认 ./src/app.ts'],
            ['    --args "[value]"', '额外参数; 默认 无']
        ];
    }

    async action (options) {
        const nodemonFile = require.resolve('nodemon/bin/nodemon');
        const tsNodeFile = require.resolve('ts-node/register');

        // 基本环境变量
        process.env.NODE_ENV = options.env || process.env.NODE_ENV || 'local';    
        process.env.HOST = options.host || process.env.HOST || '0.0.0.0';
        process.env.PORT = options.port || process.env.PORT || 8000;

        // 设置 npm 不更新
        process.env.NO_UPDATE_NOTIFIER = true;

        // 保证 ts-node 运行
        process.env.TS_NODE_FILES = true;

    
        options.watch = options.watch ? options.watch.split(/\s/) : [];
        options.ignore = options.ignore ? options.ignore.split(/\s/) : [];

        let commandArgs = [];
        let inspectArg = '';

        if (options['inspect'] !== undefined) {
            if (options.inspect === true || options.inspect === '') {
                options.inspect = '0.0.0.0:9229';
            }
            inspectArg = `--inspect=${options.inspect}`;
        }
        
        if (options['inspectBrk'] !== undefined) {

            if (options['inspectBrk'] === true || options['inspectBrk'] === '') {
                options['inspectBrk'] = '0.0.0.0:9229';
            }
            inspectArg = `--inspect-brk=${options['inspectBrk']}`;
        }

        if (options.inspect === undefined && options['inspectBrk'] === undefined) {
            inspectArg = `--inspect=0.0.0.0:9229`;
        }

        
        // 如果 监听文件变化重启
        if (options.watch.length) {
            commandArgs.push(nodemonFile);

            options.watch.forEach((arg) => {
                commandArgs.push('--watch', arg);
            });
        
            options.ignore.forEach((arg) => {
                commandArgs.push('--ignore', arg);
            });
            commandArgs.push('-e', 'ts,tsx,js');
            commandArgs.push('--exec', ` ${process.argv[0]} -r ${tsNodeFile} ${inspectArg}`);

        } else {
            commandArgs.push(
                '-r',
                tsNodeFile,
            );
            if (inspectArg) {
                commandArgs.push(
                    inspectArg
                );
            }
        }

        if (options.app) {
            commandArgs.push(options.app);
        }

        const args = options.args ? options.args.split(/\s/) : [];
        commandArgs = commandArgs.concat(args);
        console.info(commandArgs);
        // 启动容器
        const run = spawn(process.argv[0], commandArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: ['ignore', 'inherit', 'inherit']
        });
    }
};
