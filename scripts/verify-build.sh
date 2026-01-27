#!/bin/bash

# 验证生产构建的 base path 配置
# Usage: ./scripts/verify-build.sh

set -e

echo "🔍 验证生产构建配置..."
echo ""

# 检查 .env.production 文件
if [ ! -f .env.production ]; then
    echo "❌ 错误: .env.production 文件不存在"
    exit 1
fi

echo "✅ .env.production 文件存在"

# 读取 BASE_PATH
BASE_PATH=$(grep "^VITE_BASE_PATH=" .env.production | cut -d '=' -f2)
echo "📍 配置的 BASE_PATH: $BASE_PATH"
echo ""

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build
echo ""

# 检查 dist/index.html
if [ ! -f dist/index.html ]; then
    echo "❌ 错误: dist/index.html 不存在"
    exit 1
fi

echo "✅ dist/index.html 已生成"
echo ""

# 检查 base path 是否正确应用
echo "🔍 检查资源路径..."
echo ""

# 检查 script 标签
SCRIPT_SRC=$(grep -o 'src="[^"]*\.js"' dist/index.html | head -1)
echo "Script 标签: $SCRIPT_SRC"

# 检查 link 标签
LINK_HREF=$(grep -o 'href="[^"]*\.css"' dist/index.html | head -1)
echo "Link 标签: $LINK_HREF"

# 检查 favicon
FAVICON=$(grep -o 'href="[^"]*vite\.svg"' dist/index.html | head -1)
echo "Favicon: $FAVICON"

echo ""

# 检查路径是否包含 base path (如果不是根路径)
if [ "$BASE_PATH" != "/" ]; then
    EXPECTED_PREFIX="${BASE_PATH%/}"  # 移除末尾的 /

    if echo "$SCRIPT_SRC" | grep -q "$EXPECTED_PREFIX"; then
        echo "✅ Script 路径正确 (包含 $EXPECTED_PREFIX)"
    else
        echo "⚠️  警告: Script 路径不包含 $EXPECTED_PREFIX"
    fi

    if echo "$LINK_HREF" | grep -q "$EXPECTED_PREFIX"; then
        echo "✅ Link 路径正确 (包含 $EXPECTED_PREFIX)"
    else
        echo "⚠️  警告: Link 路径不包含 $EXPECTED_PREFIX"
    fi

    if echo "$FAVICON" | grep -q "$EXPECTED_PREFIX"; then
        echo "✅ Favicon 路径正确 (包含 $EXPECTED_PREFIX)"
    else
        echo "⚠️  警告: Favicon 路径不包含 $EXPECTED_PREFIX"
    fi
else
    echo "ℹ️  BASE_PATH 为根路径,跳过前缀检查"
fi

echo ""
echo "✅ 验证完成!"
echo ""
echo "📝 下一步:"
echo "   1. 运行 'npm run preview' 预览构建"
if [ "$BASE_PATH" != "/" ]; then
    echo "   2. 访问 http://localhost:4173${BASE_PATH}"
else
    echo "   2. 访问 http://localhost:4173/"
fi
echo "   3. 检查所有资源是否正确加载"
echo ""
