#!/bin/bash

# Production Upgrade Verification Script
# 生產環境升級驗證腳本
# Version: 1.0.0
# Date: 2025-09-08

echo "========================================="
echo "🚀 Production環境升級驗證 v1.0.0 → v1.6.0"
echo "========================================="
echo ""

PROD_URL="https://kcislk-infohub.zeabur.app"
EXPECTED_VERSION="1.6.0"
SUCCESS_COUNT=0
FAIL_COUNT=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check test result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL_COUNT++))
    fi
}

echo "📋 開始驗證測試..."
echo "目標環境: $PROD_URL"
echo "期望版本: v$EXPECTED_VERSION"
echo "----------------------------------------"
echo ""

# Test 1: Version Check
echo "1️⃣ 檢查版本號..."
VERSION=$(curl -s $PROD_URL/api/health | jq -r '.version')
echo "   當前版本: v$VERSION"
if [ "$VERSION" == "$EXPECTED_VERSION" ]; then
    check_result 0
else
    echo "   期望版本: v$EXPECTED_VERSION"
    check_result 1
fi
echo ""

# Test 2: Health Status
echo "2️⃣ 檢查健康狀態..."
STATUS=$(curl -s $PROD_URL/api/health | jq -r '.status')
echo "   狀態: $STATUS"
if [ "$STATUS" == "OK" ]; then
    check_result 0
else
    check_result 1
fi
echo ""

# Test 3: Database Connection
echo "3️⃣ 檢查資料庫連接..."
DB_STATUS=$(curl -s $PROD_URL/api/health | jq -r '.performance.database.status')
echo "   資料庫狀態: $DB_STATUS"
if [ "$DB_STATUS" == "healthy" ]; then
    check_result 0
else
    check_result 1
fi
echo ""

# Test 4: Database Data Integrity
echo "4️⃣ 檢查資料完整性..."
USERS=$(curl -s $PROD_URL/api/health | jq -r '.performance.database.counts.users')
EVENTS=$(curl -s $PROD_URL/api/health | jq -r '.performance.database.counts.events')
RESOURCES=$(curl -s $PROD_URL/api/health | jq -r '.performance.database.counts.resources')
echo "   用戶數: $USERS"
echo "   事件數: $EVENTS"
echo "   資源數: $RESOURCES"
if [ ! -z "$USERS" ] && [ ! -z "$EVENTS" ] && [ ! -z "$RESOURCES" ]; then
    check_result 0
else
    check_result 1
fi
echo ""

# Test 5: New OAuth Providers Endpoint
echo "5️⃣ 測試新增OAuth providers端點..."
OAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/api/auth/providers)
echo "   HTTP狀態碼: $OAUTH_STATUS"
if [ "$OAUTH_STATUS" == "200" ]; then
    GOOGLE_PROVIDER=$(curl -s $PROD_URL/api/auth/providers | jq -r '.google.id')
    echo "   Google Provider: $GOOGLE_PROVIDER"
    if [ "$GOOGLE_PROVIDER" == "google" ]; then
        check_result 0
    else
        check_result 1
    fi
else
    check_result 1
fi
echo ""

# Test 6: Homepage Response
echo "6️⃣ 測試主頁響應..."
HOMEPAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/)
HOMEPAGE_TIME=$(curl -s -o /dev/null -w "%{time_total}" $PROD_URL/)
echo "   HTTP狀態碼: $HOMEPAGE_STATUS"
echo "   響應時間: ${HOMEPAGE_TIME}s"
if [ "$HOMEPAGE_STATUS" == "200" ]; then
    check_result 0
else
    check_result 1
fi
echo ""

# Test 7: Public API
echo "7️⃣ 測試公共API端點..."
PUBLIC_API=$(curl -s $PROD_URL/api/public/info | jq -r '.success')
echo "   API響應: success=$PUBLIC_API"
if [ "$PUBLIC_API" == "true" ]; then
    check_result 0
else
    check_result 1
fi
echo ""

# Test 8: Response Time Performance
echo "8️⃣ 檢查響應時間效能..."
RESPONSE_TIME=$(curl -s $PROD_URL/api/health | jq -r '.performance.responseTime' | sed 's/ms//')
echo "   API響應時間: ${RESPONSE_TIME}ms"
# Convert to integer for comparison (remove decimal)
RESPONSE_TIME_INT=${RESPONSE_TIME%.*}
if [ "$RESPONSE_TIME_INT" -lt "500" ]; then
    echo "   效能: 優秀 (<500ms)"
    check_result 0
else
    echo "   效能: 需要優化 (>500ms)"
    check_result 1
fi
echo ""

# Summary
echo "========================================="
echo "📊 驗證結果總結"
echo "========================================="
echo -e "通過測試: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "失敗測試: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 恭喜！Production環境成功升級到v$EXPECTED_VERSION${NC}"
    echo "所有測試都通過了！"
    exit 0
else
    echo -e "${YELLOW}⚠️ 警告：有 $FAIL_COUNT 個測試失敗${NC}"
    echo "請檢查失敗的項目並決定是否需要回滾"
    
    echo ""
    echo "📝 快速回滾指令："
    echo "1. 登入Zeabur控制台"
    echo "2. 選擇kcislk-infohub項目"
    echo "3. 在Deployment History中選擇上一個版本"
    echo "4. 點擊Rollback按鈕"
    exit 1
fi