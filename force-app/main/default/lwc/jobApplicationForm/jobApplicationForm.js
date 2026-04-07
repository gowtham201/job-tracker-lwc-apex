import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveApplication from '@salesforce/apex/JobApplicationController.saveApplication';

export default class JobApplicationForm extends LightningElement {

    @track companyName    = '';
    @track jobTitle       = '';
    @track companyDomain  = '';
    @track status         = 'Applied';
    @track successMessage = '';
    @track isLoading      = false;
    @track isSubmitted    = false;

    statusOptions = [
        { label: 'Applied',             value: 'Applied'             },
        { label: 'Interview Scheduled', value: 'Interview Scheduled' },
        { label: 'Offer Received',      value: 'Offer Received'      },
        { label: 'Rejected',            value: 'Rejected'            },
        { label: 'Withdrawn',           value: 'Withdrawn'           }
    ];

    // Input handlers
    handleCompanyName(event)   { this.companyName   = event.target.value; }
    handleJobTitle(event)      { this.jobTitle       = event.target.value; }
    handleCompanyDomain(event) { this.companyDomain  = event.target.value; }
    handleStatus(event)        { this.status         = event.detail.value; }

    // Dynamic button label — changes while saving
    get buttonLabel() {
        return this.isLoading ? 'Saving...' : 'Submit Application';
    }

    handleSubmit() {

        // Guard 1: prevent double submission
        if (this.isLoading || this.isSubmitted) {
            return;
        }

        // Guard 2: validate Company Name
        if (!this.companyName.trim()) {
            this.showToast('Missing Field', 'Please enter the Company Name.', 'error');
            return;
        }

        // Guard 3: validate Job Title
        if (!this.jobTitle.trim()) {
            this.showToast('Missing Field', 'Please enter the Job Title.', 'error');
            return;
        }

        // Guard 4: validate Company Domain
        if (!this.companyDomain.trim()) {
            this.showToast('Missing Field', 'Please enter the Company Domain (e.g. google.com).', 'error');
            return;
        }

        // Guard 5: basic domain format check
        if (!this.companyDomain.includes('.')) {
            this.showToast('Invalid Domain', 'Company Domain must be in format: google.com', 'error');
            return;
        }

        // All validations passed — set loading state
        this.isLoading   = true;
        this.isSubmitted = false;

        saveApplication({
            companyName:   this.companyName.trim(),
            jobTitle:      this.jobTitle.trim(),
            companyDomain: this.companyDomain.trim().toLowerCase(),
            status:        this.status
        })
        .then(result => {
            this.isLoading      = false;
            this.isSubmitted    = true;
            this.successMessage = 'Application submitted successfully! Record ID: ' + result;

            this.showToast(
                'Application Saved',
                'Company data will appear in the list within 10 seconds.',
                'success'
            );

            this.resetForm();

            // Clear success message after 5 seconds
            setTimeout(() => {
                this.successMessage = '';
                this.isSubmitted    = false;
            }, 5000);
        })
        .catch(error => {
            this.isLoading   = false;
            this.isSubmitted = false;

            let message = 'An unexpected error occurred. Please try again.';
            if (error.body && error.body.message) {
                message = error.body.message;
            } else if (error.message) {
                message = error.message;
            }

            this.showToast('Error Saving Application', message, 'error');
        });
    }

    // Reusable toast helper
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // Reset all fields to defaults
    resetForm() {
        this.companyName   = '';
        this.jobTitle      = '';
        this.companyDomain = '';
        this.status        = 'Applied';
    }

}