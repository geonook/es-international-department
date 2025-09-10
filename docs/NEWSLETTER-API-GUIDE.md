# Newsletter API Guide
# 電子報 API 使用指南

Enhanced newsletter API system with monthly/yearly browsing capabilities for KCISLK ESID Info Hub.

## API Endpoints

### 1. Newsletter List API
**GET** `/api/public/newsletters`

Retrieve newsletters with optional date filtering.

#### Query Parameters
- `limit`: Number of newsletters to return (default: 10, max: 50)
- `month`: Filter by specific month (format: `YYYY-MM`)
- `year`: Filter by specific year (format: `YYYY`)
- `audience`: Target audience filter (`all`, `teachers`, `parents`)

#### Examples
```bash
# Get latest 10 newsletters
GET /api/public/newsletters

# Get newsletters from January 2025
GET /api/public/newsletters?month=2025-01

# Get newsletters from 2024
GET /api/public/newsletters?year=2024

# Get latest 5 newsletters
GET /api/public/newsletters?limit=5
```

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 23,
      "title": "2025年1月份 國際部月刊",
      "content": "Newsletter content...",
      "type": "newsletter",
      "priority": "medium",
      "isImportant": false,
      "isPinned": false,
      "date": "2025-09-10T05:24:03.374Z",
      "month": "2025-09",
      "year": 2025,
      "author": "KCISLK ESID",
      "targetAudience": "all",
      "onlineReaderUrl": "https://online.pubhtml5.com/vpgbz/xjrq/",
      "pdfUrl": null,
      "issueNumber": "2025-01",
      "hasOnlineReader": true
    }
  ],
  "total": 3,
  "totalInDatabase": 15,
  "queryParams": {
    "month": "2025-01",
    "year": null,
    "limit": 10,
    "audience": "all"
  },
  "hasDateFilter": true,
  "source": "database"
}
```

### 2. Newsletter Archive API
**GET** `/api/public/newsletters/archive`

Get newsletter archive with grouping and navigation data.

#### Query Parameters
- `groupBy`: Grouping method (`month`, `year`, `both`) - default: `month`
- `limit`: Maximum months/years to return - default: 12
- `includeEmpty`: Include empty periods - default: `false`

#### Examples
```bash
# Get monthly archive (last 12 months)
GET /api/public/newsletters/archive?groupBy=month

# Get yearly archive
GET /api/public/newsletters/archive?groupBy=year

# Get both monthly and yearly groupings
GET /api/public/newsletters/archive?groupBy=both

# Get last 6 months only
GET /api/public/newsletters/archive?groupBy=month&limit=6
```

#### Response Format (Monthly)
```json
{
  "success": true,
  "archive": [
    {
      "month": "2025-09",
      "year": 2025,
      "count": 1,
      "newsletters": [
        {
          "id": 23,
          "title": "2025年1月份 國際部月刊",
          "issueNumber": "2025-01",
          "publishedAt": "2025-09-10T05:24:03.374Z",
          "hasOnlineReader": true,
          "onlineReaderUrl": "https://online.pubhtml5.com/vpgbz/xjrq/"
        }
      ],
      "hasOnlineReader": true
    }
  ],
  "totalNewsletters": 15,
  "totalMonths": 12,
  "totalYears": 3,
  "availableYears": [2025, 2024, 2023],
  "availableMonths": ["2025-09", "2025-08", "2025-07"],
  "groupBy": "month"
}
```

## Newsletter Data Structure

### Newsletter Object
```typescript
interface Newsletter {
  id: number
  title: string
  content: string                    // Truncated content or summary
  type: 'newsletter'
  priority: 'low' | 'medium' | 'high'
  isImportant: boolean
  isPinned: boolean
  date: string                       // ISO date string
  month: string                      // Format: YYYY-MM
  year: number
  author: string
  targetAudience: 'all' | 'teachers' | 'parents'
  onlineReaderUrl?: string          // pubhtml5.com or similar
  pdfUrl?: string                   // Direct PDF download
  issueNumber?: string              // Newsletter issue identifier
  hasOnlineReader: boolean          // Whether online reader is available
}
```

### Archive Month Object
```typescript
interface NewsletterMonthlyArchive {
  month: string                     // Format: YYYY-MM
  year: number
  count: number                     // Number of newsletters in this month
  newsletters: Array<{              // Simplified newsletter data
    id: number
    title: string
    issueNumber?: string
    publishedAt: string
    hasOnlineReader: boolean
    onlineReaderUrl?: string
    pdfUrl?: string
  }>
  hasOnlineReader: boolean          // True if any newsletter has online reader
}
```

## Frontend Integration

### React Hook Example
```typescript
import { useState, useEffect } from 'react'

