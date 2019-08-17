
module.exports = class BaseCommand {

    constructor (program, command) {
        this.program = program;
        this.ctx = command;
        this.logger = this.ctx.logger;
        this.init();
    }

    init () {
        let cmd = this.program;        
        let options = [];

        if (this.usage) {
            cmd = cmd.usage(this.usage());
        }
        
        if (this.command) {
            cmd = cmd.command(this.command());
        }

        if (this.description) {
            cmd = cmd.description(this.description());
        }

        if (this.option) {
            options = this.option() || [];
        }

        options.forEach((optionArg) => {
            cmd = cmd.option.apply(cmd, optionArg);
        });

        if (this.action) {
            cmd.action(this.action.bind(this));
        }

    }

    help () {}
}
