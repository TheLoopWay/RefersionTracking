#!/usr/bin/env node

/**
 * Utility to check HubSpot form structure
 * Usage: node scripts/check-form.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const FORM_ID = '6da40d62-57cc-42dd-9795-172f708858ab';
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN not found in .env file');
  process.exit(1);
}

async function fetchFormStructure() {
  try {
    console.log('🔍 Fetching form structure from HubSpot...\n');
    
    const response = await fetch(
      `https://api.hubapi.com/marketing/v3/forms/${FORM_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const formData = await response.json();
    
    console.log(`📋 Form Name: ${formData.name}`);
    console.log(`🆔 Form ID: ${formData.id}`);
    console.log(`🔘 Submit Button: "${formData.displayOptions?.submitButtonText}"\n`);
    
    console.log('📝 Form Fields:\n');
    
    // Extract all fields from field groups
    formData.fieldGroups.forEach((group, groupIndex) => {
      group.fields.forEach((field) => {
        console.log(`${groupIndex + 1}. ${field.label}`);
        console.log(`   - Field Name: ${field.name}`);
        console.log(`   - Field Type: ${field.fieldType}`);
        console.log(`   - Required: ${field.required}`);
        
        if (field.options && field.options.length > 0) {
          console.log(`   - Options:`);
          field.options.forEach(opt => {
            console.log(`     • ${opt.label} (value: ${opt.value})`);
          });
        }
        
        console.log('');
      });
    });
    
    // Create a mapping file
    const fieldMapping = {};
    formData.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        fieldMapping[field.name] = {
          label: field.label,
          type: field.fieldType,
          required: field.required,
          options: field.options || []
        };
      });
    });
    
    // Save field mapping for reference
    console.log('\n📊 Field Mapping Summary:');
    console.log(JSON.stringify(fieldMapping, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching form:', error.message);
  }
}

// Run the check
fetchFormStructure();