/**
 * Role-Based Access Control (RBAC) System
 * KCISLK ESID Info Hub 角色權限控制系統
 */

import { User } from '@/lib/auth'

// 權限動作定義
export enum Permission {
  // 公告權限
  ANNOUNCEMENT_CREATE = 'announcement:create',
  ANNOUNCEMENT_READ = 'announcement:read',
  ANNOUNCEMENT_UPDATE = 'announcement:update',
  ANNOUNCEMENT_DELETE = 'announcement:delete',
  ANNOUNCEMENT_PUBLISH = 'announcement:publish',

  // 活動權限
  EVENT_CREATE = 'event:create',
  EVENT_READ = 'event:read',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_MANAGE = 'event:manage',

  // 資源權限
  RESOURCE_CREATE = 'resource:create',
  RESOURCE_READ = 'resource:read',
  RESOURCE_UPDATE = 'resource:update',
  RESOURCE_DELETE = 'resource:delete',
  RESOURCE_UPLOAD = 'resource:upload',

  // 使用者權限
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // 系統權限
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_MAINTENANCE = 'system:maintenance',

  // 辦公室成員專用權限
  OFFICE_DASHBOARD = 'office:dashboard',
  OFFICE_RESOURCES = 'office:resources',
  OFFICE_COMMUNICATION = 'office:communication',
  OFFICE_ADMIN_ACCESS = 'office:admin_access',

  // 家長權限
  PARENT_DASHBOARD = 'parent:dashboard',
  PARENT_RESOURCES = 'parent:resources',
  PARENT_FEEDBACK = 'parent:feedback'
}

// 角色定義 - 簡化為雙角色系統
export enum Role {
  ADMIN = 'admin',
  OFFICE_MEMBER = 'office_member'
}

// 權限矩陣 - 簡化為雙角色系統
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // 管理員擁有所有權限
    ...Object.values(Permission)
  ],

  [Role.OFFICE_MEMBER]: [
    // 公告權限 (完整管理權限)
    Permission.ANNOUNCEMENT_CREATE,
    Permission.ANNOUNCEMENT_READ,
    Permission.ANNOUNCEMENT_UPDATE,
    Permission.ANNOUNCEMENT_DELETE,
    Permission.ANNOUNCEMENT_PUBLISH,

    // 活動權限 (完整管理權限)
    Permission.EVENT_CREATE,
    Permission.EVENT_READ,
    Permission.EVENT_UPDATE,
    Permission.EVENT_DELETE,
    Permission.EVENT_MANAGE,

    // 資源權限 (完整 CRUD)
    Permission.RESOURCE_CREATE,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_UPDATE,
    Permission.RESOURCE_DELETE,
    Permission.RESOURCE_UPLOAD,

    // 用戶權限 (讀取和基本管理)
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_MANAGE_ROLES,

    // 辦公室成員專用權限
    Permission.OFFICE_DASHBOARD,
    Permission.OFFICE_RESOURCES,
    Permission.OFFICE_COMMUNICATION,
    Permission.OFFICE_ADMIN_ACCESS,

    // 系統權限 (基本權限)
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_LOGS,
    
    // 家長功能權限 (辦公室成員也需要存取家長相關功能)
    Permission.PARENT_DASHBOARD,
    Permission.PARENT_RESOURCES,
    Permission.PARENT_FEEDBACK
  ]
}

