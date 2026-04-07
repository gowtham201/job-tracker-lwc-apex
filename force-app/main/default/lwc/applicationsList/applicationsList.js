import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getApplications from '@salesforce/apex/JobApplicationController.getApplications';

export default class ApplicationsList extends LightningElement {

    @track filterStatus         = 'All';
    @track filteredApplications = [];
    @track isLoading            = true;
    @track error;

    wiredResult;
    allApplications  = [];
    refreshInterval;

    columns = [
        { label: 'Company',    fieldName: 'Company_Name__c',       type: 'text' },
        { label: 'Job Title',  fieldName: 'Job_Title__c',          type: 'text' },
        { label: 'Status',     fieldName: 'Application_Status__c', type: 'text' },
        { label: 'Industry',   fieldName: 'Company_Industry__c',   type: 'text' },
        { label: 'Country',    fieldName: 'Company_Country__c',    type: 'text' },
        { label: 'Size',       fieldName: 'Company_Size__c',       type: 'text' }
    ];

    filterOptions = [
        { label: 'All',                 value: 'All'                 },
        { label: 'Applied',             value: 'Applied'             },
        { label: 'Interview Scheduled', value: 'Interview Scheduled' },
        { label: 'Offer Received',      value: 'Offer Received'      },
        { label: 'Rejected',            value: 'Rejected'            },
        { label: 'Withdrawn',           value: 'Withdrawn'           }
    ];

    // Auto-fetches data when component loads — and whenever refreshApex is called
    @wire(getApplications)
    wiredApplications(result) {
        this.wiredResult = result;
        this.isLoading   = false;
        if (result.data) {
            this.allApplications      = result.data;
            this.filteredApplications = result.data;
            this.error                = undefined;
        } else if (result.error) {
            this.error                = result.error;
            this.allApplications      = [];
            this.filteredApplications = [];
        }
    }

    // Runs when component first appears on screen
    // Sets up auto-refresh every 5 seconds to pick up API enrichment data
    connectedCallback() {
        this.refreshInterval = setInterval(() => {
            if (this.wiredResult) {
                refreshApex(this.wiredResult).then(() => {
                    this.applyFilter();
                });
            }
        }, 5000);
    }

    // Runs when component is removed from screen — clears the interval
    disconnectedCallback() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    // Filter handler — called when user changes the Status dropdown
    handleFilter(event) {
        this.filterStatus = event.detail.value;
        this.applyFilter();
    }

    // Applies the current filter to the full list
    applyFilter() {
        if (this.filterStatus === 'All') {
            this.filteredApplications = this.allApplications;
        } else {
            this.filteredApplications = this.allApplications.filter(
                app => app.Application_Status__c === this.filterStatus
            );
        }
    }

}