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
        if (this.form.dataset.redirectUrl) {
          setTimeout(() => {
            window.location.href = this.form.dataset.redirectUrl;
          }, 2000);
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
    // Track conversion with Refersion
    if (window.r && typeof window.r === 'function') {
      // Get tracking data to include affiliate ID
      const trackingData = tracker.getFormData();
      if (trackingData.refersionid) {
        // Track the conversion
        window.r('conversion', {
          affiliateId: trackingData.refersionid,
          orderId: 'form-' + Date.now(), // Unique ID for this submission
          amount: 0, // No monetary value for form submission
          currency: 'USD'
        });
        console.log('Refersion conversion tracked for affiliate:', trackingData.refersionid);
      }
    }
  }
}