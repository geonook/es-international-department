#!/bin/bash

# API Issues Auto-Fix Script
# ES International Department - API 問題自動修復腳本

echo "🚀 開始修復 API 問題..."

# 1. 資料庫架構更新
echo "📊 更新資料庫架構..."
npx prisma db push

# 2. 重新生成 Prisma 客戶端
echo "🔄 重新生成 Prisma 客戶端..."
npx prisma generate

# 3. 檢查資料庫連接
echo "🔗 測試資料庫連接..."
npm run test:db

# 4. 清理並重建專案
echo "🧹 清理並重建..."
npm run clean
npm install

# 5. 重新啟動開發伺服器
echo "🚀 重新啟動開發伺服器..."
npm run dev

echo "✅ 自動修復完成！請重新執行 API 測試驗證修復結果。"
