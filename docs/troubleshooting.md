# Troubleshooting Guide | 故障排除指南
*ES International Department - 常見問題解決方案*

## 📋 Overview | 概述

This comprehensive troubleshooting guide covers common issues you might encounter while developing, deploying, or using the ES International Department application. Each issue includes symptoms, root causes, and step-by-step solutions.

本綜合故障排除指南涵蓋了在開發、部署或使用 ES 國際部應用程式時可能遇到的常見問題。每個問題都包含症狀、根本原因和逐步解決方案。

## 🚨 Emergency Procedures | 緊急程序

### Quick Health Check | 快速健康檢查

```bash
# 1. Check application health | 檢查應用程式健康狀態
curl -f https://es-international.zeabur.app/api/health

# 2. Verify database connection | 驗證資料庫連接
npm run test:db

# 3. Check service status | 檢查服務狀態
# Visit Zeabur dashboard or status page

# 4. Review recent logs | 查看最近的日誌
zeabur logs --env production --tail 100
```

### Emergency Contacts | 緊急聯絡資訊

- **Technical Support**: [tech-support@example.com](mailto:tech-support@example.com)
- **Development Team**: [dev-team@example.com](mailto:dev-team@example.com)
- **System Administrator**: [admin@example.com](mailto:admin@example.com)

---

## 🛠️ Development Issues | 開發問題

### 1. Environment Setup Issues | 環境設定問題

#### Issue: Node.js Version Compatibility
```bash
❌ Error: The engine "node" is incompatible with this module
```

**Symptoms:** | **症狀：**
- Build fails with Node.js version error
- Dependencies fail to install
- TypeScript compilation errors

**Solutions:** | **解決方案：**
```bash
# Check current Node.js version
node --version

# Install correct Node.js version (18+)
# Using nvm (recommended)
nvm install 18
nvm use 18

# Using direct download
# Visit https://nodejs.org and download Node.js 18+

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should be compatible version
```

#### Issue: pnpm Not Found
```bash
❌ Error: pnpm: command not found
```

**Solutions:** | **解決方案：**
```bash
# Install pnpm globally
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm

# Or using npm
npm install -g @pnpm/exe

# Verify installation
pnpm --version  # Should show version 8+
```

#### Issue: Environment Variables Not Loading
```bash
❌ Error: Environment variable DATABASE_URL is not defined
```

**Solutions:** | **解決方案：**
```bash
# 1. Check if .env.local exists
ls -la .env*

# 2. Copy from template if missing
cp .env.example .env.local

# 3. Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# 4. Check Next.js environment variable loading
# Ensure variables start with NEXT_PUBLIC_ for client-side
# or are defined in next.config.js for server-side

# 5. Restart development server
pnpm dev
```

### 2. Database Issues | 資料庫問題

#### Issue: Database Connection Failed
```bash
❌ Error: P1001: Can't reach database server at `localhost:5432`
```

**Symptoms:** | **症狀：**
- Application fails to start
- Database queries timeout
- Health check endpoint returns error

**Solutions:** | **解決方案：**
```bash
# 1. Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database

# 2. Test database connection
pnpm test:db

# 3. For local PostgreSQL
# Check if PostgreSQL is running
brew services list | grep postgresql
# Start PostgreSQL if not running
brew services start postgresql

# 4. For Zeabur database
# Check Zeabur dashboard for database status
# Verify connection string is correct

# 5. Check firewall/network issues
telnet your-db-host 5432

# 6. Regenerate Prisma client
pnpm db:generate
```

#### Issue: Migration Failed
```bash
❌ Error: Migration `20231201000000_init` failed to apply
```

**Solutions:** | **解決方案：**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset database (development only)
npx prisma migrate reset

# 3. Resolve migration conflicts
npx prisma migrate resolve --rolled-back 20231201000000_migration_name

# 4. Apply pending migrations
npx prisma migrate deploy

