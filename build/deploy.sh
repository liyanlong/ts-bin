#!/bin/bash

# 当前 zhiyun目录
CONTEXT=$(cd `dirname $0`;cd ..;pwd);

cd $CONTEXT;
echo "start deploy...";

MODULE_ZIP="$CONTEXT/node_modules.tar.gz";

# 解压 node_modules
if [ -e "$MODULE_ZIP" ]; then
    echo "start decompression $MODULE_ZIP";
    tar -xzf "$MODULE_ZIP" -C $CONTEXT;
else
    echo "empty $MODULE_ZIP";
fi

echo "end deploy...";
