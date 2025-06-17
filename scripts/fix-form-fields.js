#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const formPath = path.resolve(__dirname, '../forms/peptide-education-intake.html');

// Read the form file
let formContent = fs.readFileSync(formPath, 'utf8');

// Field name mappings
const fieldReplacements = [
  ['name="newsletter"', 'name="sign_up_for_news_and_updates"'],
  ['id="newsletter"', 'id="sign_up_for_news_and_updates"'],
  ['for="newsletter"', 'for="sign_up_for_news_and_updates"'],
  
  ['name="date_of_birth"', 'name="date_of_birth_1"'],
  ['id="date_of_birth"', 'id="date_of_birth_1"'],
  ['for="date_of_birth"', 'for="date_of_birth_1"'],
  
  ['name="height"', 'name="person_height"'],
  ['id="height"', 'id="person_height"'],
  ['for="height"', 'for="person_height"'],
  
  ['name="weight"', 'name="person_weight"'],
  ['id="weight"', 'id="person_weight"'],
  ['for="weight"', 'for="person_weight"'],
  
  ['name="gender"', 'name="intake_gender"'],
  ['id="gender"', 'id="intake_gender"'],
  ['for="gender"', 'for="intake_gender"'],
  
  ['name="referral"', 'name="referred_by"'],
  ['id="referral"', 'id="referred_by"'],
  ['for="referral"', 'for="referred_by"'],
  
  ['name="peptides_interested"', 'name="peptides_interested_in_exploring"'],
  
  ['name="used_peptides_before"', 'name="have_you_ever_used_pepetides_before_"'],
  ['name="medical_conditions"', 'name="do_you_have_any_pre_existing_medical_conditions_"'],
  ['name="cancer_history"', 'name="do_you_have_a_history_of_cancer_"'],
  ['name="family_cancer_history"', 'name="do_you_have_a_family_history_of_cancer_"'],
  ['name="supplements"', 'name="please_list_the_supplements_you_are_currently_taking_"'],
  ['name="medications"', 'name="please_list_the_medications_you_are_currently_taking_"'],
  ['name="allergies"', 'name="please_list_any_allergies_or_sensitivities_to_food__supplements__animals_or_chemicals_"'],
  ['name="hospitalizations"', 'name="have_you_had_any_recent_hospitalizations_"'],
  ['name="sleep_hours"', 'name="how_many_hours_of_sleep_do_you_typically_get_per_night_"'],
  ['name="alcohol_consumption"', 'name="do_you_consume_alcohol_"'],
  ['name="tobacco_use"', 'name="do_you_use_tobacco_or_nicotine_products_"'],
  ['name="activity_level"', 'name="what_is_your_current_activity_level_"'],
  ['name="stress_level"', 'name="how_would_you_rate_your_current_stress_level_"'],
  ['name="weight_concerns"', 'name="do_you_have_any_weight_concerns_"'],
  ['name="diet_plan"', 'name="do_you_follow_a_specific_diet_or_nutrition_plan_"'],
  ['name="food_preferences"', 'name="do_you_have_any_food_preferences_or_restrictions"'],
  ['name="ai_consent"', 'name="do_you_consent_to_a_peptide_consultant_reviewing_this_information_to_create_a_personalized_wellness"'],
  ['name="bloodwork_status"', 'name="do_you_have_current_and_up_to_date_bloodwork_"'],
  ['name="health_goals"', 'name="what_are_your_health_and_wellness_goals_"'],
  ['name="additional_info"', 'name="anything_else_youd_like_to_share"'],
  
  // Update corresponding IDs
  ['id="medical_conditions"', 'id="do_you_have_any_pre_existing_medical_conditions_"'],
  ['id="cancer_history"', 'id="do_you_have_a_history_of_cancer_"'],
  ['id="family_cancer_history"', 'id="do_you_have_a_family_history_of_cancer_"'],
  ['id="supplements"', 'id="please_list_the_supplements_you_are_currently_taking_"'],
  ['id="medications"', 'id="please_list_the_medications_you_are_currently_taking_"'],
  ['id="allergies"', 'id="please_list_any_allergies_or_sensitivities_to_food__supplements__animals_or_chemicals_"'],
  ['id="hospitalizations"', 'id="have_you_had_any_recent_hospitalizations_"'],
  ['id="sleep_hours"', 'id="how_many_hours_of_sleep_do_you_typically_get_per_night_"'],
  ['id="alcohol_consumption"', 'id="do_you_consume_alcohol_"'],
  ['id="activity_level"', 'id="what_is_your_current_activity_level_"'],
  ['id="stress_level"', 'id="how_would_you_rate_your_current_stress_level_"'],
  ['id="weight_concerns"', 'id="do_you_have_any_weight_concerns_"'],
  ['id="diet_plan"', 'id="do_you_follow_a_specific_diet_or_nutrition_plan_"'],
  ['id="food_preferences"', 'id="do_you_have_any_food_preferences_or_restrictions"'],
  ['id="health_goals"', 'id="what_are_your_health_and_wellness_goals_"'],
  ['id="additional_info"', 'id="anything_else_youd_like_to_share"'],
  
  // Update labels
  ['for="medical_conditions"', 'for="do_you_have_any_pre_existing_medical_conditions_"'],
  ['for="cancer_history"', 'for="do_you_have_a_history_of_cancer_"'],
  ['for="family_cancer_history"', 'for="do_you_have_a_family_history_of_cancer_"'],
  ['for="supplements"', 'for="please_list_the_supplements_you_are_currently_taking_"'],
  ['for="medications"', 'for="please_list_the_medications_you_are_currently_taking_"'],
  ['for="allergies"', 'for="please_list_any_allergies_or_sensitivities_to_food__supplements__animals_or_chemicals_"'],
  ['for="hospitalizations"', 'for="have_you_had_any_recent_hospitalizations_"'],
  ['for="sleep_hours"', 'for="how_many_hours_of_sleep_do_you_typically_get_per_night_"'],
  ['for="alcohol_consumption"', 'for="do_you_consume_alcohol_"'],
  ['for="activity_level"', 'for="what_is_your_current_activity_level_"'],
  ['for="stress_level"', 'for="how_would_you_rate_your_current_stress_level_"'],
  ['for="weight_concerns"', 'for="do_you_have_any_weight_concerns_"'],
  ['for="diet_plan"', 'for="do_you_follow_a_specific_diet_or_nutrition_plan_"'],
  ['for="food_preferences"', 'for="do_you_have_any_food_preferences_or_restrictions"'],
  ['for="health_goals"', 'for="what_are_your_health_and_wellness_goals_"'],
  ['for="additional_info"', 'for="anything_else_youd_like_to_share"'],
];