# 5. If all else fails, push schema directly (development)
npx prisma db push --force-reset
```

#### Issue: Prisma Client Not Generated
```bash
❌ Error: @prisma/client did not initialize yet
```

**Solutions:** | **解決方案：**
```bash
# 1. Generate Prisma client
pnpm db:generate

# 2. Check if Prisma client exists
ls -la node_modules/.prisma/client/

# 3. Reinstall dependencies if corrupted
rm -rf node_modules package-lock.json
pnpm install

# 4. Add postinstall script to package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 3. Build and Compilation Issues | 建置和編譯問題

#### Issue: TypeScript Compilation Errors
```bash
❌ Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:** | **解決方案：**
```typescript
// ✅ Use type guards
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined')
}

// ✅ Use non-null assertion (when you're sure)
const databaseUrl = process.env.DATABASE_URL!

// ✅ Use default values
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/defaultdb'

// ✅ Type assertion (use cautiously)
const databaseUrl = process.env.DATABASE_URL as string
```

#### Issue: ESLint Errors
```bash
❌ Error: 'console' is not defined  no-undef
```

**Solutions:** | **解決方案：**
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  rules: {
    'no-console': 'warn', // Allow console with warning
    // or disable completely for development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}

// Or fix individual instances
// eslint-disable-next-line no-console
console.log('Debug information')
```

#### Issue: Next.js Build Failures
```bash
❌ Error: Failed to compile with 1 error
```

**Solutions:** | **解決方案：**
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Clean install dependencies
rm -rf node_modules package-lock.json
pnpm install

# 3. Check for syntax errors
pnpm lint

# 4. Type check
pnpm typecheck

# 5. Build with detailed output
pnpm build --debug

# 6. Check Next.js configuration
# Verify next.config.js is correct
```

---

## 🐳 Docker Issues | Docker 問題

### 1. Docker Build Issues | Docker 建置問題

#### Issue: Docker Build Failed
```bash
❌ Error: failed to solve with frontend dockerfile.v0
```

**Solutions:** | **解決方案：**
```bash
# 1. Check Dockerfile syntax
docker build --no-cache -t es-international-test .

# 2. Clear Docker cache
docker system prune -a

# 3. Check Docker version
docker --version  # Should be 20.10+

# 4. Verify base image availability
docker pull node:22-slim

# 5. Check for .dockerignore issues
cat .dockerignore
# Ensure it doesn't exclude necessary files

# 6. Build with BuildKit
DOCKER_BUILDKIT=1 docker build -t es-international-test .
```

#### Issue: Multi-stage Build Problems
```bash
❌ Error: COPY failed: no source files were specified
```

**Solutions:** | **解決方案：**
```dockerfile
# Check stage dependencies
# Stage 1: deps
FROM node:22-slim AS deps
# ... install dependencies

# Stage 2: builder  
FROM node:22-slim AS builder
# Copy from deps stage
COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/package.json ./package.json

# Ensure files exist before COPY
RUN ls -la  # Debug: list files

# Stage 3: runner
FROM node:22-slim AS runner
# Copy built files
COPY --from=builder /src/.next/standalone ./
```

### 2. Docker Runtime Issues | Docker 運行時問題

#### Issue: Container Exits Immediately
```bash
❌ Error: Container exited with code 1
```

**Solutions:** | **解決方案：**
```bash
# 1. Check container logs
docker logs <container-id>

# 2. Run container interactively
docker run -it --entrypoint /bin/sh es-international-department

# 3. Check health check
docker run --rm es-international-department curl -f http://localhost:8080/api/health

# 4. Verify environment variables
docker run --rm -e DATABASE_URL="test" es-international-department env

# 5. Check port binding
docker run -p 8080:8080 es-international-department

# 6. Debug startup command
docker run --rm es-international-department ls -la /src
```

#### Issue: Health Check Failing
```bash
❌ Error: Health check never succeeded
```

**Solutions:** | **解決方案：**
```bash
# 1. Test health endpoint manually
curl -f http://localhost:8080/api/health

# 2. Check if application is listening on correct port
netstat -tlnp | grep 8080

