public with sharing class JobApplicationController {

    // ── METHOD 1: Save new Job Application ──────────────────────────
    @AuraEnabled
    public static Id saveApplication(
        String companyName,
        String jobTitle,
        String companyDomain,
        String status
    ) {
        try {
            Job_Application__c app = new Job_Application__c(
                Company_Name__c       = companyName,
                Job_Title__c          = jobTitle,
                Company_Domain__c     = companyDomain,
                Application_Status__c = status
            );
            insert app;

            // Trigger async API enrichment after insert
            enrichCompany(app.Id, companyDomain);

            return app.Id;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // ── METHOD 2: Get all Job Applications ──────────────────────────
    @AuraEnabled(cacheable=true)
    public static List<Job_Application__c> getApplications() {
        return [
            SELECT Id,
                   Company_Name__c,
                   Job_Title__c,
                   Company_Domain__c,
                   Application_Status__c,
                   Company_Industry__c,
                   Company_Size__c,
                   Company_Country__c,
                   Founded_Year__c,
                   CreatedDate
            FROM   Job_Application__c
            ORDER BY CreatedDate DESC
            LIMIT  100
        ];
    }

    // ── METHOD 3: Async API enrichment via Abstract API ─────────────
    @future(callout=true)
    public static void enrichCompany(Id recordId, String domain) {
        try {
            // Step 1: Get API key from Custom Metadata
            API_Config__mdt config = [
                SELECT API_Key_c__c
                FROM   API_Config__mdt
                WHERE  DeveloperName = 'AbstractAPI'
                LIMIT  1
            ];
            String apiKey = config.API_Key_c__c;
            System.debug('API Key found: ' + (apiKey != null ? 'YES' : 'NO'));

            // Step 2: Build HTTP request with correct endpoint
            HttpRequest req = new HttpRequest();
            req.setEndpoint(
                'https://companyenrichment.abstractapi.com/v1/' +
                '?api_key=' + apiKey +
                '&domain='  + domain
            );
            req.setMethod('GET');
            req.setTimeout(10000);

            // Step 3: Send the request
            Http         http = new Http();
            HttpResponse res  = http.send(req);

            System.debug('API Status Code: ' + res.getStatusCode());
            System.debug('API Response: '    + res.getBody());

            // Step 4: Process successful response
            if (res.getStatusCode() == 200) {

                // Step 5: Parse JSON response
                Map<String, Object> result =
                    (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

                // Step 6: Extract fields safely
                String  industry    = (String) result.get('industry');
                String  country     = (String) result.get('country');
                Object  empObj      = result.get('employees_count');
                String  empCount    = empObj  != null
                    ? String.valueOf(empObj)  : null;
                Object  yearObj     = result.get('founded_year');
                Integer foundedYear = yearObj != null
                    ? Integer.valueOf(String.valueOf(yearObj)) : null;

                System.debug('Industry: '    + industry);
                System.debug('Country: '     + country);
                System.debug('Size: '        + empCount);
                System.debug('Founded Year: '+ foundedYear);

                // Step 7: Update record with enriched data
                Job_Application__c app = new Job_Application__c(
                    Id                  = recordId,
                    Company_Industry__c = industry,
                    Company_Country__c  = country,
                    Company_Size__c     = empCount,
                    Founded_Year__c     = foundedYear
                );
                update app;

                System.debug('Record updated successfully with enriched data');

            } else {
                System.debug('API returned non-200 status: ' + res.getStatusCode());
                System.debug('Response body: ' + res.getBody());
            }

        } catch (Exception e) {
            System.debug('Enrichment failed: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
        }
    }

}