const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { isWin } = require('./env');
const net = require('net');
const REGEX = isWin ? /^(.+)\s+(\d+)\s+(.+)\s+\s*$/ : /^\s*(.*)\s+(\d+)\s+(.+)\s*/;

// 递归创建一个文件夹
function mkdirSync (dir) {
    const subdir = path.dirname(dir);
    if (!fs.existsSync(subdir)) {
        mkdirSync(subdir);    
    }
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

// 写入数据至一个文件
function writeFileSync (file, data) {
    mkdirSync(path.dirname(file));
    fs.writeFileSync(file, data);
}

function readFileSync (file) {
    if (fs.existsSync(file)) {
        return fs.readFileSync(file);
    }
    return null;
}

function removeFileSync (file) {

}

function findNodeProcess (filterFn) {
    const command = isWin ?
    'wmic Path win32_process Where "Name = \'node.exe\'" Get CSName,ProcessId,CommandLine' :
    // command, cmd are alias of args, not POSIX standard, so we use args
    'ps -eo "user,pid,args"';

    const stdout = execSync(command, { stdio: 'pipe' });

    const processList = stdout.toString().split('\n')
        .reduce((arr, line) => {
        if (!!line && !line.includes('/bin/sh')) {
            const m = line.match(REGEX);
            /* istanbul ignore else */
            if (m) {
                const item = isWin ? { user: m[1], pid: m[2], cmd: m[3] } : { user: m[1], pid: m[2], cmd: m[3] };
                if (!filterFn || filterFn(item)) {
                    arr.push(item);
                }
            }
        }
        return arr;
        }, []);
    return processList;
}

function hasPid (pid) {
    const list = findNodeProcess(item => {
        return item.pid == pid;
    });
    return list.length === 1;
}

 
// 检测端口是否被占用
async function portIsOccupied (port) {
    const promise = new Promise((resolve, reject) => {
        const server = net.createServer().listen(port)
        server.on('listening', function () { // 执行这块代码说明端口未被占用
            server.close(); // 关闭服务
            resolve(true);
        });
            
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                server.close();
                resolve(false);
            }
        });
    });
    return await promise;
}


function kill (pids, signal) {
    pids.forEach(pid => {
        try {
            process.kill(pid, signal);
        } catch (err) { /* istanbul ignore next */
            // pid 不存在
            if (err.code !== 'ESRCH') {
                throw err;
            }
        }
    });
}

function sleep (seconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, seconds * 1000);
    });
}

/**
 * 读取 name值, 默认读取 options.name 不存在读取 package.json 的 name字段
 * @param {*} options 
 */
function loadName (options) {
    if (typeof options.name === 'string') {
        return options.name;
    }
    try {
        const defaultName = require(path.join(process.cwd(), '/package.json')).name;
        console.warn('未定义 --name [value] 参数, 默认读取 package.json name');
        return defaultName;
    } catch(e) {
        console.error('启动时请配置 --name [value]参数');
        process.exit(1);
    }
}

function isExistSync (filepath) {
    return fs.existsSync(filepath);
}

module.exports = {
    mkdirSync,
    writeFileSync,
    isExistSync,
    readFileSync,
    removeFileSync,
    findNodeProcess,
    hasPid,
    portIsOccupied,
    kill,
    sleep,
    loadName,
};
