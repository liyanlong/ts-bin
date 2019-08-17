
const program = require('commander');
const path = require('path');
const UtilConsole = require('./util/console');

const BaseCommand = require('./cmd/base');

const commandFn = [
    'dev',
    'watch',
    'build',
    'start',
    'stop',
    'debug'
];

function getCommandName (name) {
    if (!name) {
        return '';
    }
    const reg = new RegExp('(?:^\\w)|(?:-\\w)', 'g');
    name = name.replace(reg, (val) => {
        return val.replace('-', '').toUpperCase();
    });
    return name + 'Command';
}

class Command {

    constructor(options = {}) {
        this.program = program;
        this.namespace = options.namespace || 'ts-bin';
        this.logger = new UtilConsole({
            name: this.namespace
        });
        this.commandList = [];
        this._isInit = false;
        // this
        this.init();
    }

    version (ver) {
        this.program.version(ver, '-v, --version');
    }

    init () {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        const pkgFile = path.join(process.cwd(), '/package.json');
        const VERSION = require(pkgFile).version;
        this.program.version(VERSION,  '-v, --version');

        this._initCommand();
        this.program.on('--help', () => {
            this.commandList.forEach((cmd) => {
                cmd.help();
            })
        });
    }

    _initCommand () {
        commandFn.forEach(name => {
            const commandName = getCommandName(name);
            const subCmd = new Command[commandName](this.program, this);
            this.commandList.push(subCmd);
        });
    }

    start () {
        this.program.parse(process.argv);
    }

    // 支持 根据 name 替换命令
    static addCommand(name, cls) {

        if (!BaseCommand.isPrototypeOf(cls)) {
           throw new Error(`add command ${name} error. cls is not inherit BaseCommand`);
        }

        if (!~commandFn.indexOf(name)) {
            commandFn.push(name);
        }

        const commandName = getCommandName(name);

        // 更新
        Object.defineProperty(Command, commandName, {
            value: cls,
            writable: false,
            configurable: true         
        });
    }

    // 获取 command 名称
    static getCommand(name) {
        const commandName = getCommandName(name);
        return Command[commandName] ? Command[commandName] : null;
    }
}

// 遍历命令列表, 加载默认命令
// Command.DevCommand = DevCommand;
commandFn.forEach((name) => {
    const cls = require('./cmd/' + name);
    const commandName = getCommandName(name);

    // 设置Command 的属性
    Object.defineProperty(Command, commandName, {
        value: cls,
        writable: false,
        configurable: true
    });
});

Command.BaseCommand = BaseCommand;

module.exports = Command;