#!/bin/bash

echo "开始清理发布目录..."
rm -rf ./dist/**
echo "清理发布目录完成!"
echo "=="
echo "=="
echo "=="
echo "开始打包 Win32 应用..."
yarn dist:win
echo "打包打包 Win32 应用成功!"
echo "=="
echo "=="
echo "=="
echo "开始打包 MacOS 应用..."
yarn dist:mac
echo "打包 MacOS 应用成功!"
echo "=="
echo "=="
echo "=="
echo "应用打包成功!"