// 權限檢查函式
export class RBACService {
  /**
   * 檢查使用者是否有特定權限
   */
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user || !user.roles || user.roles.length === 0) {
      return false
    }

    // 檢查使用者的所有角色
    for (const roleName of user.roles) {
      const role = roleName as Role
      if (ROLE_PERMISSIONS[role]?.includes(permission)) {
        return true
      }
    }

    return false
  }

  /**
   * 檢查使用者是否有任一權限
   */
  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission))
  }

  /**
   * 檢查使用者是否有所有權限
   */
  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission))
  }

  /**
   * 獲取使用者的所有權限
   */
  static getUserPermissions(user: User | null): Permission[] {
    if (!user || !user.roles || user.roles.length === 0) {
      return []
    }

    const permissions: Set<Permission> = new Set()

    for (const roleName of user.roles) {
      const role = roleName as Role
      const rolePermissions = ROLE_PERMISSIONS[role] || []
      rolePermissions.forEach(permission => permissions.add(permission))
    }

    return Array.from(permissions)
  }

  /**
   * 檢查是否為管理員
   */
  static isAdmin(user: User | null): boolean {
    return user?.roles.includes(Role.ADMIN) || false
  }

  /**
   * 檢查是否為辦公室成員
   */
  static isOfficeMember(user: User | null): boolean {
    return user?.roles.includes(Role.OFFICE_MEMBER) || false
  }

  /**
   * 檢查是否為教師 (向後兼容)
   */
  static isTeacher(user: User | null): boolean {
    return user?.roles.includes(Role.OFFICE_MEMBER) || false
  }


  /**
   * 檢查資源存取權限
   */
  static canAccessResource(user: User | null, resourceType: string, action: 'read' | 'create' | 'update' | 'delete'): boolean {
    const permissionMap = {
      announcement: {
        read: Permission.ANNOUNCEMENT_READ,
        create: Permission.ANNOUNCEMENT_CREATE,
        update: Permission.ANNOUNCEMENT_UPDATE,
        delete: Permission.ANNOUNCEMENT_DELETE
      },
      event: {
        read: Permission.EVENT_READ,
        create: Permission.EVENT_CREATE,
        update: Permission.EVENT_UPDATE,
        delete: Permission.EVENT_DELETE
      },
      resource: {
        read: Permission.RESOURCE_READ,
        create: Permission.RESOURCE_CREATE,
        update: Permission.RESOURCE_UPDATE,
        delete: Permission.RESOURCE_DELETE
      },
      user: {
        read: Permission.USER_READ,
        create: Permission.USER_CREATE,
        update: Permission.USER_UPDATE,
        delete: Permission.USER_DELETE
      }
    }

    const resourcePermissions = permissionMap[resourceType as keyof typeof permissionMap]
    if (!resourcePermissions) {
      return false
    }

    const requiredPermission = resourcePermissions[action]
    return this.hasPermission(user, requiredPermission)
  }

  /**
   * 權限中介軟體裝飾器
   */
  static requirePermission(permission: Permission) {
    return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = function(...args: any[]) {
        const user = this.currentUser // 假設有 currentUser 屬性
        
        if (!RBACService.hasPermission(user, permission)) {
          throw new Error(`Access denied: Missing permission ${permission}`)
        }

        return method.apply(this, args)
      }
    }
  }

  /**
   * 角色階層檢查 (管理員 > 辦公室成員)
   */
  static getRoleHierarchy(role: Role): number {
    const hierarchy = {
      [Role.ADMIN]: 2,
      [Role.OFFICE_MEMBER]: 1
    }
    return hierarchy[role] || 0
  }

  /**
   * 檢查是否有更高權限
   */
  static hasHigherRole(user: User | null, compareRole: Role): boolean {
    if (!user || !user.roles || user.roles.length === 0) {
      return false
    }

    const userMaxLevel = Math.max(...user.roles.map(role => this.getRoleHierarchy(role as Role)))
    const compareLevel = this.getRoleHierarchy(compareRole)

    return userMaxLevel > compareLevel
  }

  /**
   * 資料過濾 - 根據使用者權限過濾資料
   */
  static filterDataByPermission<T>(
    user: User | null, 
    data: T[], 
    permission: Permission
  ): T[] {
    if (this.hasPermission(user, permission)) {
      return data
    }
    return []
  }
}

// 便捷函式
export const { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getUserPermissions,
  isAdmin,
  isTeacher,
  isOfficeMember,
  canAccessResource
} = RBACService

// 權限檢查裝飾器
export const requirePermission = RBACService.requirePermission

export default RBACService