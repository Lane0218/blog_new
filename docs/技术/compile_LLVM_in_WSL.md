---
title: 在WSL中编译LLVM源码并实现覆盖率统计
createTime: 2025/03/01 23:54:44
permalink: /article/2m93m79l/
---

本文详细记录了我在WSL环境下编译LLVM 20.1.0源码并实现代码覆盖率统计的过程中踩过的坑。
<!-- more -->

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

## 覆盖率统计实验
### 测试代码（main.c）
```c
#include <stdio.h>

int main() {
    int loop = 10;
    for (int idx = 0; idx < loop; idx++)
        printf("%s line %d, %d\n", __func__, __LINE__, idx);

    return loop > 0 ? printf("loop>0\n") : printf("loop<=0\n");
}
```

### 覆盖率工作流
```bash
# 编译插桩版本
clang -fprofile-instr-generate -fcoverage-mapping main.c -o main

# 生成执行数据
LLVM_PROFILE_FILE="main.profraw" ./main

# 数据合并处理
llvm-profdata merge -sparse main.profraw -o main.profdata

# 报告生成
llvm-cov show ./main -instr-profile=main.profdata  # 文本模式
llvm-cov report ./main -instr-profile=main.profdata  # 摘要模式
```
程序编译、运行和生成覆盖率报告结果如下图所示
<img src="https://laneljc-1321736255.cos.ap-nanjing.myqcloud.com/pic/PixPin_2025-03-01_21-00-06.png" alt="覆盖率报告" width="450">

## Makefile自动化
上述编译、运行和生成覆盖率报告的过程太过繁琐，所以我写了一个Makefile文件，从而实现自动化：
+ 完整流程（编译→运行→生成HTML报告） `make`
+ 单独生成HTML报告（需先执行过`make`） `make report`
+ 查看文本格式报告 `make show`
+ 清理构建产物 `make clean`

```makefile
# 编译器配置
CC := clang
CFLAGS := -g -fprofile-instr-generate -fcoverage-mapping
LLVM_PROFDATA := llvm-profdata
LLVM_COV := llvm-cov

# 文件路径配置
TARGET := main
PROFRAW := main.profraw
PROFDATA := main.profdata
COV_DIR := coverage_report 

.PHONY: all compile run merge report clean

all: compile run report

# 编译阶段
compile: $(TARGET)

# 编译规则
$(TARGET): main.c
	$(CC) $(CFLAGS) $< -o $@

# 运行生成profraw
run: compile
	@echo "Generating coverage data..."
	@LLVM_PROFILE_FILE="$(PROFRAW)" ./$(TARGET) || (echo "Execution failed"; exit 1)

# 合并profdata
merge: run
	$(LLVM_PROFDATA) merge -sparse $(PROFRAW) -o $(PROFDATA)

# 生成HTML报告
report: merge
	@mkdir -p $(COV_DIR)
	$(LLVM_COV) show ./$(TARGET) -instr-profile=$(PROFDATA) --format=html -output-dir=$(COV_DIR)
	@echo "\nHTML report generated at file://$(COV_DIR)/index.html"

# 文本报告展示
show: merge
	$(LLVM_COV) show ./$(TARGET) -instr-profile=$(PROFDATA)

# 清理生成文件
clean:
	rm -rf $(TARGET) $(PROFRAW) $(PROFDATA) $(COV_DIR) *.dSYM
```