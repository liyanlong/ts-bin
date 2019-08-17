const Command = require('../../../lib/command');
const BaseCommand = Command.BaseCommand;


module.exports = class TestCommand extends BaseCommand {

    command () {
        return 'local-test';
    }

    option () {
        return [
            ['  --name [value]', '设置name名称']
        ];
    }

    async action (options) {
        console.log('run local test');
    }

};
