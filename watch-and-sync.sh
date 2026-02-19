#!/bin/bash
# Watch and Sync - 监控文件变化并自动同步
# 用法: ./watch-and-sync.sh [监控目录]

WATCH_DIR="${1:-/root/.openclaw/workspace}"
SYNC_SCRIPT="/root/.openclaw/workspace/auto-sync.sh"
DEBOUNCE_TIME=5  # 防抖时间（秒）

echo "👀 开始监控目录: $WATCH_DIR"
echo "🔄 同步脚本: $SYNC_SCRIPT"
echo "⏱️ 防抖时间: ${DEBOUNCE_TIME}秒"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查依赖
if ! command -v inotifywait &> /dev/null; then
    echo "📦 安装 inotify-tools..."
    apt-get update -qq && apt-get install -y inotify-tools -qq
fi

# 防抖变量
LAST_SYNC=0

# 执行同步的函数
do_sync() {
    local current_time=$(date +%s)
    local time_diff=$((current_time - LAST_SYNC))
    
    # 防抖检查
    if [ $time_diff -lt $DEBOUNCE_TIME ]; then
        echo "⏳ 防抖中... 跳过本次同步"
        return
    fi
    
    LAST_SYNC=$current_time
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔔 检测到文件变化！"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 执行同步脚本
    if [ -x "$SYNC_SCRIPT" ]; then
        "$SYNC_SCRIPT" "Auto-sync: File changed at $(date '+%H:%M:%S')"
    else
        echo "⚠️ 同步脚本不存在或不可执行"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 设置陷阱，确保清理
cleanup() {
    echo ""
    echo "👋 停止监控..."
    exit 0
}
trap cleanup INT TERM

# 主监控循环
echo "🚀 启动监控...（按 Ctrl+C 停止）"
echo ""

# 使用 inotifywait 监控文件变化
inotifywait -m \
    -r \
    -e modify,move,create,delete \
    --exclude='\.git|\.swp|~$' \
    "$WATCH_DIR" \
    --format '%T %w %f %e' \
    --timefmt '%H:%M:%S' \
    2>/dev/null | while read time dir file event; do
        # 排除某些文件类型
        if [[ "$file" =~ \.(log|tmp|pid|lock)$ ]]; then
            continue
        fi
        
        echo "[$time] $event: ${dir}${file}"
        do_sync
    done

# 如果 inotifywait 失败，使用备用方案（轮询）
echo "⚠️ inotify 监控失败，切换到轮询模式..."

LAST_CHECKSUM=""
while true; do
    # 计算目录内容的 MD5
    CURRENT_CHECKSUM=$(find "$WATCH_DIR" -type f -not -path "*/\.git/*" -exec md5sum {} \; 2>/dev/null | md5sum | awk '{print $1}')
    
    if [ "$CURRENT_CHECKSUM" != "$LAST_CHECKSUM" ] && [ -n "$LAST_CHECKSUM" ]; then
        echo "检测到变化（轮询模式）"
        do_sync
    fi
    
    LAST_CHECKSUM="$CURRENT_CHECKSUM"
    sleep 5
done