# Squarespace Static Form Solution

Since Squarespace is blocking JavaScript even in Code Blocks, here's a pure HTML/CSS solution:

## Option 1: Static Form (No JavaScript) ✅

Use `squarespace-static-form.html` in a Code Block:

1. **Add a Code Block** to your page (not Code Injection)
2. **Copy the entire contents** of `squarespace-static-form.html`
3. **Paste into the Code Block**
4. **Save and publish**

This form:
- Uses NO JavaScript (works in Squarespace)
- Submits directly to HubSpot's public endpoint
- Matches your LOOP design exactly
- Uses native HTML5 date picker for DOB

## Option 2: Keep HubSpot Embed + Minimal Tracking

If you want to keep your existing HubSpot embed:

1. **Keep your current embed code** on the form page
2. **Add tracking script** to Settings → Advanced → Code Injection → **Footer**:
   - Copy contents of `squarespace-tracking-only.html`
   - This minimal script just captures and stores tracking

## Option 3: Third-Party Form Service

Consider using a form service that integrates with both Squarespace and HubSpot:
- **Typeform** - Embeds easily in Squarespace, syncs to HubSpot
- **JotForm** - Similar capabilities
- **Google Forms** + Zapier → HubSpot

## How the Static Form Works

The static form uses HubSpot's public submission endpoint:
```html
<form action="https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/242518594/09ab75f6-bfbc-4d1c-8761-9ff764b650ca" method="POST">
```

### Tracking with Static Form

Since we can't use JavaScript to populate fields, you have two options:

1. **URL Pre-population**: Link to form with parameters
   ```
   https://yoursite.com/form-page?refersionid=ABC123
   ```
   Then manually update the hidden field default values

2. **Server-side solution**: Use Squarespace Developer Platform to process forms

## Testing

1. Test the form submission works
2. Check in HubSpot that contacts are created
3. For tracking, you'll need to manually check if refersionid field is populated

## Limitations

Without JavaScript:
- Can't auto-populate tracking fields
- Can't format date input (uses browser's native date picker)
- Can't do client-side validation beyond HTML5
- Can't show custom success messages (will redirect to HubSpot's default)

## Alternative: External Hosting

Host the form on a subdomain outside Squarespace:
1. Create `forms.yourdomain.com`
2. Host the full JavaScript version there
3. Link to it from Squarespace

This gives you full control while keeping your main site on Squarespace.