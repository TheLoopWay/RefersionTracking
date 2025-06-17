#!/usr/bin/env node

/**
 * Field mapping from our form to HubSpot's actual field names
 */

const fieldMappings = {
  // Basic fields (already correct)
  'firstname': 'firstname',
  'lastname': 'lastname', 
  'email': 'email',
  'phone': 'phone',
  
  // Checkbox for newsletter
  'newsletter': 'sign_up_for_news_and_updates',
  
  // Date and physical info
  'date_of_birth': 'date_of_birth_1',
  'height': 'person_height',
  'weight': 'person_weight',
  'gender': 'intake_gender',
  
  // Referral
  'referral': 'referred_by',
  'occupation': 'occupation',
  
  // Peptides (checkbox group)
  'peptides_interested': 'peptides_interested_in_exploring',
  
  // Medical history
  'used_peptides_before': 'have_you_ever_used_pepetides_before_',
  'medical_conditions': 'do_you_have_any_pre_existing_medical_conditions_',
  'cancer_history': 'do_you_have_a_history_of_cancer_',
  'family_cancer_history': 'do_you_have_a_family_history_of_cancer_',
  
  // Current health
  'supplements': 'please_list_the_supplements_you_are_currently_taking_',
  'medications': 'please_list_the_medications_you_are_currently_taking_',
  'allergies': 'please_list_any_allergies_or_sensitivities_to_food__supplements__animals_or_chemicals_',
  'hospitalizations': 'have_you_had_any_recent_hospitalizations_',
  
  // Lifestyle
  'sleep_hours': 'how_many_hours_of_sleep_do_you_typically_get_per_night_',
  'alcohol_consumption': 'do_you_consume_alcohol_',
  'tobacco_use': 'do_you_use_tobacco_or_nicotine_products_',
  'activity_level': 'what_is_your_current_activity_level_',
  'stress_level': 'how_would_you_rate_your_current_stress_level_',
  
  // Goals and preferences
  'weight_concerns': 'do_you_have_any_weight_concerns_',
  'diet_plan': 'do_you_follow_a_specific_diet_or_nutrition_plan_',
  'food_preferences': 'do_you_have_any_food_preferences_or_restrictions',
  
  // Consent
  'ai_consent': 'do_you_consent_to_a_peptide_consultant_reviewing_this_information_to_create_a_personalized_wellness',
  'bloodwork_status': 'do_you_have_current_and_up_to_date_bloodwork_',
  
  // Open text
  'health_goals': 'what_are_your_health_and_wellness_goals_',
  'additional_info': 'anything_else_youd_like_to_share',
  
  // Marketing consent (not in HubSpot form, might need to be removed)
  'marketing_consent': 'marketing_consent'
};

// Radio button value mappings
const radioValueMappings = {
  'have_you_ever_used_pepetides_before_': {
    'yes': 'Option 1',
    'no': 'Option 2'
  },
  'how_many_hours_of_sleep_do_you_typically_get_per_night_': {
    'less_than_5': 'Option 1',
    '5_6_hours': 'Option 2',
    '6_7_hours': '6–7 hours',
    '7_8_hours': '7–8 hours',
    'more_than_8': 'More than 8 hours'
  },
  'do_you_consume_alcohol_': {
    'regularly': 'Option 1',
    'occasionally': 'Option 2',
    'rarely': 'Rarely',
    'never': 'Never'
  },
  'do_you_use_tobacco_or_nicotine_products_': {
    'yes': 'Option 1',
    'no': 'Option 2'
  },
  'what_is_your_current_activity_level_': {
    'sedentary': 'Option 1',
    'lightly_active': 'Option 2',
    'moderately_active': 'Moderately active (moderate exercise/sports 3–5 days/week)',
    'very_active': 'Very active (hard exercise/sports 6–7 days/week)',
    'extremely_active': 'Extremely active (daily intense training or physical job)'
  },
  'do_you_consent_to_a_peptide_consultant_reviewing_this_information_to_create_a_personalized_wellness': {
    'yes': 'Option 1'
  },
  'do_you_have_current_and_up_to_date_bloodwork_': {
    'yes': 'Option 1',
    'no': 'Option 2'
  }
};

// Checkbox value mappings for peptides
const peptideValueMappings = {
  'LOOP LEAN (GLP-2)': 'LOOP LEAN – May support weight loss & appetite control',
  'LOOP LEAN/BURN (GLP-3)': 'LOOP LEAN/BURN - May aid in fat loss & metobolism support',
  'Tesamorelin': 'Tesamorelin – May help reduce visceral fat',
  'CJC-1295/Ipamorelin': 'CJC-1295/Ipamorelin – May support fat loss & muscle growth',
  'Sermorelin': 'Sermorelin – May promote natural HGH release',
  'AOD 9604': 'AOD 9604 – May assist with fat breakdown',
  'MOTs-C': 'MOTs-C – May enhance energy & metabolic function',
  'BPC-157': 'BPC-157 – May promote healing & reduce inflammation',
  'BPC-157 Oral': 'BPC-157 Oral – May promote systemic healing & GI support',
  'TB-500': 'TB-500 – May support muscle & tissue repair',
  'KPV': 'KPV – May soothe gut & skin inflammation',
  'Thymosin Alpha 1 / Thymalin': 'Thymosin Alpha 1 / Thymalin – May support immune function',
  'GHK-Cu': 'GHK-Cu – May aid in skin repair & collagen support',
  'Epithalon': 'Epithalon – May promote longevity & sleep quality',
  'NAD+': 'NAD+ – May support energy, cellular repair & cognition',
  'PT-141': 'PT-141 – May enhance libido & sexual function',
  'Semax': 'Semax – May support focus, memory, and stress resilience',
  "I'm not sure yet!": "I'm not sure yet!"
};

console.log('Field Mapping Reference:');
console.log('========================\n');

console.log('Update these field names in the HTML form:');
Object.entries(fieldMappings).forEach(([old, newName]) => {
  if (old !== newName) {
    console.log(`- Change name="${old}" to name="${newName}"`);
  }
});

console.log('\nUpdate these radio button values:');
Object.entries(radioValueMappings).forEach(([fieldName, values]) => {
  console.log(`\nFor field "${fieldName}":`);
  Object.entries(values).forEach(([old, newValue]) => {
    console.log(`  - Change value="${old}" to value="${newValue}"`);
  });
});

console.log('\nUpdate peptide checkbox values to use full descriptions');

console.log('\nNotes:');
console.log('- Gender field values should be "Male" or "Female" (capitalized)');
console.log('- Stress level should be a text field (not range) in HubSpot');
console.log('- Marketing consent field is not in the HubSpot form - consider removing');
console.log('- There\'s a conditional field for peptide experience details');