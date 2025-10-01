// Default template structure matching the validated logic file
export const DEFAULT_LOGIC_TEMPLATE: LogicTemplateRow[] = [
  {
    fields: 'Date',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Date',
    formula: 'As is from input file  column name "Date"'
  },
  {
    fields: 'Campaign name',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Text',
    formula: 'PRIMARY GROUP: UTM Campaign (Campaign Name)'
  },
  {
    fields: 'Ad Set Name',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Text',
    formula: 'SECONDARY GROUP: UTM Term (AdSet Name equivalent)'
  },
  {
    fields: 'Ad Set Delivery',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Meta Ads',
    type: 'Text',
    formula: 'As is from input file  column name "Ad Set Delivery"'
  },
  {
    fields: 'Ad Set Level Spent',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv and match it to meta ads  "Amount spent (INR)"'
  },
  {
    fields: 'Ad Set Level Users',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Online store visitors"'
  },
  {
    fields: 'Cost per user',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Ad Set Level Users / Ad Set Level Spent'
  },
  {
    fields: 'Ad Set Level  ATC',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Ad Set Level  Reached Checkout',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that reached checkout"'
  },
  {
    fields: 'Ad Set Level Conversions',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that completed checkout"'
  },
  {
    fields: 'Ad Set Level  Average session duration',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Average session duration"'
  },
  {
    fields: 'Ad Set Level  Users with Session above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Online store visitors" Limit the sum and filter out the users whose session duration is above one minute.',
    notes: 'Count users with session duration > 1 minute'
  },
  {
    fields: 'Ad Set Level Cost per 1 min user',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Ad Set Level  Users with Session above 1 min / Ad Set Level Spent'
  },
  {
    fields: 'Ad Set Level 1min user/ total users (%)',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Percentage of (Ad Set Level  Users with Session above 1 min / Ad Set Level Users)'
  },
  {
    fields: 'Ad Set Level  ATC with session duration above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions with cart additions", Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Ad Set Level Reached Checkout with session duration above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that reached checkout", Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Ad Set Level Users with Above 5 page views and above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Pageviews", Limit the sum and filter out the users whose session duration is above one minute and have page views above 5'
  },
  {
    fields: 'Meta Spend',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'SUM: All numeric field of "Amount spent (INR)"'
  },
  {
    fields: 'Meta CTR',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'AVERAGE: CTR (link click-through rate)'
  },
  {
    fields: 'Meta CPM',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'AVERAGE: CPM (cost per 1,000 impressions)'
  },
  {
    fields: 'Google Spend',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'SUM: All numeric field of "Cost"'
  },
  {
    fields: 'Google CTR',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'AVERAGE: CTR'
  },
  {
    fields: 'Google CPM',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'AVERAGE: Avg. CPM'
  },
  {
    fields: 'Total Users',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Online store visitors"'
  },
  {
    fields: 'Total  ATC',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Total  Reached Checkout',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions that reached checkout"'
  },
  {
    fields: 'Total Abandoned Checkout',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Manual',
    type: 'Number',
    formula: ''
  },
  {
    fields: 'Session Duration',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'AVERAGE: Average session duration'
  },
  {
    fields: 'Users with Session above 1 min',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Online store visitors" Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Users with Above 5 page views and above 1 min',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Online store visitors" Limit the sum and filter out the users whose session duration is above one minute and pageviews is more than 5.'
  },
  {
    fields: 'ATC with session duration above 1 min',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions with cart additions" Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Reached Checkout with session duration above 1 min',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions that reached checkout" Limit the sum and filter out the users whose session duration is above one minute.'
  }
];
