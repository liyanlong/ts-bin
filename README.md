## ts-bin
> 
使用 ts-bin 可以让你实现 build ts

## Install

```bash
npm install ts-bin -D
ts-bin dev --app ./src/app.ts
```

## Usage

### ts-bin dev
启动 dev 模式, 默认 NODE_ENV = 'local' (可以指定)

```bash
$ ts-bin dev --app 
```
**options**
- `       --env` 环境变量; 默认 local
- `-h, --host [value]` 启动ip; 默认 0.0.0.0
- `-p, --port [value]` 启动port; 默认 8000
- `    --app [value]` 启动入口; 默认 ./src/app.ts
- `    --exec "[value]"` 启动脚本; 默认 node
- `    --args "[value]"` 额外参数; 默认 无

### ts-bin watch
启动 watch 模式, 默认 NODE_ENV = 'local' (可以指定), 监听文件修改后重启服务

**options**

- `       --env` 环境变量; 默认 local
- `-h, --host [value]` 启动ip; 默认 0.0.0.0
- `-p, --port [value]` 启动port; 默认 8000
- `    --app [value]` 启动入口; 默认 ./src/app.ts
- `-w, --watch "[value]"` nodemon 监控文件列表; 默认 ./src/
- `-i, --ignore "[value]"` nodemon 忽略监控文件列表; 默认 无
- `    --exec "[value]"` nodemon启动脚本
- `    --args "[value]"` 额外参数; 默认 无

### ts-bin debug
启动调试模式, 类似于 node --inspect

**options**

- `       --env` 环境变量; 默认 local
- `-h, --host [value]` 启动ip; 默认 0.0.0.0
- `-p, --port [value]` 启动port; 默认 8000
- `    --app [value]` 启动入口; 默认 ./src/app.ts
- `    --inspect [value]` 监听端口: 默认 0.0.0.0:9229
- `    --inspect-brk [value]` 监听端口,启动时打断点
- `-w, --watch "[value]"` nodemon 监控文件列表; 默认 ./src/
- `-i, --ignore "[value]"` nodemon 忽略监控文件列表; 默认 无
- `    --exec "[value]"` nodemon启动脚本
- `    --args "[value]"` 额外参数; 默认 无

优先级:  --inspect-brk value > --inspect value > 默认值 '--inspect=0.0.0.0:9229'

### ts-bin build
启动 build, 将ts打包成js, 默认会将 `process.cwd() + '/build/**'` 打包进代码里

**options**

- `   --framework` 是否打包框架; 默认打包应用
- `   --tsconfig [value]` typescript文件配置; 默认 process.cwd() + /tsconfig.json
- `   --ignore-tar` 是否忽略达成tar.gz包; 默认打包成 包名.tar.gz
- `   --ignore-install` 是否忽略安装; 默认 安装node_modules包
- `   --name [value]` 打包后报名; 默认 package.json 的 name 字段
- `   --src "[value]"` 编译目录; 默认 ./src/
- `   --dist "[value]"` 编译后目录; 默认 ./dist/
- `   --nodemodules-tar` 是否打包node_modules
- `   --after-build "[value]"` 编译后执行命令


### ts-bin start
启动 build 后的js项目, 试用任何启动后台进程的node 服务, 如 koa,express等

**options**

- `    --env [value]` 设置 NODE_ENV 环境变量; 默认 production
- `-h, --host [value]` 启动ip; 默认 0.0.0.0
- `-p, --port [value]` 启动port; 默认 8000
- `    --name [value]`, '应用名称; 默认 package.json 的 name 字段
- `    --app [value]`, '应用入口文件; 默认 process.cwd() + /dist/app.js
- `    --exec "[value]"` 启动脚本; 默认 node
- `    --args "[value]"` 额外参数; 默认 无
- `    --runtime "[value]"` 临时缓存文件夹; 默认 process.cwd() + /runtime/
- `    --daemon` 守护进程; 默认不开启

### ts-bin stop
停止由 ts-bin start 启动的后台进程服务

**options**

- `    --name [value]`, '应用名称; 默认 package.json 的 name 字段


### TIPS
