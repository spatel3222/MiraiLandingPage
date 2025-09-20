#!/usr/bin/env python3

import csv
import json

# Complete list of HR processes from the document (10 categories)
hr_processes = [
    # 1. Attendance & Workforce Management
    {
        "Process Name": "Attendance Tracking Automation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "20",
        "Repetitive Score": "10",
        "Data-Driven Score": "8",
        "Rule-Based Score": "9",
        "High Volume Score": "9",
        "Impact Score": "7",
        "Feasibility Score": "9",
        "Process Notes": "Automate attendance for drivers, conductors, warehouse staff using biometric, GPS, RFID, mobile app"
    },
    {
        "Process Name": "Attendance Anomaly Detection",
        "Department": "HR", 
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "9",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "7",
        "Impact Score": "6",
        "Feasibility Score": "8",
        "Process Notes": "Detect proxy punching, missed logins, duplicate entries"
    },
    {
        "Process Name": "Staff Shortage Prediction",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "7",
        "Data-Driven Score": "9",
        "Rule-Based Score": "7",
        "High Volume Score": "6",
        "Impact Score": "8",
        "Feasibility Score": "7",
        "Process Notes": "Predict staff shortages in advance and suggest replacements"
    },
    
    # 2. Shift & Duty Allocation
    {
        "Process Name": "Optimal Shift Scheduling",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "15",
        "Repetitive Score": "9",
        "Data-Driven Score": "8",
        "Rule-Based Score": "9",
        "High Volume Score": "8",
        "Impact Score": "8",
        "Feasibility Score": "8",
        "Process Notes": "Optimize scheduling for drivers/warehouse staff to reduce overtime and fatigue"
    },
    {
        "Process Name": "Labour Law Compliance Monitoring",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "8",
        "Data-Driven Score": "7",
        "Rule-Based Score": "10",
        "High Volume Score": "7",
        "Impact Score": "9",
        "Feasibility Score": "8",
        "Process Notes": "Ensure compliance with labour laws, working hours, rest requirements for drivers"
    },
    {
        "Process Name": "Dynamic Shift Roster Adjustment",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "8",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "7",
        "Impact Score": "7",
        "Feasibility Score": "7",
        "Process Notes": "Dynamically adjust shift rosters based on cargo arrival/departure forecast"
    },
    
    # 3. Recruitment & Retention
    {
        "Process Name": "Candidate Screening and Shortlisting",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "7",
        "Data-Driven Score": "8",
        "Rule-Based Score": "8",
        "High Volume Score": "6",
        "Impact Score": "6",
        "Feasibility Score": "8",
        "Process Notes": "Shortlist candidates for driver/technical/admin roles based on performance data"
    },
    {
        "Process Name": "Attrition Risk Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "6",
        "Data-Driven Score": "9",
        "Rule-Based Score": "7",
        "High Volume Score": "5",
        "Impact Score": "8",
        "Feasibility Score": "7",
        "Process Notes": "Identify high attrition risk employees with early warning system"
    },
    {
        "Process Name": "Employee Feedback Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "7",
        "Data-Driven Score": "8",
        "Rule-Based Score": "6",
        "High Volume Score": "6",
        "Impact Score": "7",
        "Feasibility Score": "8",
        "Process Notes": "Analyze employee feedback to improve engagement and retention"
    },
    
    # 4. Training & Skill Development
    {
        "Process Name": "Skill Gap Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "6",
        "Data-Driven Score": "8",
        "Rule-Based Score": "7",
        "High Volume Score": "5",
        "Impact Score": "7",
        "Feasibility Score": "7",
        "Process Notes": "Identify skill gaps in workforce and suggest personalized training"
    },
    {
        "Process Name": "Driver Training Tracking",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "8",
        "Data-Driven Score": "8",
        "Rule-Based Score": "9",
        "High Volume Score": "7",
        "Impact Score": "8",
        "Feasibility Score": "8",
        "Process Notes": "Track driver training needs for safety, compliance, fuel-efficient driving"
    },
    {
        "Process Name": "E-Learning Module Delivery",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "7",
        "Data-Driven Score": "6",
        "Rule-Based Score": "8",
        "High Volume Score": "7",
        "Impact Score": "6",
        "Feasibility Score": "9",
        "Process Notes": "Provide e-learning modules in regional languages for warehouse and transport staff"
    },
    
    # 5. Performance Monitoring  
    {
        "Process Name": "Driver Performance Evaluation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "15",
        "Repetitive Score": "8",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "7",
        "Impact Score": "8",
        "Feasibility Score": "8",
        "Process Notes": "Evaluate driver performance on fuel efficiency, on-time deliveries, safety records"
    },
    {
        "Process Name": "Performance Scorecard Generation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "9",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "8",
        "Impact Score": "7",
        "Feasibility Score": "9",
        "Process Notes": "Auto-generate performance scorecards for each employee from operational data"
    },
    {
        "Process Name": "Leadership Potential Identification",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "5",
        "Data-Driven Score": "8",
        "Rule-Based Score": "6",
        "High Volume Score": "4",
        "Impact Score": "7",
        "Feasibility Score": "6",
        "Process Notes": "Use predictive analytics to identify future leaders in the organization"
    },
    
    # 6. Payroll & Compliance
    {
        "Process Name": "Payroll Automation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "25",
        "Repetitive Score": "10",
        "Data-Driven Score": "9",
        "Rule-Based Score": "10",
        "High Volume Score": "9",
        "Impact Score": "9",
        "Feasibility Score": "9",
        "Process Notes": "Automate salary, overtime, and incentive calculations from attendance & performance"
    },
    {
        "Process Name": "Payroll Error Prevention",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "8",
        "Data-Driven Score": "8",
        "Rule-Based Score": "9",
        "High Volume Score": "7",
        "Impact Score": "8",
        "Feasibility Score": "8",
        "Process Notes": "Avoid disputes and errors in payroll processing"
    },
    {
        "Process Name": "Statutory Compliance Management",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "15",
        "Repetitive Score": "9",
        "Data-Driven Score": "7",
        "Rule-Based Score": "10",
        "High Volume Score": "8",
        "Impact Score": "9",
        "Feasibility Score": "8",
        "Process Notes": "Ensure compliance with PF, ESIC, gratuity, bonus rules, and tax laws"
    },
    
    # 7. Safety & Wellbeing
    {
        "Process Name": "Driver Fatigue Monitoring",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "9",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "8",
        "Impact Score": "9",
        "Feasibility Score": "7",
        "Process Notes": "Monitor driver fatigue through telematics, GPS data, rest times"
    },
    {
        "Process Name": "Accident Risk Prediction",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "7",
        "Data-Driven Score": "9",
        "Rule-Based Score": "7",
        "High Volume Score": "6",
        "Impact Score": "9",
        "Feasibility Score": "7",
        "Process Notes": "Predict accident-prone employees and trigger safety training"
    },
    {
        "Process Name": "Health Monitoring Support",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "7",
        "Data-Driven Score": "8",
        "Rule-Based Score": "7",
        "High Volume Score": "6",
        "Impact Score": "7",
        "Feasibility Score": "7",
        "Process Notes": "Support health monitoring through wearables, predictive absenteeism"
    },
    
    # 8. Employee Grievance & Engagement
    {
        "Process Name": "Employee Query Automation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "15",
        "Repetitive Score": "10",
        "Data-Driven Score": "7",
        "Rule-Based Score": "9",
        "High Volume Score": "9",
        "Impact Score": "7",
        "Feasibility Score": "9",
        "Process Notes": "AI chatbots for employee queries on salary slips, leaves, shift info, HR policies"
    },
    {
        "Process Name": "Employee Sentiment Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "7",
        "Data-Driven Score": "9",
        "Rule-Based Score": "6",
        "High Volume Score": "7",
        "Impact Score": "7",
        "Feasibility Score": "8",
        "Process Notes": "Sentiment analysis from employee feedback, WhatsApp/CRM chats"
    },
    {
        "Process Name": "Employee Satisfaction Improvement",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "6",
        "Data-Driven Score": "8",
        "Rule-Based Score": "6",
        "High Volume Score": "6",
        "Impact Score": "8",
        "Feasibility Score": "7",
        "Process Notes": "Systematic approach to improve overall employee satisfaction"
    },
    
    # 9. Integration with Other Systems
    {
        "Process Name": "HR-Operations Data Integration",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "8",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "8",
        "Impact Score": "8",
        "Feasibility Score": "7",
        "Process Notes": "Integrate HR data with Transport Management, Warehouse, and Workshop systems"
    },
    {
        "Process Name": "Management Dashboard Creation",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "9",
        "Data-Driven Score": "9",
        "Rule-Based Score": "7",
        "High Volume Score": "7",
        "Impact Score": "8",
        "Feasibility Score": "8",
        "Process Notes": "Single dashboard with HR + Operations data for top management"
    },
    {
        "Process Name": "Predictive Manpower Planning",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "12",
        "Repetitive Score": "7",
        "Data-Driven Score": "9",
        "Rule-Based Score": "8",
        "High Volume Score": "6",
        "Impact Score": "8",
        "Feasibility Score": "7",
        "Process Notes": "Predictive manpower planning for peak import/export seasons"
    },
    
    # 10. Cost & ROI (Analysis processes)
    {
        "Process Name": "HR Cost-Benefit Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "8",
        "Repetitive Score": "6",
        "Data-Driven Score": "9",
        "Rule-Based Score": "7",
        "High Volume Score": "5",
        "Impact Score": "7",
        "Feasibility Score": "8",
        "Process Notes": "Identify which HR areas give maximum cost savings with AI"
    },
    {
        "Process Name": "Manual Work Reduction Analysis",
        "Department": "HR",
        "Custom Department": "",
        "Time Spent": "10",
        "Repetitive Score": "7",
        "Data-Driven Score": "8",
        "Rule-Based Score": "7",
        "High Volume Score": "6",
        "Impact Score": "7",
        "Feasibility Score": "8",
        "Process Notes": "Analyze and reduce dependency on manual HR work and human errors"
    }
]

