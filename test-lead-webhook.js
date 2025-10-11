/**
 * Test script for LeadConnector webhook integration
 * This tests both signup and payment lead capture
 */

const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/2xJ6VY43ugovZK68Cz74/webhook-trigger/260c7d50-814b-47de-9245-257723375ee0';

async function testSignupLead() {
  console.log('🧪 Testing signup lead webhook...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        // Lead basic information
        email: 'test.user@example.com',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        
        // Lead source and tracking
        source: 'talween-studio-signup',
        lead_source: 'Website Registration',
        campaign: 'Story Creation Platform',
        
        // Lead details
        lead_type: 'New User Registration',
        status: 'New',
        tags: ['story-creation', 'new-user', 'signup', 'test'],
        
        // User data
        user_id: 'test_user_123',
        initial_credits: 465,
        platform: 'Talween Studio',
        
        // Timestamps
        created_at: new Date().toISOString(),
        timestamp: Date.now(),
        
        // Additional metadata
        metadata: {
          signup_method: 'email',
          platform_version: '1.0',
          registration_source: 'test_script'
        }
      })
    });
    
    console.log('📊 Signup webhook response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Signup lead sent successfully:', result);
    } else {
      const error = await response.text();
      console.log('❌ Signup webhook failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Signup webhook error:', error);
  }
}

async function testPaymentLead() {
  console.log('🧪 Testing payment lead webhook...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        // Lead basic information
        email: 'customer@example.com',
        first_name: 'Customer',
        last_name: 'User',
        full_name: 'Customer User',
        
        // Lead source and tracking
        source: 'talween-studio-payment',
        lead_source: 'Payment Success',
        campaign: 'Credit Purchase',
        
        // Lead details
        lead_type: 'Customer Purchase',
        status: 'Customer',
        tags: ['customer', 'paid', 'credits-purchase', 'high-value', 'test'],
        
        // Purchase data
        user_id: 'customer_456',
        order_id: 'order_test_123',
        purchase_amount: 25.00,
        credits_purchased: 100,
        package_id: 'package_100_credits',
        payment_method: 'MyFatoorah',
        
        // Timestamps
        created_at: new Date().toISOString(),
        timestamp: Date.now(),
        
        // Additional metadata
        metadata: {
          purchase_method: 'online',
          platform_version: '1.0',
          payment_source: 'myfatoorah',
          is_returning_customer: false,
          test_mode: true
        }
      })
    });
    
    console.log('📊 Payment webhook response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Payment lead sent successfully:', result);
    } else {
      const error = await response.text();
      console.log('❌ Payment webhook failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Payment webhook error:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting LeadConnector webhook tests...\n');
  
  await testSignupLead();
  console.log('\n' + '='.repeat(50) + '\n');
  await testPaymentLead();
  
  console.log('\n🏁 Tests completed!');
}

// Run tests
runTests().catch(console.error);