# 3. Verify health check configuration in Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# 4. Check application startup time
# Increase start-period if app takes longer to start
HEALTHCHECK --start-period=60s ...

# 5. Debug inside container
docker exec -it <container-id> curl -f http://localhost:8080/api/health
```

---

## ☁️ Deployment Issues | 部署問題

### 1. Zeabur Deployment Issues | Zeabur 部署問題

#### Issue: Deployment Failed
```bash
❌ Error: Build failed on Zeabur
```

**Solutions:** | **解決方案：**
```bash
# 1. Check Zeabur build logs
zeabur logs --env production --build

# 2. Verify Dockerfile is in root directory
ls -la Dockerfile

# 3. Test build locally
docker build -t test-build .

# 4. Check environment variables in Zeabur dashboard
# Ensure all required variables are set

# 5. Verify branch is correctly configured
# Check branch mapping in Zeabur settings

# 6. Force redeploy
zeabur redeploy --env production
```

#### Issue: Service Won't Start
```bash
❌ Error: Service failed to start
```

**Solutions:** | **解決方案：**
```bash
# 1. Check Zeabur runtime logs
zeabur logs --env production --runtime

# 2. Verify database connection
# Check DATABASE_URL in Zeabur environment variables

# 3. Check port configuration
# Ensure app listens on port 8080 (Zeabur default)

# 4. Verify health check endpoint
curl https://your-app.zeabur.app/api/health

# 5. Check resource limits
# Increase memory/CPU if needed in Zeabur dashboard

# 6. Review startup command
# Ensure CMD in Dockerfile is correct
```

### 2. Database Deployment Issues | 資料庫部署問題

#### Issue: Database Migration Failed in Production
```bash
❌ Error: Migration failed during deployment
```

**Solutions:** | **解決方案：**
```bash
# 1. Check migration status
# Connect to production database and run:
npx prisma migrate status

# 2. Apply migrations manually
npx prisma migrate deploy

# 3. For Zeabur database issues
# Check database status in Zeabur dashboard
# Verify connection string is correct

# 4. Backup before fixing
# Create database backup before any fixes

# 5. Roll back if necessary
# Restore from backup if migration causes issues

# 6. Contact support
# If persistent issues, contact Zeabur support
```

---

## 🌐 Runtime Issues | 運行時問題

### 1. Application Performance Issues | 應用程式效能問題

#### Issue: Slow Page Load Times
```bash
❌ Symptom: Pages take >5 seconds to load
```

**Diagnosis Steps:** | **診斷步驟：**
```bash
# 1. Check server response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.zeabur.app/api/health

# curl-format.txt content:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                      ----------\n
#           time_total:  %{time_total}\n

# 2. Check database query performance
# Enable Prisma query logging
DATABASE_URL="...?logging=true"

# 3. Monitor resource usage
# Check CPU/Memory in Zeabur dashboard
```

**Solutions:** | **解決方案：**
```typescript
// 1. Add database query optimization
const announcements = await prisma.announcement.findMany({
  select: {
    id: true,
    title: true,
    summary: true,
    publishedAt: true
  }, // Only select needed fields
  where: { status: 'published' },
  take: 10 // Limit results
})

// 2. Add caching headers
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}

// 3. Use React Query for client-side caching
const { data, isLoading } = useQuery(
  ['announcements'],
  fetchAnnouncements,
  { staleTime: 5 * 60 * 1000 } // 5 minutes
)
```

#### Issue: Memory Leaks
```bash
❌ Symptom: Memory usage continuously increases
```

**Solutions:** | **解決方案：**
```typescript
// 1. Fix database connection leaks
// Always use the global Prisma instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 2. Clean up event listeners
useEffect(() => {
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])

// 3. Cancel ongoing requests
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data))
  
  return () => {
    controller.abort()
  }
}, [])
```

### 2. Authentication Issues | 身份驗證問題

#### Issue: Login Failures
```bash
❌ Error: Invalid credentials
```

**Diagnosis Steps:** | **診斷步驟：**
```bash
# 1. Check user exists in database
# Connect to database and query users table

