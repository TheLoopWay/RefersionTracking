/**
 * Form Handler Module
 * Manages form submissions to HubSpot with tracking
 */

import { tracker } from './tracking.js';

export class FormHandler {
  constructor(config) {
    this.portalId = config.portalId;
    this.formId = config.formId;
    this.form = document.getElementById(config.formElementId);
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    this.messageDiv = document.getElementById(config.messageElementId || 'form-message');
    this.redirectUrl = config.redirectUrl;
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    // Initialize tracking
    tracker.init();
    
    // Handle form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Show loading state
    this.setLoading(true);
    
    try {
      const formData = new FormData(this.form);
      const fields = this.prepareFields(formData);
      
      const response = await this.submitToHubSpot(fields);
      
      if (response.ok) {
        this.showSuccess();
        this.form.reset();
        
        // Track conversion with Refersion
        this.trackConversion();
        
        // Optional redirect
        if (this.redirectUrl || this.form.dataset.redirectUrl) {
          const redirectTo = this.redirectUrl || this.form.dataset.redirectUrl;
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 1500);
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError();
    } finally {
      this.setLoading(false);
    }
  }

  prepareFields(formData) {
    const fields = [];
    const fieldMap = {};
    
    // First pass: collect all values, handling checkbox groups
    for (const [name, value] of formData.entries()) {
      if (fieldMap[name]) {
        // Multiple values for same field (checkboxes)
        if (!Array.isArray(fieldMap[name])) {
          fieldMap[name] = [fieldMap[name]];
        }
        fieldMap[name].push(value);
      } else {
        fieldMap[name] = value;
      }
    }
    
    // Second pass: convert to HubSpot format
    Object.entries(fieldMap).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        // Join multiple selections with semicolon for HubSpot
        fields.push({ name, value: value.join('; ') });
      } else {
        fields.push({ name, value: value.toString() });
      }
    });
    
    // Add tracking data
    const trackingData = tracker.getFormData();
    Object.entries(trackingData).forEach(([name, value]) => {
      if (value) {
        fields.push({ name, value: value.toString() });
      }
    });
    
    return fields;
  }

  async submitToHubSpot(fields) {
    const hubspotCookie = this.getCookie('hubspotutk');
    
    return await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${this.portalId}/${this.formId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedAt: Date.now(),
          fields: fields,
          context: {
            hutk: hubspotCookie,
            pageUri: window.location.href,
            pageName: document.title
          }
        })
      }
    );
  }

  getCookie(name) {
    const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  }

  setLoading(loading) {
    if (this.submitButton) {
      this.submitButton.disabled = loading;
      this.submitButton.textContent = loading ? 'Submitting...' : 'Submit';
    }
  }

  showSuccess() {
    if (this.messageDiv) {
      this.messageDiv.className = 'form-message success';
      this.messageDiv.textContent = 'Thank you! Your submission has been received.';
      this.messageDiv.style.display = 'block';
      
      // Scroll to top to show the success message
      this.messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  showError() {
    if (this.messageDiv) {
      this.messageDiv.className = 'form-message error';
      this.messageDiv.textContent = 'Sorry, there was an error. Please try again.';
      this.messageDiv.style.display = 'block';
    }
  }

  trackConversion() {
    // Get tracking data
    const trackingData = tracker.getFormData();
    const formData = new FormData(this.form);
    
    // Prepare form data object
    const formDataObj = {
      email: formData.get('email'),
      first_name: formData.get('first_name') || formData.get('firstname'),
      last_name: formData.get('last_name') || formData.get('lastname'),
      formId: this.formId,
      ...trackingData
    };
    
    // Track with Segment using the helper function from segment-tracking.js
    if (window.trackFormWithSegment) {
      const formName = this.form.dataset.formName || 'form-submission';
      window.trackFormWithSegment(formDataObj, formName);
    } else if (window.trackFormSubmission) {
      // Fallback to TheLoopWay helper function
      trackFormSubmission({
        email: formData.get('email'),
        firstName: formData.get('first_name') || formData.get('firstname'),
        lastName: formData.get('last_name') || formData.get('lastname'),
        formName: this.form.dataset.formName || 'form-submission',
        formId: this.formId
      });
    } else if (window.analytics) {
      // Direct Segment tracking as last resort
      const email = formData.get('email');
      if (email) {
        analytics.identify(email, {
          email: email,
          firstName: formData.get('first_name') || formData.get('firstname'),
          lastName: formData.get('last_name') || formData.get('lastname'),
          refersionId: trackingData.refersionid,
          source: 'forms_theloopway'
        });
        
        analytics.track('Form Submitted', {
          formName: this.form.dataset.formName || 'form-submission',
          formId: this.formId,
          affiliateId: trackingData.refersionid,
          source: 'forms_theloopway'
        });
      }
    }
    
    // Track conversion with Refersion (legacy)
    if (window.r && typeof window.r === 'function') {
      if (trackingData.refersionid) {
        window.r('conversion', {
          affiliateId: trackingData.refersionid,
          orderId: 'form-' + Date.now(),
          amount: 0,
          currency: 'USD'
        });
        console.log('Refersion conversion tracked for affiliate:', trackingData.refersionid);
      }
    }
  }
}