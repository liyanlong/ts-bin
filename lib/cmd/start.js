'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const BaseCommand = require('./base');
const { mkdirSync, writeFileSync, readFileSync, portIsOccupied, loadName, sleep, hasPid } = require('../util/helper');
const path =require('path');

module.exports = class StartCommand extends BaseCommand {
    
    command () {
        return 'start';
    }
    description () {
        return '启动命令';
    }
    option () {
        return [
            ['  --env [value]', '设置 NODE_ENV 环境变量; 默认 production'],
            ['-h, --host [value]', '端口号; 默认: 0.0.0.0'],
            ['-p, --port [value]', '端口号; 默认: 8000'],
            ['  --name [value]', '应用名称; 默认: package name'],
            ['  --app [value]', '启动入口文件; 默认 process.cwd() + "./dist/app.js"'],
            ['  --exec "[value]"', '启动脚本; 默认 node'],
            ['  --args "[value]"', '启动脚本额外参数; "--harmory" '],
            ['  --runtime [value]', '临时缓存文件夹'],
            ['  --daemon', '守护进程模式'],
        ];
    }

    async action (options) {
        const logger = this.logger;
        const namespace = this.ctx.namespace;
        // 启动环境变量
        process.env.NODE_ENV = options.env || process.env.NODE_ENV || 'production';
        process.env.HOST = options.host || process.env.HOST || '0.0.0.0';
        process.env.PORT = options.port || process.env.PORT || 8000;

        // 执行命令 默默人为 node
        options.exec = options.exec || process.argv[0];

        options.runtime = path.resolve(process.cwd(), options.runtime || './runtime');
        options.app = path.resolve(process.cwd(), options.app || './dist/app.js');
        options.name = loadName(options);

        // 检测端口 是否被占用
        const canUsePort = await portIsOccupied(process.env.PORT);

        if (!canUsePort) {
            logger.error(`启动失败, 端口号 ${process.env.PORT} 被占用`);
            process.exit(1);
        }

        options.runtimeDir = path.join(options.runtime,  '/' + options.name);

        let commandArgs = [
            options.app
        ];
        const title = `[${namespace}][${options.name}]`;
        const args = options.args ? options.args.split(/\s/) : [];
    
        commandArgs = commandArgs.concat(args);
        
        commandArgs.push('--title', title)
        
        const commandOptions = {
            cwd: process.cwd(),
            env: process.env,
            stdio: ['inherit', 'inherit', 'inherit']
        };
    
        process.title = title;
    
        // start
        logger.log(`spawn: ${options.exec} ${commandArgs.join(' ')}`);
    
        if (options.daemon) {
            // 创建 runtime 文件夹
            mkdirSync(path.join(options.runtimeDir, '/log'));

            // @TODO:
            // backup 旧的 log 文件
            commandOptions.stdio[0] = 'ignore';
            commandOptions.stdio[1] = fs.openSync(path.join(options.runtimeDir, '/log/success.log'), 'a');
            commandOptions.stdio[2] = fs.openSync(path.join(options.runtimeDir, '/log/error.log'), 'a');
            commandOptions.detached = true;
    
            const child = spawn(options.exec, commandArgs, commandOptions);
            let pid = child.pid;
            let _code = null;

            child.on('exit', code => {
                if (code !== 0) {
                    _code = code;
                    logger.error(`child process exit, code: ${code}`);
                }
            });

            await sleep(1);
            if(hasPid(pid)) {
                child.unref();
            } else {
                if (_code != 0) {
                    process.exit(_code);
                }
            }
            logger.log(`start success! pid: ${child.pid}`);
        } else {
            const child = spawn(options.exec, commandArgs, commandOptions);
            logger.log(`start success! pid: ${child.pid}`);            
            this.bindEvent(child, options, commandArgs);
        }
    }

    bindEvent (child, options, commandArgs) {
        const logger = this.logger;

        child.once('exit', code => {
            if (code != 0) {
                child.emit('error', new Error(`spawn ${options.exec} ${commandArgs.join(' ')} fail, exit code: ${code}`));
            }
        });
    
        child.on('error', (err) => {
            logger.error('无法启动子进程', err);
        });
    
        // attach master signal to child
        let signal;
        ['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach(event => {
            process.on(event, () => {
                signal = event;
                process.exit(0);
            });
        });
     
        // 给子进程发送信号
        process.on('exit', () => {
            logger.info(`Kill child ${child.pid} with ${signal}`);
            child.kill(signal);
        });
    }

}