# Load existing processes from previous script
with open('/Users/shivangpatel/Documents/GitHub/crtx.in/icd_processes.json', 'r') as f:
    all_processes = json.load(f)

# Remove old HR processes (we'll replace with complete set)
non_hr_processes = [p for p in all_processes if p["Department"] != "HR"]

# Add all new HR processes
complete_processes = non_hr_processes + hr_processes

# Write updated CSV
csv_filename = '/Users/shivangpatel/Documents/GitHub/crtx.in/icd_processes_complete.csv'
fieldnames = [
    "Process Name", "Department", "Custom Department", "Time Spent", 
    "Repetitive Score", "Data-Driven Score", "Rule-Based Score", 
    "High Volume Score", "Impact Score", "Feasibility Score", "Process Notes"
]

with open(csv_filename, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(complete_processes)

print(f"✅ Updated CSV file created: {csv_filename}")
print(f"📊 Total processes: {len(complete_processes)}")
print("\n📋 Department breakdown:")
dept_counts = {}
for p in complete_processes:
    dept = p["Department"]
    dept_counts[dept] = dept_counts.get(dept, 0) + 1

for dept, count in sorted(dept_counts.items()):
    print(f"   - {dept}: {count} processes")

print(f"\n✅ HR Department now has all {len(hr_processes)} processes covering all 10 categories!")

# Also save as JSON
json_filename = '/Users/shivangpatel/Documents/GitHub/crtx.in/icd_processes_complete.json'
with open(json_filename, 'w') as jsonfile:
    json.dump(complete_processes, jsonfile, indent=2)
print(f"✅ JSON file also updated: {json_filename}")