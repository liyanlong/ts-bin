const Command = require('../../../lib/command');

// 获取已有的命令
const WatchCommand = Command.getCommand('watch');

class CustomWatchCommand extends WatchCommand {

    command () {
        return 'local-watch';
    }

    option () {
        const options = super.option();
        options.push(
            ['  --env [value]', '设置node env 的环境变量值']
        );
        return options;
    }

    async action (options) {

        if (options.env) {
            // 设置 NODE_ENV 的值            
            process.env.NODE_ENV = options.env;
        }
        return await super.action(options);
    }
}

module.exports =  CustomWatchCommand;
