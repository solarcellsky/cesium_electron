#!/bin/bash

echo "开始清理发布目录..."
rm -rf ./dist/**
echo "清理发布目录完成!"
echo "======"
echo "开始打包 Windows 应用..."
yarn dist:win
echo "打包打包 Windows 应用成功!"
echo "=="
echo "=="
echo "=="
echo "开始打包 MacOS 应用..."
yarn dist:mac
echo "打包 MacOS 应用成功!"
echo "======"
echo "应用打包成功!"
