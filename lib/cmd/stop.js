'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const BaseCommand = require('./base');
const { findNodeProcess, kill, sleep, loadName } = require('../util/helper');

const path = require('path');


module.exports = class StopCommand extends BaseCommand{

    command () {
        return 'stop';
    }

    option () {
        return [
            ['  --name [value]', '应用名称; 默认 package.json 的 name 字段'],
        ];
    }

    async action (options) {
        const logger = this.logger;
        const namespace = this.ctx.namespace;
        const name = loadName(options);
        const title = `\\[${namespace}\\]\\[${name}\\]`;
        
        let processList = findNodeProcess(item => {
            const cmd = item.cmd;
            const user = item.user || '';
            const reg = new RegExp(title);
            return reg.test(cmd) && (process.env.USER ? user.trim() === process.env.USER : true);
        });
        let pids = processList.map(x => x.pid);
        if (pids.length) {
            logger.info(`got pid ${pids.join(',')}`);
            kill(pids);
        }
        logger.info('stopped');
    }

}
