# KCISLK ESID Info Hub - Terminology Guide

## 📋 Standard Terminology Reference

This document provides the standardized terminology used throughout the KCISLK ESID Info Hub application to ensure consistent user experience and professional presentation.

## 🎯 Core System Modules

| English Term | Usage Context | Example |
|--------------|---------------|---------|
| **Reminders** | Task/deadline management | "View Reminders", "Teacher Reminders" |
| **Messages** | Discussion board/forum | "View Messages", "Teachers Message Board" |
| **Announcements** | Official notices | "Important Announcements", "School Announcements" |
| **Resources** | Learning materials | "Learning Resources", "Educational Resources" |
| **Events** | Activities/calendar items | "School Events", "Upcoming Events" |
| **Notifications** | System alerts | "Notification Center", "Push Notifications" |
| **Calendar** | Date/schedule management | "School Calendar", "Event Calendar" |

## 🏫 User Interface Sections

| Term | Usage | Navigation |
|------|-------|------------|
| **Teachers' Corner** | Main teacher interface | `/teachers` |
| **Parents' Corner** | Parent access area | External Link |
| **Admin Panel** | Administrative controls | `/admin` |
| **Home** | Landing page | `/` |
| **Profile** | User account settings | `/profile` |

## ⚡ Standard Actions

### Primary Actions
- **View** - To see/browse content ("View Reminders", "View Messages")
- **Open** - To launch/access ("Open Calendar", "Open Dashboard")
- **Create** - To make new content
- **Edit** - To modify existing content
- **Manage** - To oversee/administer

### Secondary Actions
- **Browse** - To explore content
- **Search** - To find specific items
- **Filter** - To narrow down results
- **Sort** - To organize content
- **Download** - To save files locally
- **Upload** - To submit files

## 📊 Status & Priority Terms

### Status Indicators
- **Active** - Currently in use
- **Pending** - Awaiting action
- **Completed** - Finished
- **Draft** - Work in progress
- **Published** - Available to users
- **Archived** - Stored for reference

### Priority Levels
- **High Priority** / **Urgent** - Immediate attention required
- **Medium Priority** / **Normal** - Standard importance
- **Low Priority** - Can be deferred

## 👥 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Administrator** | Full system access | All features |
| **Office Member** | Administrative tasks | Most features |
| **Teacher** | Educational content | Teaching tools |
| **Parent** | Student information | Limited access |
| **Viewer** | Read-only access | View only |

## 📅 Time-Related Terms

- **Due Date** - When something must be completed
- **Start Date** - When something begins
- **End Date** - When something concludes
- **Created** - When item was made
- **Last Updated** - Most recent modification
- **Published** - When made available
- **Expires** - When validity ends

## 🚫 Avoided Inconsistencies

### ❌ Don't Use These Variations:
- ~~"Message Board"~~ → Use "Messages"
- ~~"Reminder System"~~ → Use "Reminders"
- ~~"Teacher Dashboard"~~ → Use "Teachers Dashboard"
- ~~"Show/Display"~~ → Use "View"
- ~~"Browse/Check"~~ → Use "View" for content, "Open" for applications

## 🌐 Navigation Consistency

### Breadcrumb Format:
```
Home > Teachers Dashboard > Reminders
Home > Parents' Corner > Resources
Home > Admin Panel > User Management
```

### Button Text Format:
```
{Action} {Module}
Examples:
- "View Reminders" 
- "Open Calendar"
- "Manage Resources"
- "Create Event"
```

## 📱 Mobile/Responsive Terms

- Use shorter versions for mobile:
  - "Dashboard" → "Menu"
  - "Notifications" → "Alerts"
  - "Resources" → "Files"

## 🔄 Implementation Checklist

- [ ] All page titles follow standards
- [ ] Navigation menus use consistent terms
- [ ] Button labels match action patterns
- [ ] Status indicators are standardized
- [ ] User roles are clearly defined
- [ ] Time-related terms are consistent
- [ ] Mobile adaptations considered

## 📝 Usage Examples

### Correct Implementation:
```typescript
// Good - Consistent terminology
const navigationItems = [
  { label: "View Reminders", href: "/teachers/reminders" },
  { label: "Open Calendar", href: "/teachers/calendar" },
  { label: "View Messages", href: "/teachers/messages" }
]

// Page titles
export const metadata = {
  title: "KCISLK ESID - Teachers Dashboard"
}
```

### Avoid These Patterns:
```typescript
// Bad - Inconsistent terminology
const navigationItems = [
  { label: "Check Reminders", href: "/teachers/reminders" },
  { label: "Browse Calendar", href: "/teachers/calendar" },
  { label: "Message Board", href: "/teachers/messages" }
]
```

## 🎯 Future Considerations

- Keep terminology simple and professional
- Consider international audience (clear English)
- Maintain consistency across all platforms
- Regular reviews to ensure standards compliance

---

**Last Updated**: 2025-08-28  
**Version**: 1.0.0  
**Maintainer**: Claude Code | KCISLK ESID Info Hub Development Team