// Radio value replacements
const radioValueReplacements = [
  // Peptides used before
  ['name="have_you_ever_used_pepetides_before_" value="yes"', 'name="have_you_ever_used_pepetides_before_" value="Option 1"'],
  ['name="have_you_ever_used_pepetides_before_" value="no"', 'name="have_you_ever_used_pepetides_before_" value="Option 2"'],
  
  // Sleep hours
  ['value="less_than_5"', 'value="Option 1"'],
  ['value="5_6_hours"', 'value="Option 2"'],
  ['value="6_7_hours"', 'value="6–7 hours"'],
  ['value="7_8_hours"', 'value="7–8 hours"'],
  ['value="more_than_8"', 'value="More than 8 hours"'],
  
  // Alcohol
  ['name="do_you_consume_alcohol_" value="regularly"', 'name="do_you_consume_alcohol_" value="Option 1"'],
  ['name="do_you_consume_alcohol_" value="occasionally"', 'name="do_you_consume_alcohol_" value="Option 2"'],
  ['name="do_you_consume_alcohol_" value="rarely"', 'name="do_you_consume_alcohol_" value="Rarely"'],
  ['name="do_you_consume_alcohol_" value="never"', 'name="do_you_consume_alcohol_" value="Never"'],
  
  // Tobacco
  ['name="do_you_use_tobacco_or_nicotine_products_" value="yes"', 'name="do_you_use_tobacco_or_nicotine_products_" value="Option 1"'],
  ['name="do_you_use_tobacco_or_nicotine_products_" value="no"', 'name="do_you_use_tobacco_or_nicotine_products_" value="Option 2"'],
  
  // Activity level
  ['value="sedentary"', 'value="Option 1"'],
  ['value="lightly_active"', 'value="Option 2"'],
  ['value="moderately_active"', 'value="Moderately active (moderate exercise/sports 3–5 days/week)"'],
  ['value="very_active"', 'value="Very active (hard exercise/sports 6–7 days/week)"'],
  ['value="extremely_active"', 'value="Extremely active (daily intense training or physical job)"'],
  
  // AI consent
  ['name="do_you_consent_to_a_peptide_consultant_reviewing_this_information_to_create_a_personalized_wellness" value="yes"', 'name="do_you_consent_to_a_peptide_consultant_reviewing_this_information_to_create_a_personalized_wellness" value="Option 1"'],
  
  // Bloodwork
  ['name="do_you_have_current_and_up_to_date_bloodwork_" value="yes"', 'name="do_you_have_current_and_up_to_date_bloodwork_" value="Option 1"'],
  ['name="do_you_have_current_and_up_to_date_bloodwork_" value="no"', 'name="do_you_have_current_and_up_to_date_bloodwork_" value="Option 2"'],
  
  // Gender field
  ['<option value="male">Male</option>', '<option value="Male">Male</option>'],
  ['<option value="female">Female</option>', '<option value="Female">Female</option>'],
];

