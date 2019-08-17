const {spawn} = require('child_process');
// const which = require('which');
// const fs = require('fs');
async function installPackage (root) {
    let script = process.env.npm_execpath;
    
    // let tnpmPath = which.sync('tnpm', {nothrow: true});
    // let npmPath = which.sync('npm', {nothrow: true});
    // if (tnpmPath) {
    //     script = 'tnpm';
    // }
    // if (npmPath) {
    //     script = 'npm';
    // }
    // if(result) {
    //     script = 'tnpm';
    // } else {
    //     if (result) {
    //         script = 'npm';
    //     }
    // }
    // if (!script) {
    //     throw new Error('tnpm or npm 脚本不存在');
    // }
    // console.info('==>', process);

    const install = spawn(script, ['install', '--production'], {
        cwd: root,
        env: process.env,
        stdio: ['inherit', 'inherit', 'inherit']
    });

    return new Promise((resolve, reject) => {
        install.on('exit', (signal) => {
            if (signal == 0) {
                resolve();
            } else {
                reject({
                    signal: signal,
                    message: 'isntall 执行错误'
                });
            }
        });
        install.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = {
    installPackage
}