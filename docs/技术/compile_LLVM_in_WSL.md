---
title: 在WSL中编译LLVM源码并实现覆盖率统计
createTime: 2025/03/01 23:54:44
permalink: /article/2m93m79l/
---

本文详细记录了我在WSL环境下编译LLVM 20.1.0源码并实现代码覆盖率统计的过程中踩过的坑，还包括了集成GTest和覆盖率分析的实战内容。
<!-- more -->

<LinkCard icon="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/csdn.png" title="本文同步发表于我的CSDN博客" href="https://blog.csdn.net/Lane0218/article/details/145956110" />

## 环境准备
本次实验基于WSL（Windows Subsystem for Linux）环境，推荐使用Ubuntu 22.04发行版。核心依赖包括：
- CMake 3.20+
- Ninja构建系统
- GCC/G++ 11+
- 至少16GB物理内存（可以扩展交换分区）
- 50GB可用磁盘空间

> 建议提前安装LLVM编译依赖项：  
`sudo apt install cmake ninja-build gcc g++ python3 zlib1g-dev`

## 源码获取
从[LLVM官方仓库](https://github.com/llvm/llvm-project/releases/)下载20.1.0版本源码包并在WSL中解压
```bash
tar xvf llvm-project-llvmorg-20.1.0-rc3.tar.gz
```
可以使用Free Download Manager加速下载过程
<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/PixPin_2025-03-01_21-05-52.png" alt="源码下载截图" width="500">

## 编译配置与优化
### 构建参数解析
```bash
mkdir build && cd build
cmake -G Ninja ../llvm \
  -DCMAKE_BUILD_TYPE=Release \          # 启用Release优化
  -DLLVM_ENABLE_PROJECTS="clang;compiler-rt" \  # 包含运行时库支持
  -DLLVM_USE_LINKER=gold \             # 使用gold链接器加速链接
  -DLLVM_TARGETS_TO_BUILD=X86 \        # 限定目标架构
  -DBUILD_SHARED_LIBS=ON               # 生成动态库节省空间
```

### 内存优化策略
这里有个小插曲：我在第一次执行ninja开始编译时，编译了十多分钟后遇到`Killed signal terminated program cc1plus`的错误，该错误通常是由于内存不足或交换分区（Swap）不足引起，因此需进行以下调整：
```bash
# 创建8GB交换文件（根据物理内存调整）
sudo dd if=/dev/zero of=/swapfile bs=1G count=8
sudo mkswap /swapfile
sudo swapon /swapfile

# 调整内存使用策略
sudo sysctl vm.swappiness=100  # 提高系统使用Swap的积极性
```

### 并行编译控制
```bash
ninja -j$(($(nproc)/2))  # 推荐使用物理核心数的50%
# 或保守方案（过高并行数（如-j128）可能导致内存争用）
ninja -j2  # 双线程编译
```
然后就是无尽的等待
> **编译耗时参考**：  
> - 14核/16GB内存：约1.5小时

### 编译成功验证
编译完成后，执行如下指令以验证安装结果
```bash
./bin/clang --version # 仍然在build目录下执行这一命令
```

看到这样的输出表示编译成功

<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/PixPin_2025-03-01_20-12-59.png" alt="编译完成验证" width="475">

## 环境配置
```bash
# ~/.bashrc追加
export PATH=/usr/local/libtorch/bin:$PATH:$LLVM_PATH
export LLVM_PATH=/home/ljcwsl/llvm-project-llvmorg-20.1.0-rc3/build/bin

# 立即生效
source ~/.bashrc
```
注意一开始我把LLVM_PATH写成了PATH，导致与上面的PATH重名，整个命令行都无法正确使用
<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/20250301213536.png" alt="环境变量配置" width="525">

## GTest集成与覆盖率分析实战
### 实战项目概览
```bash
.
├── my_lib.cpp
├── my_lib.h
├── run_coverage.sh
└── test_my_lib.cpp

0 directories, 4 files
```
### 测试库设计与实现
本项目构建了数学运算基础库`my_lib`用于测试，包含四类核心函数：整数加法运算、整数减法运算、质数判断、非负整数阶乘。
::: code-tabs
@tab my_lib.h
```cpp:collapsed-lines
// my_lib.h
// Author: Lane
// Date: 2025-03-03

#ifndef MY_LIB_H
#define MY_LIB_H

// 数学运算基础库
namespace math
{

// 计算两个整数的和
int add(int a, int b);

// 计算两个整数的差（a - b）
int subtract(int a, int b);

// 判断数字是否为质数
bool is_prime(int number);

// 计算非负整数的阶乘（返回0表示无效输入）
unsigned long long factorial(int n);

} // namespace math

#endif // MY_LIB_H
```
@tab my_lib.cpp
```cpp:collapsed-lines
// my_lib.cpp
// Author: Lane
// Date: 2025-03-03

#include "my_lib.h"

namespace math
{

int add(int a, int b) { return a + b; }

int subtract(int a, int b) { return a - b; }

bool is_prime(int number)
{
    if (number <= 1)
        return false;
    if (number == 2)
        return true;
    if (number % 2 == 0)
        return false;

    for (int i = 3; i * i <= number; i += 2)
    {
        if (number % i == 0)
            return false;
    }
    return true;
}

unsigned long long factorial(int n)
{
    if (n < 0)
        return 0;
    unsigned long long result = 1;
    for (int i = 2; i <= n; ++i)
    {
        result *= i;
    }
    return result;
}

} // namespace math
```
:::

### 测试用例开发策略
采用GTest框架编写测试集，对其进行白盒测试。
```cpp:collapsed-lines
// test_my_lib.cpp
// Author: Lane
// Date: 2025-03-03

#include <iostream>

#include "my_lib.h"
#include "gtest/gtest.h"

using namespace std;

// 加法基础测试
TEST(MathTest, AddPositiveNumbers)
{
    EXPECT_EQ(math::add(2, 3), 5); // 覆盖add函数
}

// 减法函数全测试
TEST(MathTest, SubtractNormalCase)
{
    EXPECT_EQ(math::subtract(5, 3), 2); // 覆盖subtract函数（第12行）
}

TEST(MathTest, SubtractNegativeResult)
{
    EXPECT_EQ(math::subtract(3, 5), -2); // 覆盖负数结果分支
}

// 质数判断全分支覆盖
TEST(MathTest, PrimeEvenNumber)
{
    EXPECT_FALSE(math::is_prime(4)); // 触发number%2==0分支（第20行）
}

TEST(MathTest, PrimeLargeOddComposite)
{
    EXPECT_FALSE(math::is_prime(9)); // 进入循环并发现因子（i=3时9%3==0）
}

TEST(MathTest, PrimeLargeOddPrime)
{
    EXPECT_TRUE(math::is_prime(17)); // 完整执行循环后返回true（第23-28行）
}

// 阶乘全路径测试
TEST(MathTest, FactorialZero)
{
    EXPECT_EQ(math::factorial(0), 1); // 覆盖n=0路径（第35行未触发，直接返回1）
}

TEST(MathTest, FactorialPositiveNumber)
{
    EXPECT_EQ(math::factorial(5), 120); // 覆盖循环计算（第36-39行）
}

TEST(MathTest, FactorialEdgeCase1)
{
    EXPECT_EQ(math::factorial(1), 1); // 覆盖i=2未执行的情况
}

int main(int argc, char **argv)
{
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

### 覆盖率分析系统构建
接下来编译和运行代码，生成覆盖率分析报告，因为指令比较复杂，所以我写了一个运行在Linux下的自动化测试脚本`run_coverage.sh`
```bash:collapsed-lines
# run_coverage.sh
# Author: Lane
# Date: 2025-03-03

#!/bin/bash

# ---------- 参数配置 ----------

# ------- 需要修改的部分 -------
TARGET_EXEC="test_my_lib"  # 生成的可执行文件名
SOURCE_FILES="my_lib.cpp test_my_lib.cpp"  # 需要编译的源文件
# ------- 需要修改的部分 -------

CLANG_FLAGS="-std=c++17 -fprofile-instr-generate -fcoverage-mapping"  # 覆盖率相关编译参数
GTEST_LIBS="-lgtest -lgtest_main -pthread"  # GTest依赖库
REPORT_DIR="coverage_report"  # HTML报告输出目录

# ---------- 清理旧文件 ----------
cleanup() {
    echo "[1/5] 清理旧构建文件..."
    rm -rf "$TARGET_EXEC" *.profraw *.profdata *.gcda *.gcno "$REPORT_DIR"
}

# ---------- 编译代码 ----------
compile() {
    echo "[2/5] 使用clang++编译代码..."
    clang++ $CLANG_FLAGS $SOURCE_FILES -o $TARGET_EXEC $GTEST_LIBS || {
        echo "编译失败!"
        exit 1
    }
}

# ---------- 运行测试生成覆盖率数据 ----------
run_tests() {
    echo "[3/5] 运行测试生成覆盖率数据..."
    LLVM_PROFILE_FILE="$TARGET_EXEC.profraw" ./$TARGET_EXEC || {
        echo "测试执行失败!"
        exit 1
    }
}

# ---------- 合并覆盖率数据 ----------
merge_coverage() {
    echo "[4/5] 处理覆盖率数据..."
    llvm-profdata merge -sparse "$TARGET_EXEC.profraw" -o "$TARGET_EXEC.profdata" || {
        echo "覆盖率数据合并失败!"
        exit 1
    }
}

# ---------- 生成报告 ----------
generate_reports() {
    echo "[5/5] 生成覆盖率报告..."
    # 生成终端文本报告
    llvm-cov report ./$TARGET_EXEC -instr-profile="$TARGET_EXEC.profdata" > coverage_summary.txt
    echo "文本报告已保存至: coverage_summary.txt"

    # 生成HTML可视化报告
    mkdir -p "$REPORT_DIR"
    llvm-cov show ./$TARGET_EXEC -instr-profile="$TARGET_EXEC.profdata" \
        -format=html -output-dir="$REPORT_DIR" > /dev/null
    echo "HTML报告已生成至: file://$(realpath $REPORT_DIR)/index.html"
}

# ---------- 主流程 ----------
cleanup
compile
run_tests
merge_coverage
generate_reports
```

### 覆盖率结果验证
执行测试脚本后生成GTest和覆盖率测试报告：
```bash
# 赋予脚本执行权限
chmod +x run_coverage.sh

# 执行完整流程
./run_coverage.sh
```
程序运行结果截图如下：

<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/20250303121335.png" alt="image.png" width="500">

在浏览器中打开index.html，可以看到覆盖率分析报告，以及具体的运行次数统计
<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/20250303121427.png" alt="image.png" width="500">
<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/20250303121505.png" alt="image.png" width="400">