# 2. Verify password hashing
# Check if bcrypt is working correctly

# 3. Check JWT secret
# Ensure JWT_SECRET is set and consistent

# 4. Check session management
# Verify session tokens are being created/validated
```

**Solutions:** | **解決方案：**
```typescript
// 1. Debug authentication flow
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('Login attempt for:', email) // Debug log
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValid) {
      console.log('Invalid password for:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Generate JWT token...
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 📊 Monitoring and Logging | 監控和日誌

### Setting Up Monitoring | 設定監控

#### Application Monitoring | 應用程式監控
```typescript
// lib/monitoring/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    })
  ]
})

export { logger }
```

#### Error Tracking | 錯誤追蹤
```typescript
// lib/monitoring/error-handler.ts
export function handleError(error: Error, context?: string) {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
  
  // Send to external service (Sentry, etc.)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error)
  }
}
```

### Log Analysis | 日誌分析

#### Common Log Patterns | 常見日誌模式
```bash
# 1. Find error patterns
grep -i "error" logs/combined.log | head -20

# 2. Check database connection issues
grep -i "prisma\|database" logs/combined.log

# 3. Monitor API response times
grep -i "response time" logs/combined.log | awk '{print $NF}' | sort -n

# 4. Check for memory issues
grep -i "memory\|heap" logs/combined.log

# 5. Monitor user authentication
grep -i "login\|auth" logs/combined.log
```

---

## 🆘 Getting Help | 獲得幫助

### Before Asking for Help | 尋求幫助前

1. **Check this troubleshooting guide** | **檢查此故障排除指南**
2. **Search existing issues** | **搜尋現有問題**
3. **Check logs for error messages** | **檢查日誌中的錯誤訊息**
4. **Try to reproduce the issue** | **嘗試重現問題**
5. **Document the steps taken** | **記錄已採取的步驟**

### Information to Include | 包含的資訊

When reporting an issue, please include:
報告問題時，請包含：

```markdown
**Environment | 環境**
- OS: [e.g., macOS 13.0, Ubuntu 20.04]
- Node.js version: [e.g., v18.17.0]
- pnpm version: [e.g., v8.6.0]
- Browser: [e.g., Chrome 115.0]

**Issue Description | 問題描述**
- What were you trying to do?
- What happened instead?
- Error messages (full text)

**Steps to Reproduce | 重現步驟**
1. Step 1
2. Step 2
3. Step 3

**Additional Context | 其他上下文**
- Screenshots if applicable
- Relevant configuration files
- Recent changes made
```

### Support Channels | 支援管道

- **GitHub Issues**: [Project Issues](https://github.com/your-org/es-international-department/issues)
- **Development Team**: [dev-team@example.com](mailto:dev-team@example.com)
- **Documentation**: [Project Wiki](https://github.com/your-org/es-international-department/wiki)
- **Discord/Slack**: [Team Channel](#)

---

## 📚 Additional Resources | 其他資源

### Documentation Links | 文件連結

- [Developer Guide](./dev/README.md)
- [Docker Deployment Guide](./docker-deployment.md)
- [Zeabur Deployment Guide](./zeabur-deployment-guide.md)
- [API Documentation](./api/README.md)

### External Resources | 外部資源

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zeabur Documentation](https://docs.zeabur.com)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

### Tools and Utilities | 工具和實用程式

- [Prisma Studio](https://www.prisma.io/studio) - Database management
- [Postman](https://www.postman.com) - API testing
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Container management
- [pgAdmin](https://www.pgadmin.org) - PostgreSQL administration

---

*This troubleshooting guide is continuously updated based on common issues and their solutions. If you encounter a new issue not covered here, please contribute by documenting the solution.*

*此故障排除指南會根據常見問題及其解決方案持續更新。如果您遇到此處未涵蓋的新問題，請透過記錄解決方案來貢獻。*