interface UseNewslettersReturn {
  newsletters: Newsletter[]
  loading: boolean
  error?: string
  fetchNewsletters: (filters?: NewsletterFilters) => Promise<void>
}

export function useNewsletters(): UseNewslettersReturn {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const fetchNewsletters = async (filters?: NewsletterFilters) => {
    setLoading(true)
    setError(undefined)
    
    try {
      const params = new URLSearchParams()
      if (filters?.month) params.set('month', filters.month)
      if (filters?.year) params.set('year', filters.year)
      if (filters?.limit) params.set('limit', filters.limit.toString())
      
      const response = await fetch(`/api/public/newsletters?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setNewsletters(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch newsletters')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { newsletters, loading, error, fetchNewsletters }
}
```

### Archive Browser Component
```typescript
interface NewsletterArchiveBrowserProps {
  onMonthSelect: (month: string) => void
  selectedMonth?: string
}

export function NewsletterArchiveBrowser({ onMonthSelect, selectedMonth }: NewsletterArchiveBrowserProps) {
  const [archives, setArchives] = useState<NewsletterMonthlyArchive[]>([])
  
  useEffect(() => {
    fetch('/api/public/newsletters/archive?groupBy=month')
      .then(res => res.json())
      .then(data => setArchives(data.archive))
  }, [])

  return (
    <div className="newsletter-archive">
      {archives.map(archive => (
        <div key={archive.month} className="archive-month">
          <button 
            onClick={() => onMonthSelect(archive.month)}
            className={`month-button ${selectedMonth === archive.month ? 'selected' : ''}`}
          >
            {formatMonth(archive.month)} ({archive.count})
          </button>
          {archive.hasOnlineReader && (
            <span className="online-reader-badge">📖 線上閱讀</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

## Helper Functions

### Month Formatting
```typescript
const NEWSLETTER_MONTH_LABELS: Record<string, string> = {
  '01': '一月', '02': '二月', '03': '三月', '04': '四月',
  '05': '五月', '06': '六月', '07': '七月', '08': '八月',
  '09': '九月', '10': '十月', '11': '十一月', '12': '十二月'
}

export function formatNewsletterMonth(monthString: string): string {
  const [year, month] = monthString.split('-')
  const monthLabel = NEWSLETTER_MONTH_LABELS[month] || month
  return `${year}年${monthLabel}`
}

export function getCurrentMonthString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "data": [],
  "error": "Error message",
  "fallback": {
    // Fallback data when database fails
  }
}
```

## Performance Considerations

1. **Database Indexing**: Ensure `publishedAt` field is indexed for efficient date queries
2. **Caching**: Consider implementing Redis cache for frequently accessed archive data
3. **Pagination**: Use `limit` parameter to control response size
4. **Date Queries**: Month/year filters use optimized date range queries

## Testing

Run the comprehensive test suite:

```bash
npm run test:newsletter-api
```

This tests 11 scenarios including:
- Basic newsletter retrieval
- Month/year filtering
- Archive API functionality
- Edge cases and error handling
- Performance benchmarking

---

*Last updated: 2025-09-10*  
*API Version: 1.6.1*