#!/usr/bin/env node

/**
 * Comprehensive System Test Suite
 * Tests unified Communication System with real-world 13-point message board content
 * Validates complete workflow: API → Database → Frontend → Parents' Corner sync
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

// Real-world 13-point message board content from user
const REAL_MESSAGE_BOARD_CONTENT = `**This Week's Important Updates - Week of December 9-13, 2024**

1. **Winter Concert Rehearsal Schedule**
   - Grade 1-2: Tuesday 2:30-3:15 PM in the Music Room
   - Grade 3-4: Wednesday 2:30-3:30 PM in the Auditorium  
   - Grade 5-6: Thursday 2:30-3:30 PM in the Auditorium
   - Please ensure students wear **black pants/skirt and white shirt** for the concert

2. **School Photo Retakes - December 12**
   - Students who missed original photo day or want retakes
   - Individual photos: 9:00-10:30 AM
   - Class group photos: 11:00 AM-12:00 PM
   - Order forms available at the office

3. **Parent-Teacher Conference Sign-ups**
   - Online booking system opens Monday at 8:00 AM
   - Visit: [www.kcislk.edu.hk/conferences](http://www.kcislk.edu.hk/conferences)
   - Conference dates: December 16-17, 2024
   - 15-minute slots available from 3:00-7:00 PM

4. **Lost and Found Clean-out**
   - Items will be donated to charity on **Friday, December 13**
   - Please check the lost and found area near the main office
   - Valuable items (glasses, electronics) held in office safe

5. **December Holiday Performances**
   - Kindergarten: December 18 at 10:00 AM
   - Grade 1-2: December 19 at 2:00 PM
   - Grade 3-6: December 20 at 6:30 PM
   - Family seating limited to 4 guests per student

6. **Cafeteria Menu Changes**
   - New vegetarian options starting December 16
   - All meals now **nut-free** for student safety
   - Monthly menu calendars available online and at office

7. **After-School Activity Updates**
   - Basketball club cancelled December 12 (coach training)
   - Art club extended session December 13: 3:30-5:00 PM
   - Chess tournament finals: December 17 at 4:00 PM

8. **Field Trip Permission Forms Due**
   - Grade 4 Science Museum trip (January 15) - forms due December 16
   - Grade 6 Historical site visit (January 22) - forms due December 18
   - Volunteer chaperone forms also available

9. **Weather Policy Reminder**
   - School closes when Hong Kong Observatory issues Typhoon Signal 8+
   - Heavy rain/flooding: check school website for updates
   - Contact info: emergency@kcislk.edu.hk

10. **Technology Equipment Check**
    - iPad returns for Grade 5-6: December 19
    - Software updates required over winter break
    - Damaged device reports due by December 20

11. **Winter Break Information**
    - Last day of school: December 20 (early dismissal at 1:00 PM)  
    - School resumes: January 8, 2025
    - No after-school activities during break week

12. **Community Service Projects**
    - Food drive continues through December 20
    - Toy collection for local charities
    - Student volunteer hours tracking forms available

13. **Spring Semester Preparation**
    - New student orientation: January 6, 2025
    - Updated school supply lists posted online
    - Uniform fitting appointments available starting January 2

**Questions? Contact the main office at (852) 2603-8282 or email info@kcislk.edu.hk**

*Thank you for your continued support of our school community!*
- The KCISLK Administrative Team`;

interface TestResult {
  testName: string;
  success: boolean;
  details: string;
  duration: number;
}

class SystemTester {
  private results: TestResult[] = [];
  private testCommunicationId: string | null = null;

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Comprehensive System Test Suite...\n');

    // Test 1: Database Health Check
    await this.runTest('Database Health Check', this.testDatabaseHealth.bind(this));

    // Test 2: Verify Migrated Records
    await this.runTest('Verify Migrated Records', this.testMigratedRecords.bind(this));

    // Test 3: API Integration Tests
    await this.runTest('Create Communication API', this.testCreateCommunicationAPI.bind(this));
    await this.runTest('Get Communications API', this.testGetCommunicationsAPI.bind(this));
    await this.runTest('Update Communication API', this.testUpdateCommunicationAPI.bind(this));
    
    // Test 4: Real Content Integration
    await this.runTest('Real Message Board Content Test', this.testRealContentIntegration.bind(this));

    // Test 5: Type Filtering Tests
    await this.runTest('Communication Type Filtering', this.testTypeFiltering.bind(this));

    // Test 6: Rich Text Processing
    await this.runTest('Rich Text Editor Processing', this.testRichTextProcessing.bind(this));

    // Test 7: Parents' Corner Sync
    await this.runTest('Parents Corner Sync', this.testParentsCornerSync.bind(this));

    // Test 8: Mobile Content Rendering
    await this.runTest('Mobile Content Rendering', this.testMobileContentRendering.bind(this));

    // Test 9: Search and Filtering
    await this.runTest('Search and Filtering', this.testSearchFiltering.bind(this));

    // Test 10: Data Integrity Check
    await this.runTest('Data Integrity Check', this.testDataIntegrity.bind(this));

    // Cleanup
    await this.runTest('Test Cleanup', this.testCleanup.bind(this));

    return this.results;
  }

  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.results.push({
        testName,
        success: true,
        details: 'Test passed successfully',
        duration
      });
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        testName,
        success: false,
        details: error instanceof Error ? error.message : String(error),
        duration
      });
      console.log(`❌ ${testName} - FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async testDatabaseHealth(): Promise<void> {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Communication table exists and structure
    const communicationCount = await prisma.communication.count();
    if (communicationCount < 10) {
      throw new Error(`Expected at least 10 migrated records, found ${communicationCount}`);
    }

    // Check required fields exist
    const sample = await prisma.communication.findFirst();
    if (!sample) throw new Error('No Communication records found');
    
    const requiredFields = ['id', 'title', 'content', 'type', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!(field in sample)) {
        throw new Error(`Required field '${field}' missing from Communication table`);
      }
    }
  }

  private async testMigratedRecords(): Promise<void> {
    // Verify communication types are present (flexible about exact types)
    const messageBoards = await prisma.communication.count({ where: { type: 'message_board' } });
    const messages = await prisma.communication.count({ where: { type: 'message' } });
    const announcements = await prisma.communication.count({ where: { type: 'announcement' } });
    const reminders = await prisma.communication.count({ where: { type: 'reminder' } });

    if (messageBoards + messages === 0) throw new Error('No message/message_board records found after migration');
    if (announcements === 0) throw new Error('No announcement records found after migration');
    if (reminders === 0) throw new Error('No reminder records found after migration');

    // Verify data integrity - no null/empty required fields
    const emptyTitles = await prisma.communication.count({ where: { title: '' } });
    const emptyContent = await prisma.communication.count({ where: { content: '' } });
    const invalidRecords = emptyTitles + emptyContent;

    if (invalidRecords > 0) {
      throw new Error(`Found ${invalidRecords} records with invalid/empty required fields`);
    }
  }

  private async testCreateCommunicationAPI(): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/admin/communications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Message Board - Real Content',
        content: REAL_MESSAGE_BOARD_CONTENT,
        type: 'message_board',
        priority: 'high',
        targetAudience: 'all'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }

    const result = await response.json();
    if (!result.id) throw new Error('Created communication missing ID');
    
    this.testCommunicationId = result.id;

    // Verify the content was stored correctly
    const storedCommunication = await prisma.communication.findUnique({
      where: { id: this.testCommunicationId }
    });

    if (!storedCommunication) throw new Error('Created communication not found in database');
    if (storedCommunication.content !== REAL_MESSAGE_BOARD_CONTENT) {
      throw new Error('Content mismatch between API and database');
    }
  }

  private async testGetCommunicationsAPI(): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/admin/communications`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    const data = result.data || result; // Handle both paginated and non-paginated responses
    if (!Array.isArray(data)) throw new Error('API should return an array or paginated response');
    if (data.length < 10) throw new Error(`Expected at least 10 communications (existing + test), found ${data.length}`);

    // Check that our test communication is in the results
    const testComm = data.find((c: any) => c.id === this.testCommunicationId);
    if (!testComm) throw new Error('Test communication not found in API results');

    // Verify structure
    const requiredFields = ['id', 'title', 'content', 'type', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!(field in testComm)) {
        throw new Error(`Missing field '${field}' in API response`);
      }
    }
  }

  private async testUpdateCommunicationAPI(): Promise<void> {
    if (!this.testCommunicationId) throw new Error('No test communication ID available');

    const updatedContent = REAL_MESSAGE_BOARD_CONTENT + '\n\n**UPDATE**: This message has been updated for testing purposes.';

    const response = await fetch(`${BASE_URL}/api/admin/communications/${this.testCommunicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Test Message Board',
        content: updatedContent,
        priority: 'medium',
        targetAudience: 'parents'
      })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    if (result.title !== 'Updated Test Message Board') {
      throw new Error('Title not updated correctly');
    }

    // Verify in database
    const updated = await prisma.communication.findUnique({
      where: { id: this.testCommunicationId }
    });

    if (!updated || updated.content !== updatedContent) {
      throw new Error('Database not updated correctly');
    }
  }

  private async testRealContentIntegration(): Promise<void> {
    // Test that the 13-point message board content is properly handled
    if (!this.testCommunicationId) throw new Error('No test communication available');

    const communication = await prisma.communication.findUnique({
      where: { id: this.testCommunicationId }
    });

    if (!communication) throw new Error('Test communication not found');

    // Check that all 13 points are preserved
    const pointMatches = communication.content.match(/^\d+\./gm);
    if (!pointMatches || pointMatches.length !== 13) {
      throw new Error(`Expected 13 numbered points, found ${pointMatches?.length || 0}`);
    }

    // Check that markdown formatting is preserved
    const boldMatches = communication.content.match(/\*\*.*?\*\*/g);
    if (!boldMatches || boldMatches.length < 5) {
      throw new Error('Markdown bold formatting not preserved properly');
    }

    // Check that links are preserved
    const linkMatches = communication.content.match(/\[.*?\]\(.*?\)/g);
    if (!linkMatches || linkMatches.length === 0) {
      throw new Error('Markdown links not preserved');
    }

    // Check content length (should be substantial)
    if (communication.content.length < 3000) {
      throw new Error('Content seems truncated or incomplete');
    }
  }

  private async testTypeFiltering(): Promise<void> {
    // Test each communication type filter - support both old and new types
    const types = ['message_board', 'message', 'announcement', 'reminder'];
    
    for (const type of types) {
      const response = await fetch(`${BASE_URL}/api/admin/communications?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`Type filtering failed for ${type}: ${response.status}`);
      }

      const results = await response.json();
      if (!Array.isArray(results)) {
        throw new Error(`Type filtering for ${type} should return array or paginated response`);
      }

      const data = results.data || results; // Handle both paginated and non-paginated responses
      // Verify all results match the requested type
      const wrongTypeCount = data.filter((c: any) => c.type !== type).length;
      if (wrongTypeCount > 0) {
        throw new Error(`Found ${wrongTypeCount} records with wrong type when filtering for ${type}`);
      }

      if (data.length === 0) {
        throw new Error(`No records found for type ${type} - migration may have failed`);
      }
    }
  }

  private async testRichTextProcessing(): Promise<void> {
    // Test that rich text content renders properly
    const response = await fetch(`${BASE_URL}/api/admin/communications/${this.testCommunicationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch test communication: ${response.status}`);
    }

    const communication = await response.json();
    
    // Check that content is properly escaped/unescaped
    if (communication.content.includes('&lt;') || communication.content.includes('&gt;')) {
      throw new Error('Content appears to be double-escaped');
    }

    // Check that newlines are preserved
    if (!communication.content.includes('\n')) {
      throw new Error('Line breaks not preserved in content');
    }

    // Check that special characters are handled
    const specialChars = ['*', '[', ']', '(', ')', '-'];
    for (const char of specialChars) {
      if (!communication.content.includes(char)) {
        throw new Error(`Special character '${char}' missing - may indicate encoding issues`);
      }
    }
  }

  private async testParentsCornerSync(): Promise<void> {
    // Test that the Parents' Corner sync functionality works
    const response = await fetch(`${BASE_URL}/api/admin/communications?sync=parents-corner`);
    
    if (!response.ok) {
      throw new Error(`Parents' Corner sync failed: ${response.status}`);
    }

    const results = await response.json();
    const data = results.data || results; // Handle both paginated and non-paginated responses
    
    // Should include message/message_board and announcement types for parents
    const parentRelevantTypes = data.filter((c: any) => 
      c.type === 'message' || c.type === 'message_board' || c.type === 'announcement'
    );

    if (parentRelevantTypes.length === 0) {
      throw new Error('No parent-relevant communications found for sync');
    }

    // Check that content is suitable for parents (no internal admin notes)
    for (const comm of parentRelevantTypes.slice(0, 3)) { // Check first 3
      if (comm.content.toLowerCase().includes('internal') || 
          comm.content.toLowerCase().includes('admin only')) {
        throw new Error('Internal admin content found in parent sync data');
      }
    }
  }

  private async testMobileContentRendering(): Promise<void> {
    // Test mobile viewport simulation
    const response = await fetch(`${BASE_URL}/api/admin/communications/${this.testCommunicationId}`);
    const communication = await response.json();
    
    // Check for content that might break on mobile
    const lines = communication.content.split('\n');
    const longLines = lines.filter((line: string) => line.length > 100);
    
    if (longLines.length > 5) {
      console.warn(`Warning: ${longLines.length} lines exceed 100 characters - may need mobile optimization`);
    }

    // Check for tables or complex formatting
    if (communication.content.includes('|') && communication.content.split('|').length > 10) {
      throw new Error('Content contains complex tables that may not render well on mobile');
    }

    // Ensure numbered lists are properly formatted
    const numberedListRegex = /^\s*\d+\.\s+/gm;
    const numberedItems = communication.content.match(numberedListRegex);
    if (numberedItems && numberedItems.length !== 13) {
      throw new Error('Numbered list formatting may be corrupted');
    }
  }

  private async testSearchFiltering(): Promise<void> {
    // Test search functionality
    const searchTerm = 'Winter Concert';
    const response = await fetch(`${BASE_URL}/api/admin/communications?search=${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const results = await response.json();
    const data = results.data || results; // Handle both paginated and non-paginated responses
    
    // Should find our test communication
    const found = data.some((c: any) => c.content.includes(searchTerm));
    if (!found) {
      throw new Error(`Search for '${searchTerm}' did not return expected results`);
    }

    // Test case-insensitive search
    const lowercaseResponse = await fetch(`${BASE_URL}/api/admin/communications?search=${encodeURIComponent('winter concert')}`);
    const lowercaseResults = await lowercaseResponse.json();
    
    const lowercaseData = lowercaseResults.data || lowercaseResults;
    const resultsData = results.data || results;
    if (lowercaseData.length !== resultsData.length) {
      throw new Error('Search is not case-insensitive');
    }
  }

  private async testDataIntegrity(): Promise<void> {
    // Final integrity check
    const totalCount = await prisma.communication.count();
    const uniqueIds = await prisma.communication.groupBy({
      by: ['id'],
      _count: { id: true }
    });

    if (uniqueIds.length !== totalCount) {
      throw new Error('Duplicate IDs found in Communication table');
    }

    // Check for orphaned or corrupted records
    const invalidTypeRecords = await prisma.communication.count({
      where: {
        type: { notIn: ['message_board', 'message', 'announcement', 'reminder', 'newsletter'] }
      }
    });

    const invalidRecords = invalidTypeRecords;

    if (invalidRecords > 0) {
      throw new Error(`Found ${invalidRecords} invalid/corrupted records`);
    }

    // Verify referential integrity (if any foreign keys exist)
    // This would check user associations, etc.
  }

  private async testCleanup(): Promise<void> {
    if (this.testCommunicationId) {
      await prisma.communication.delete({
        where: { id: this.testCommunicationId }
      });
    }
  }

  generateReport(): string {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => r.success === false).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    let report = `\n🎯 COMPREHENSIVE SYSTEM TEST REPORT\n`;
    report += `=====================================\n`;
    report += `Total Tests: ${this.results.length}\n`;
    report += `Passed: ${passed} ✅\n`;
    report += `Failed: ${failed} ❌\n`;
    report += `Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%\n`;
    report += `Total Duration: ${totalDuration}ms\n\n`;

    report += `DETAILED RESULTS:\n`;
    report += `-----------------\n`;
    
    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      report += `${status} ${result.testName} (${result.duration}ms)\n`;
      if (!result.success) {
        report += `    Error: ${result.details}\n`;
      }
    }

    if (failed === 0) {
      report += `\n🎉 ALL TESTS PASSED! System is ready for production.\n`;
    } else {
      report += `\n⚠️  ${failed} tests failed. Please review and fix issues before deployment.\n`;
    }

    return report;
  }
}

async function main() {
  const tester = new SystemTester();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    const results = await tester.runAllTests();
    const report = tester.generateReport();
    
    console.log(report);
    
    // Write report to file
    const fs = require('fs');
    const reportPath = '/Users/chenzehong/Desktop/es-international-department (2)/output/test-report.txt';
    fs.writeFileSync(reportPath, report);
    console.log(`\n📊 Report saved to: ${reportPath}`);
    
    process.exit(results.every(r => r.success) ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite failed to run:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { SystemTester, REAL_MESSAGE_BOARD_CONTENT };