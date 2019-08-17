const WatchCommand = require('./cmd/watch');
const TestCommand = require('./cmd/test');

const Command = require('../../lib/command');

Command.addCommand('custom-watch', WatchCommand);
Command.addCommand('local-test', TestCommand);

new Command().start();