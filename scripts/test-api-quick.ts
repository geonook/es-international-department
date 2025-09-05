#!/usr/bin/env node

/**
 * Quick API Test
 * Tests the basic functionality of the unified Communications API
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function quickTest() {
  console.log('🚀 Quick API Test Starting...\n');
  
  try {
    // Test 1: Create communication
    console.log('1. Testing CREATE communication...');
    const createResponse = await fetch(`${BASE_URL}/api/admin/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quick Test Message',
        content: 'This is a quick test of the API functionality.',
        type: 'message_board',
        priority: 'medium',
        targetAudience: 'all'
      })
    });
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ CREATE success - ID:', created.id);
      
      // Test 2: Get all communications
      console.log('\n2. Testing GET all communications...');
      const getResponse = await fetch(`${BASE_URL}/api/admin/communications`);
      if (getResponse.ok) {
        const result = await getResponse.json();
        const data = result.data || result;
        console.log(`✅ GET success - Found ${data.length} communications`);
        
        // Test 3: Get single communication
        console.log('\n3. Testing GET single communication...');
        const singleResponse = await fetch(`${BASE_URL}/api/admin/communications/${created.id}`);
        if (singleResponse.ok) {
          const single = await singleResponse.json();
          console.log('✅ GET single success - Title:', single.title);
          
          // Test 4: Update communication
          console.log('\n4. Testing UPDATE communication...');
          const updateResponse = await fetch(`${BASE_URL}/api/admin/communications/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Updated Test Message',
              priority: 'high'
            })
          });
          
          if (updateResponse.ok) {
            const updated = await updateResponse.json();
            console.log('✅ UPDATE success - Title:', updated.title);
            
            // Test 5: Filter by type
            console.log('\n5. Testing FILTER by type...');
            const filterResponse = await fetch(`${BASE_URL}/api/admin/communications?type=message_board`);
            if (filterResponse.ok) {
              const filterResult = await filterResponse.json();
              const filterData = filterResult.data || filterResult;
              console.log(`✅ FILTER success - Found ${filterData.length} message_board communications`);
            } else {
              console.log('❌ FILTER failed:', filterResponse.status);
            }
            
            // Test 6: Delete communication
            console.log('\n6. Testing DELETE communication...');
            const deleteResponse = await fetch(`${BASE_URL}/api/admin/communications/${created.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              console.log('✅ DELETE success');
            } else {
              console.log('❌ DELETE failed:', deleteResponse.status);
            }
            
          } else {
            console.log('❌ UPDATE failed:', updateResponse.status, await updateResponse.text());
          }
        } else {
          console.log('❌ GET single failed:', singleResponse.status, await singleResponse.text());
        }
      } else {
        console.log('❌ GET all failed:', getResponse.status, await getResponse.text());
      }
    } else {
      console.log('❌ CREATE failed:', createResponse.status, await createResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
  
  console.log('\n🏁 Quick test completed!');
}

quickTest();