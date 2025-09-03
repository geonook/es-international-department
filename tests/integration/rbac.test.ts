/**
 * Role-Based Access Control Integration Tests
 * 角色權限控制整合測試
 */

import { RBACService, Permission } from '@/lib/rbac'
import { mockUsers, TestComponentHelpers } from '../utils/test-helpers'

describe('RBAC Integration', () => {
  describe('Permission Checks', () => {
    test('Admin should have all permissions', () => {
      const adminUser = mockUsers.admin
      
      // Test various permissions
      expect(RBACService.hasPermission(adminUser, Permission.ANNOUNCEMENT_CREATE)).toBe(true)
      expect(RBACService.hasPermission(adminUser, Permission.EVENT_MANAGE)).toBe(true)
      expect(RBACService.hasPermission(adminUser, Permission.USER_DELETE)).toBe(true)
      expect(RBACService.hasPermission(adminUser, Permission.SYSTEM_MAINTENANCE)).toBe(true)
    })
    
    test('Office Member should have appropriate permissions', () => {
      const officeMember = mockUsers.officeMember
      
      // Should have content management permissions
      expect(RBACService.hasPermission(officeMember, Permission.ANNOUNCEMENT_CREATE)).toBe(true)
      expect(RBACService.hasPermission(officeMember, Permission.EVENT_MANAGE)).toBe(true)
      expect(RBACService.hasPermission(officeMember, Permission.RESOURCE_UPLOAD)).toBe(true)
      
      // Should have limited user permissions
      expect(RBACService.hasPermission(officeMember, Permission.USER_READ)).toBe(true)
      expect(RBACService.hasPermission(officeMember, Permission.USER_UPDATE)).toBe(true)
      
      // Should NOT have system admin permissions
      expect(RBACService.hasPermission(officeMember, Permission.USER_DELETE)).toBe(false)
      expect(RBACService.hasPermission(officeMember, Permission.SYSTEM_MAINTENANCE)).toBe(false)
    })
    
    test('Viewer should have minimal permissions', () => {
      const viewer = mockUsers.viewer
      
      // Should NOT have management permissions
      expect(RBACService.hasPermission(viewer, Permission.ANNOUNCEMENT_CREATE)).toBe(false)
      expect(RBACService.hasPermission(viewer, Permission.EVENT_MANAGE)).toBe(false)
      expect(RBACService.hasPermission(viewer, Permission.RESOURCE_UPLOAD)).toBe(false)
      expect(RBACService.hasPermission(viewer, Permission.USER_DELETE)).toBe(false)
      expect(RBACService.hasPermission(viewer, Permission.SYSTEM_MAINTENANCE)).toBe(false)
    })
    
    test('User without roles should have no permissions', () => {
      const noRolesUser = mockUsers.noRoles
      
      expect(RBACService.hasPermission(noRolesUser, Permission.ANNOUNCEMENT_READ)).toBe(false)
      expect(RBACService.hasPermission(noRolesUser, Permission.EVENT_READ)).toBe(false)
      expect(RBACService.hasPermission(noRolesUser, Permission.RESOURCE_READ)).toBe(false)
    })
  })
  
  describe('Resource Access Control', () => {
    test('should correctly check resource access permissions', () => {
      const admin = mockUsers.admin
      const officeMember = mockUsers.officeMember
      const viewer = mockUsers.viewer
      
      // Announcement access
      expect(RBACService.canAccessResource(admin, 'announcement', 'create')).toBe(true)
      expect(RBACService.canAccessResource(officeMember, 'announcement', 'create')).toBe(true)
      expect(RBACService.canAccessResource(viewer, 'announcement', 'create')).toBe(false)
      
      // Event management
      expect(RBACService.canAccessResource(admin, 'event', 'delete')).toBe(true)
      expect(RBACService.canAccessResource(officeMember, 'event', 'delete')).toBe(true)
      expect(RBACService.canAccessResource(viewer, 'event', 'delete')).toBe(false)
      
      // User management
      expect(RBACService.canAccessResource(admin, 'user', 'delete')).toBe(true)
      expect(RBACService.canAccessResource(officeMember, 'user', 'delete')).toBe(false)
      expect(RBACService.canAccessResource(viewer, 'user', 'delete')).toBe(false)
    })
  })
  
  describe('Role Hierarchy', () => {
    test('should respect role hierarchy', () => {
      const admin = mockUsers.admin
      const officeMember = mockUsers.officeMember
      
      // Admin should have higher role than office member
      expect(RBACService.hasHigherRole(admin, 'office_member' as any)).toBe(true)
      expect(RBACService.hasHigherRole(officeMember, 'admin' as any)).toBe(false)
    })
    
    test('should get correct role hierarchy levels', () => {
      expect(RBACService.getRoleHierarchy('admin' as any)).toBe(2)
      expect(RBACService.getRoleHierarchy('office_member' as any)).toBe(1)
    })
  })
  
  describe('Permission Collections', () => {
    test('should get all permissions for user', () => {
      const adminPermissions = RBACService.getUserPermissions(mockUsers.admin)
      const officeMemberPermissions = RBACService.getUserPermissions(mockUsers.officeMember)
      const viewerPermissions = RBACService.getUserPermissions(mockUsers.viewer)
      
      // Admin should have the most permissions
      expect(adminPermissions.length).toBeGreaterThan(officeMemberPermissions.length)
      expect(officeMemberPermissions.length).toBeGreaterThan(viewerPermissions.length)
      
      // Check specific permissions
      expect(adminPermissions).toContain(Permission.SYSTEM_MAINTENANCE)
      expect(officeMemberPermissions).toContain(Permission.ANNOUNCEMENT_CREATE)
      expect(officeMemberPermissions).not.toContain(Permission.SYSTEM_MAINTENANCE)
    })
    
    test('should check multiple permissions', () => {
      const admin = mockUsers.admin
      const viewer = mockUsers.viewer
      
      const contentPermissions = [
        Permission.ANNOUNCEMENT_CREATE,
        Permission.EVENT_CREATE,
        Permission.RESOURCE_CREATE
      ]
      
      // Admin should have all content permissions
      expect(RBACService.hasAllPermissions(admin, contentPermissions)).toBe(true)
      expect(RBACService.hasAnyPermission(admin, contentPermissions)).toBe(true)
      
      // Viewer should have none of these permissions
      expect(RBACService.hasAllPermissions(viewer, contentPermissions)).toBe(false)
      expect(RBACService.hasAnyPermission(viewer, contentPermissions)).toBe(false)
    })
  })
  
  describe('Data Filtering', () => {
    test('should filter data based on permissions', () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
      
      // Admin with permission should see all data
      const adminFiltered = RBACService.filterDataByPermission(
        mockUsers.admin,
        testData,
        Permission.ANNOUNCEMENT_READ
      )
      expect(adminFiltered).toEqual(testData)
      
      // User without permission should see no data
      const filteredData = RBACService.filterDataByPermission(
        mockUsers.viewer,
        testData,
        Permission.ANNOUNCEMENT_CREATE
      )
      expect(filteredData).toEqual([])
    })
  })
  
  describe('Component Integration', () => {
    test('should integrate with useAuth hook mock', () => {
      const authHook = TestComponentHelpers.mockUseAuth(mockUsers.admin)
      
      expect(authHook.isAdmin()).toBe(true)
      expect(authHook.isOfficeMember()).toBe(false) // Admin is not office member
      expect(authHook.hasRole('admin')).toBe(true)
      expect(authHook.hasRole('office_member')).toBe(false)
    })
    
    test('should handle component props with different roles', () => {
      const adminProps = TestComponentHelpers.createMockPropsWithAuth(
        mockUsers.admin,
        { additionalData: 'test' }
      )
      
      expect(adminProps.user).toBe(mockUsers.admin)
      expect(adminProps.isAuthenticated).toBe(true)
      expect(adminProps.additionalData).toBe('test')
    })
  })
})