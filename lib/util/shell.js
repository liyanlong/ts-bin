const {spawn} = require('child_process');
const which = require('which');

async function installPackage (root, script = 'npm') {
    
    let executePath = which.sync(script, {nothrow: true});
    if (!executePath) {
        script = process.env.npm_execpath;
    }
    console.info('install exec: ', executePath)
    const install = spawn(executePath, ['install', '--production'], {
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