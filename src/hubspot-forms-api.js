/**
 * Industry Best Practice: HubSpot Forms API Integration
 * This replaces embedded forms with direct API submission
 */

(function() {
    'use strict';

    // Configuration
    const HUBSPOT_PORTAL_ID = '242518594';
    const HUBSPOT_FORM_ID = '09ab75f6-bfbc-4d1c-8761-9ff764b650ca';
    
    /**
     * Capture and store affiliate tracking
     */
    function getAffiliateTracking() {
        // Check URL for new tracking
        const urlParams = new URLSearchParams(window.location.search);
        const rfsn = urlParams.get('rfsn');
        
        if (rfsn) {
            const trackingData = {
                rfsn: rfsn,
                timestamp: new Date().toISOString(),
                landingPage: window.location.href
            };
            
            // Store in cookie (more reliable than localStorage for forms)
            document.cookie = `rfsn_tracking=${encodeURIComponent(JSON.stringify(trackingData))}; max-age=${30*24*60*60}; path=/`;
            
            // Track with Refersion
            if (window.r && typeof window.r === 'function') {
                window.r('click', rfsn);
            }
            
            return trackingData;
        }
        
        // Get from cookie
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        
        if (cookies.rfsn_tracking) {
            try {
                return JSON.parse(decodeURIComponent(cookies.rfsn_tracking));
            } catch (e) {
                console.error('Error parsing tracking cookie:', e);
            }
        }
        
        return null;
    }

    /**
     * Submit form directly to HubSpot API
     */
    async function submitToHubSpot(formData) {
        const fields = [];
        const trackingData = getAffiliateTracking();
        
        // Add form fields
        for (const [name, value] of formData.entries()) {
            fields.push({ name, value });
        }
        
        // Add tracking fields if available
        if (trackingData) {
            fields.push(
                { name: 'refersionid', value: trackingData.rfsn },
                { name: 'refersion_timestamp', value: trackingData.timestamp },
                { name: 'refersion_source_url', value: trackingData.landingPage }
            );
        }
        
        // Add UTM parameters if present
        const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        utmParams.forEach(param => {
            const value = new URLSearchParams(window.location.search).get(param);
            if (value) {
                fields.push({ name: param, value });
            }
        });
        
        // Prepare submission
        const submission = {
            submittedAt: Date.now(),
            fields: fields,
            context: {
                pageUri: window.location.href,
                pageName: document.title,
                ipAddress: null, // Let HubSpot determine this
                hutk: getCookie('hubspotutk') || null // HubSpot tracking cookie
            }
        };
        
        // Submit to HubSpot
        const response = await fetch(
            `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission)
            }
        );
        
        if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * Helper to get cookie value
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    /**
     * Replace HubSpot embedded form with custom form
     */
    function createCustomForm() {
        // Find the HubSpot form container
        const formContainer = document.querySelector('.hs-form-frame, #hubspot-form, [data-form-id="' + HUBSPOT_FORM_ID + '"]');
        
        if (!formContainer) {
            console.warn('HubSpot form container not found');
            return;
        }
        
        // Create custom form that matches the LOOP design
        const customForm = document.createElement('form');
        customForm.id = 'custom-hubspot-form';
        customForm.innerHTML = `
            <div class="loop-form-container">
                <!-- LOOP Logo -->
                <div class="loop-logo">
                    <img src="https://242518594.fs1.hubspotusercontent-na2.net/hubfs/242518594/LOOP%20250%20wide-3.png" alt="LOOP" />
                </div>
                
                <!-- Form Header -->
                <div class="form-header">
                    <p class="form-title">Start Here — Your First Magical Step Welcome to The LOOP Way, a modern approach to self-education in peptides and performance wellness.</p>
                    
                    <p class="form-description">Fill out the quick form below and we'll email you the best next steps for learning about research peptides — what they are, how they work, and how they may support your personal goals. Whether you're curious about healing, energy, metabolism, or longevity, this is your entry point into a more informed and empowered wellness journey.</p>
                    
                    <p class="form-cta">Let's get you started.</p>
                </div>
                
                <!-- Form Fields -->
                <div class="form-fields">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstname">First Name<span class="required">*</span></label>
                            <input type="text" id="firstname" name="firstname" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="lastname">Last Name<span class="required">*</span></label>
                            <input type="text" id="lastname" name="lastname" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email<span class="required">*</span></label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="date_of_birth_1">Date of Birth (Must be 21+ to proceed)<span class="required">*</span></label>
                            <input type="text" id="date_of_birth_1" name="date_of_birth_1" placeholder="MM - DD - YYYY" required pattern="[0-9]{2} - [0-9]{2} - [0-9]{4}">
                        </div>
                    </div>
                </div>
                
                <!-- Consent Text -->
                <div class="consent-section">
                    <p class="consent-text">Consent & Liability Waiver By submitting this form, I acknowledge and agree to the following: No Medical Services: Loop Health & Wellness does not diagnose, treat, or prescribe. All services and content are for informational and educational purposes only and do not replace advice from a licensed medical provider. Research Use Only: Peptides referenced are intended for research purposes only. They are not FDA-approved for human use. Personal Responsibility: I assume full responsibility for my health decisions and understand that any suggestions from LOOP are not medical advice. I agree to consult a licensed healthcare provider before starting any wellness or supplement protocol. AI Insights: If I submit lab results, I consent to LOOP using AI to generate educational insights. I understand these are based on publicly available research and are not medical interpretations. Release of Liability: I release Loop Health & Wellness, its team, and affiliates from any claims or liabilities resulting from my participation, use of peptides, or reliance on educational content. By submitting this form, I confirm that I have read and agree to the above terms.</p>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" name="i_agree_" value="true" required>
                        <span>I agree.<span class="required">*</span></span>
                    </label>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" class="submit-button">Submit!</button>
                
                <div class="form-message" style="display: none;"></div>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #custom-hubspot-form {
                max-width: 800px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .loop-form-container {
                background: #ffffff;
                padding: 40px;
                text-align: center;
            }
            
            /* Logo */
            .loop-logo {
                margin-bottom: 30px;
            }
            
            .loop-logo img {
                max-width: 200px;
                height: auto;
            }
            
            /* Form Header Text */
            .form-header {
                margin-bottom: 40px;
            }
            
            .form-title {
                font-size: 18px;
                line-height: 1.6;
                color: #333;
                margin-bottom: 20px;
                font-weight: 400;
            }
            
            .form-description {
                font-size: 16px;
                line-height: 1.6;
                color: #333;
                margin-bottom: 20px;
                font-weight: 400;
            }
            
            .form-cta {
                font-size: 16px;
                color: #333;
                font-weight: 400;
            }
            
            /* Form Fields */
            .form-fields {
                margin-bottom: 30px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            @media (max-width: 600px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
            
            .form-group {
                text-align: left;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 16px;
                color: #333;
                font-weight: 400;
            }
            
            .form-group input[type="text"],
            .form-group input[type="email"] {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 25px;
                font-size: 16px;
                background: #fafafa;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }
            
            .form-group input[type="text"]:focus,
            .form-group input[type="email"]:focus {
                outline: none;
                border-color: #4a90e2;
                background: #fff;
            }
            
            .form-group input::placeholder {
                color: #999;
            }
            
            /* Required asterisk */
            .required {
                color: #ff6b6b;
                margin-left: 2px;
            }
            
            /* Consent Section */
            .consent-section {
                margin-bottom: 30px;
                text-align: left;
            }
            
            .consent-text {
                font-size: 12px;
                line-height: 1.5;
                color: #00bcd4;
                margin-bottom: 15px;
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                text-align: left;
            }
            
            .checkbox-label {
                display: flex;
                align-items: flex-start;
                font-size: 16px;
                color: #333;
                cursor: pointer;
            }
            
            .checkbox-label input[type="checkbox"] {
                margin-right: 8px;
                margin-top: 4px;
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            /* Submit Button */
            .submit-button {
                background-color: #4a90e2;
                color: white;
                padding: 16px 60px;
                border: none;
                border-radius: 30px;
                font-size: 18px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }
            
            .submit-button:hover {
                background-color: #357abd;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
            }
            
            .submit-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            /* Messages */
            .form-message {
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
                font-size: 16px;
            }
            
            .form-message.success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .form-message.error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
        `;
        document.head.appendChild(styles);
        
        // Replace the container content
        formContainer.innerHTML = '';
        formContainer.appendChild(customForm);
        
        // Add date formatting for DOB field
        const dobField = customForm.querySelector('#date_of_birth_1');
        dobField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            let formatted = '';
            
            if (value.length >= 2) {
                formatted = value.substring(0, 2) + ' - ';
                if (value.length >= 4) {
                    formatted += value.substring(2, 4) + ' - ';
                    if (value.length >= 6) {
                        formatted += value.substring(4, 8);
                    } else {
                        formatted += value.substring(4);
                    }
                } else {
                    formatted += value.substring(2);
                }
            } else {
                formatted = value;
            }
            
            e.target.value = formatted;
        });
        
        // Handle form submission
        customForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = customForm.querySelector('.submit-button');
            const messageDiv = customForm.querySelector('.form-message');
            
            // Validate age (21+)
            const dobValue = dobField.value;
            const dobMatch = dobValue.match(/(\d{2}) - (\d{2}) - (\d{4})/);
            if (dobMatch) {
                const month = parseInt(dobMatch[1]);
                const day = parseInt(dobMatch[2]);
                const year = parseInt(dobMatch[3]);
                const dob = new Date(year, month - 1, day);
                const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
                
                if (age < 21) {
                    messageDiv.className = 'form-message error';
                    messageDiv.textContent = 'You must be 21 or older to proceed.';
                    messageDiv.style.display = 'block';
                    return;
                }
            }
            
            // Disable submit button
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            try {
                const formData = new FormData(customForm);
                
                // Convert date format for HubSpot (YYYY-MM-DD)
                if (dobMatch) {
                    const formattedDate = `${dobMatch[3]}-${dobMatch[1]}-${dobMatch[2]}`;
                    formData.set('date_of_birth_1', formattedDate);
                }
                
                await submitToHubSpot(formData);
                
                // Success!
                messageDiv.className = 'form-message success';
                messageDiv.textContent = 'Thank you! Your submission has been received.';
                messageDiv.style.display = 'block';
                
                // Reset form
                customForm.reset();
                
                // Redirect if configured
                if (window.hsFormRedirectUrl) {
                    setTimeout(() => {
                        window.location.href = window.hsFormRedirectUrl;
                    }, 2000);
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Sorry, there was an error submitting the form. Please try again.';
                messageDiv.style.display = 'block';
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Submit!';
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCustomForm);
    } else {
        // DOM already loaded, but wait a bit for HubSpot form to initialize
        setTimeout(createCustomForm, 1000);
    }

    // Capture tracking on page load
    getAffiliateTracking();

})();