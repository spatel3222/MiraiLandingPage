#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');


// Load environment variables from the MOI dashboard directory
dotenv.config({ path: path.join(__dirname, 'Moi Data/moi-analytics-dashboard/.env.local') });
dotenv.config({ path: path.join(__dirname, 'Moi Data/moi-analytics-dashboard/.env') });

// Also try to load from the package's node_modules
try {
  const supabasePath = path.join(__dirname, 'Moi Data/moi-analytics-dashboard/node_modules/@supabase/supabase-js');
  require.resolve(supabasePath);
} catch (e) {
  console.log('Note: Using global @supabase/supabase-js package');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env files.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDataDays() {
  console.log('🔍 Checking data in Supabase for MOI Dashboard...\n');
  
  try {
    // Check Meta Ads data
    const { data: metaData, error: metaError } = await supabase
      .from('meta_ads_data')
      .select('reporting_ends')
      .order('reporting_ends', { ascending: true });
    
    // Check Google Ads data
    const { data: googleData, error: googleError } = await supabase
      .from('google_ads_data')
      .select('date')
      .order('date', { ascending: true });
    
    // Check Shopify data
    const { data: shopifyData, error: shopifyError } = await supabase
      .from('shopify_data')
      .select('day')
      .order('day', { ascending: true });
    
    console.log('📊 DATA COVERAGE ANALYSIS');
    console.log('═'.repeat(50));
    
    // Meta Ads Analysis
    if (metaError) {
      console.log('❌ Meta Ads: Error fetching data -', metaError.message);
    } else if (!metaData || metaData.length === 0) {
      console.log('⚠️  Meta Ads: No data found');
    } else {
      const metaDates = [...new Set(metaData.map(r => r.reporting_ends))].sort();
      const metaFirstDate = new Date(metaDates[0]);
      const metaLastDate = new Date(metaDates[metaDates.length - 1]);
      const metaDaysDiff = Math.ceil((metaLastDate - metaFirstDate) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('📱 META ADS');
      console.log(`   • Total records: ${metaData.length}`);
      console.log(`   • Unique days: ${metaDates.length}`);
      console.log(`   • Date range: ${metaDates[0]} to ${metaDates[metaDates.length - 1]}`);
      console.log(`   • Days covered: ${metaDaysDiff} days`);
    }
    
    console.log('');
    
    // Google Ads Analysis
    if (googleError) {
      console.log('❌ Google Ads: Error fetching data -', googleError.message);
    } else if (!googleData || googleData.length === 0) {
      console.log('⚠️  Google Ads: No data found');
    } else {
      const googleDates = [...new Set(googleData.map(r => r.date))].sort();
      const googleFirstDate = new Date(googleDates[0]);
      const googleLastDate = new Date(googleDates[googleDates.length - 1]);
      const googleDaysDiff = Math.ceil((googleLastDate - googleFirstDate) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('🔍 GOOGLE ADS');
      console.log(`   • Total records: ${googleData.length}`);
      console.log(`   • Unique days: ${googleDates.length}`);
      console.log(`   • Date range: ${googleDates[0]} to ${googleDates[googleDates.length - 1]}`);
      console.log(`   • Days covered: ${googleDaysDiff} days`);
    }
    
    console.log('');
    
    // Shopify Analysis
    if (shopifyError) {
      console.log('❌ Shopify: Error fetching data -', shopifyError.message);
    } else if (!shopifyData || shopifyData.length === 0) {
      console.log('⚠️  Shopify: No data found');
    } else {
      const shopifyDates = [...new Set(shopifyData.map(r => r.day))].sort();
      const shopifyFirstDate = new Date(shopifyDates[0]);
      const shopifyLastDate = new Date(shopifyDates[shopifyDates.length - 1]);
      const shopifyDaysDiff = Math.ceil((shopifyLastDate - shopifyFirstDate) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('🛍️  SHOPIFY');
      console.log(`   • Total records: ${shopifyData.length}`);
      console.log(`   • Unique days: ${shopifyDates.length}`);
      console.log(`   • Date range: ${shopifyDates[0]} to ${shopifyDates[shopifyDates.length - 1]}`);
      console.log(`   • Days covered: ${shopifyDaysDiff} days`);
    }
    
    // Overall Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📈 OVERALL SUMMARY');
    
    const allDates = new Set();
    
    if (metaData && metaData.length > 0) {
      metaData.forEach(r => allDates.add(r.reporting_ends));
    }
    if (googleData && googleData.length > 0) {
      googleData.forEach(r => allDates.add(r.date));
    }
    if (shopifyData && shopifyData.length > 0) {
      shopifyData.forEach(r => allDates.add(r.day));
    }
    
    if (allDates.size > 0) {
      const sortedDates = Array.from(allDates).sort();
      const overallFirstDate = new Date(sortedDates[0]);
      const overallLastDate = new Date(sortedDates[sortedDates.length - 1]);
      const overallDaysDiff = Math.ceil((overallLastDate - overallFirstDate) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log(`   • Total unique days with data: ${allDates.size}`);
      console.log(`   • Overall date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
      console.log(`   • Total days span: ${overallDaysDiff} days`);
      
      // Check for gaps
      const expectedDays = overallDaysDiff;
      const actualDays = allDates.size;
      if (actualDays < expectedDays) {
        console.log(`   • ⚠️  Data gaps detected: ${expectedDays - actualDays} days missing`);
      } else {
        console.log(`   • ✅ No data gaps - all days have data`);
      }
    } else {
      console.log('   • No data found in any table');
    }
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkDataDays();