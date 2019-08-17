
class UtilConsole {
    
    constructor (options) {
        this.name = options.name;
    }

    getArgs(args) {
        return Array.prototype.slice.call(args, 0).join('\n');
    }
    
    warn() {
        const args = this.getArgs(arguments);
        console.warn.call(console, `\x1B[33m[${this.name}][warn]`, args, '\x1B[39m');
    }
    
    log() {
        const args = this.getArgs(arguments);
        console.log.call(console, `\x1B[32m[${this.name}][info]`, args, '\x1B[39m');
    }

    info() {
        const args = this.getArgs(arguments);
        console.log.call(console, `\x1B[32m[${this.name}][info]`, args, '\x1B[39m');
    }
    
    error() {
        const args = this.getArgs(arguments);
        console.error.call(console, `\x1B[31m[${this.name}][error]`, args, '\x1B[39m');
    }

}

module.exports = UtilConsole;