// Peptide checkbox values need to match exactly
const peptideReplacements = [
  ['value="LOOP LEAN (GLP-2)"', 'value="LOOP LEAN – May support weight loss & appetite control"'],
  ['value="LOOP LEAN/BURN (GLP-3)"', 'value="LOOP LEAN/BURN - May aid in fat loss & metobolism support"'],
  ['value="Tesamorelin"', 'value="Tesamorelin – May help reduce visceral fat"'],
  ['value="CJC-1295/Ipamorelin"', 'value="CJC-1295/Ipamorelin – May support fat loss & muscle growth"'],
  ['value="Sermorelin"', 'value="Sermorelin – May promote natural HGH release"'],
  ['value="AOD 9604"', 'value="AOD 9604 – May assist with fat breakdown"'],
  ['value="MOTs-C"', 'value="MOTs-C – May enhance energy & metabolic function"'],
  ['value="BPC-157"', 'value="BPC-157 – May promote healing & reduce inflammation"'],
  ['value="BPC-157 Oral"', 'value="BPC-157 Oral – May promote systemic healing & GI support"'],
  ['value="TB-500"', 'value="TB-500 – May support muscle & tissue repair"'],
  ['value="KPV"', 'value="KPV – May soothe gut & skin inflammation"'],
  ['value="Thymosin Alpha 1 / Thymalin"', 'value="Thymosin Alpha 1 / Thymalin – May support immune function"'],
  ['value="GHK-Cu"', 'value="GHK-Cu – May aid in skin repair & collagen support"'],
  ['value="Epithalon"', 'value="Epithalon – May promote longevity & sleep quality"'],
  ['value="NAD+"', 'value="NAD+ – May support energy, cellular repair & cognition"'],
  ['value="PT-141"', 'value="PT-141 – May enhance libido & sexual function"'],
  ['value="Semax"', 'value="Semax – May support focus, memory, and stress resilience"'],
];

// Apply all replacements
[...fieldReplacements, ...radioValueReplacements, ...peptideReplacements].forEach(([search, replace]) => {
  formContent = formContent.split(search).join(replace);
});

// Change stress level from range to text input
formContent = formContent.replace(
  /<input type="range" id="how_would_you_rate_your_current_stress_level_"[^>]+>/,
  '<input type="text" id="how_would_you_rate_your_current_stress_level_" name="how_would_you_rate_your_current_stress_level_" placeholder="Enter a number from 1 to 10" required>'
);

// Remove the stress value span and scale-input div
formContent = formContent.replace(/<div class="scale-input">[\s\S]*?<\/div>/m, 
  '<input type="text" id="how_would_you_rate_your_current_stress_level_" name="how_would_you_rate_your_current_stress_level_" placeholder="Enter a number from 1 to 10" required>');

// Write the updated form
fs.writeFileSync(formPath, formContent);

console.log('✅ Form fields have been updated to match HubSpot!');
console.log('\nChanges made:');
console.log('- Updated all field names to match HubSpot internal names');
console.log('- Updated radio button values to match HubSpot options');
console.log('- Updated peptide checkbox values to full descriptions');
console.log('- Changed stress level from range to text input');
console.log('- Updated gender field values to be capitalized');
console.log('\n⚠️  Note: Marketing consent field was kept - remove if not needed');