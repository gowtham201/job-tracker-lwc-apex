# Job Application Tracker — LWC + Apex + REST API

A full-stack Salesforce developer project built on a Developer Edition org.
Users submit job applications via a custom LWC form. On save, an Apex @future
method calls the Abstract API Company Enrichment endpoint and automatically
populates industry, country, company size and founding year — all without
any manual input.

## Tech Stack

- **Frontend:** Lightning Web Components (LWC) — custom form + datatable
- **Backend:** Apex — @AuraEnabled methods, @future callout, SOQL, DML
- **API:** Abstract API Company Enrichment — REST callout, JSON parsing
- **Platform:** Salesforce Developer Edition Org
- **Tools:** VS Code, Salesforce CLI (sf), Git

## Features

- Submit job applications via a custom LWC form
- Real-time company data enrichment via REST API callout
- Applications list with status filter dropdown
- Auto-refresh every 5 seconds to show enriched data
- Full error handling — validation, API failures, Apex exceptions
- Graceful fallback when company domain not found in API

## Project Structure

```
force-app/main/default/
├── classes/
│   └── JobApplicationController.cls   — Apex backend
├── lwc/
│   ├── jobApplicationForm/            — Submit form component
│   └── applicationsList/              — List + filter component
└── objects/
    └── Job_Application__c/            — Custom object + 8 fields
```

## Custom Object Fields

| Field | API Name | Type | Source |
|-------|----------|------|--------|
| Company Name | Company_Name__c | Text | User input |
| Job Title | Job_Title__c | Text | User input |
| Company Domain | Company_Domain__c | Text | User input |
| Application Status | Application_Status__c | Picklist | User input |
| Company Industry | Company_Industry__c | Text | Abstract API |
| Company Country | Company_Country__c | Text | Abstract API |
| Company Size | Company_Size__c | Text | Abstract API |
| Founded Year | Founded_Year__c | Number | Abstract API |

## How It Works

1. User fills the LWC form and clicks Submit
2. jobApplicationForm.js calls saveApplication() Apex method
3. Apex inserts the Job_Application__c record
4. enrichCompany() fires as @future(callout=true) async method
5. Apex calls Abstract API with the company domain
6. JSON response parsed — industry, country, size, year extracted
7. Record updated with enriched data
8. applicationsList auto-refreshes every 5 seconds showing live data

## Setup Instructions

1. Clone this repo
2. Authorize your Salesforce org: sf org login web --set-default
3. Deploy: sf project deploy start --source-dir force-app/main/default
4. Add Remote Site Setting for https://companyenrichment.abstractapi.com
5. Create Custom Metadata record with your Abstract API key
6. Add components to a Lightning App Page via App Builder

## Certifications

- Salesforce AI Associate
- Salesforce Agentblazer Champion 2026
- HubSpot Email Marketing

## Author

**Gowtham Srikar Thiragati**
Hyderabad, India
[LinkedIn](https://linkedin.com/in/gowtham-srikar-1317b6228/)
[Trailhead](https://trailblazer.salesforce.com/trailblazer/gowthamsrikar)