#!/usr/bin/env node

/**
 * Test script for Segment webhook
 * Simulates a Segment "Order Completed" event
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/segment-to-refersion';

const testEvent = {
  type: 'track',
  event: 'Order Completed',
  userId: 'test@example.com',
  messageId: 'test-message-' + Date.now(),
  timestamp: new Date().toISOString(),
  properties: {
    orderId: 'TEST-ORDER-' + Date.now(),
    total: 99.99,
    revenue: 99.99,
    currency: 'USD',
    email: 'test@example.com',
    affiliateId: 'TEST-AFFILIATE-123',
    products: [{
      productId: 'PRODUCT-1',
      sku: 'PRODUCT-1',
      name: 'Test Product',
      price: 99.99,
      quantity: 1
    }]
  },
  context: {
    traits: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      refersionId: 'TEST-AFFILIATE-123'
    }
  }
};

async function testWebhook() {
  console.log('🧪 Testing Segment Webhook...');
  console.log('📡 URL:', WEBHOOK_URL);
  console.log('📦 Payload:', JSON.stringify(testEvent, null, 2));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEvent)
    });
    
    const result = await response.text();
    
    console.log('\n📈 Response Status:', response.status);
    console.log('📄 Response Body:', result);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
    
  } catch (error) {
    console.error('💥 Error testing webhook:', error.message);
  }
}

testWebhook();