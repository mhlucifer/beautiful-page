#!/bin/bash
# Auto Sync Script - 自动同步代码到 GitHub
# 用法: ./auto-sync.sh [提交信息]

REPO_DIR="/root/.openclaw/workspace"
BRANCH="main"

# 进入仓库目录
cd "$REPO_DIR" || exit 1

# 检查是否有 git 仓库
if [ ! -d ".git" ]; then
    echo "❌ 这不是一个 git 仓库"
    exit 1
fi

# 获取当前状态
echo "📊 检查仓库状态..."
git status --short

# 检查是否有变更
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有变更需要提交"
    exit 0
fi

# 添加所有变更
echo "📦 添加变更..."
git add -A

# 提交信息
if [ -z "$1" ]; then
    COMMIT_MSG="Auto sync: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

echo "💾 提交: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# 推送到远程
echo "🚀 推送到 GitHub..."
if git push origin "$BRANCH" 2>&1; then
    echo "✅ 同步成功！"
    echo "🌐 查看: https://github.com/mhlucifer/beautiful-page"
else
    echo "❌ 推送失败，尝试强制推送..."
    git push -u origin "$BRANCH" --force
fi