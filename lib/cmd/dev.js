'use strict';
const spawn = require('child_process').spawn;
const path = require('path');
const tsNodeFile = require.resolve('ts-node/dist/bin');
const BaseCommand = require('./base');
const {createNodeEnv} = require('../util/helper');

module.exports = class DevCommand extends BaseCommand {

    command () {
        return 'dev';
    }

    description ()  {
        return '本地开发';
    }

    option () {
        return [
            ['    --env [value]', '环境变量; 默认 local'],
            ['-h, --host [value]', '启动ip; 默认 0.0.0.0'],
            ['-p, --port [value]', '端口号; 默认 8000'],
            ['    --app [value]', '启动入口; 默认 ./src/app.ts'],
            ['    --exec "[value]"', '启动脚本; 默认 node'],
            ['    --args "[value]"', '额外参数; 默认 无']
        ];
    }

    async action (options) {
        // 基本环境变量
        process.env.NODE_ENV = options.env || process.env.NODE_ENV || 'local';    
        process.env.HOST = options.host || process.env.HOST || '0.0.0.0';
        process.env.PORT = options.port || process.env.PORT || 8000;

        // 保证 ts-node 运行
        process.env.TS_NODE_FILES = true;

        // 执行脚本 默认 node
        options.exec = options.exec || process.argv[0];

        let commandArgs = [
            `${tsNodeFile}`
        ];

        if (options.app) {
            commandArgs.push(options.app);
        }

        const args = options.args ? options.args.split(/\s/) : [];
        commandArgs = commandArgs.concat(args);
    
        // 启动容器
        const run = spawn(options.exec, commandArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: ['ignore', 'inherit', 'inherit']
        });
    }
};
