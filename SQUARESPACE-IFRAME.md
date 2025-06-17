# Squarespace Iframe Solution (No JavaScript)

Since Squarespace is blocking JavaScript in embed scripts, use this simple iframe solution:

## For Code Block (Recommended)

Add this to a **Code Block** on your page:

```html
<iframe 
  src="https://forms.theloopway.com/peptide-inquiry.html" 
  width="100%" 
  height="1200" 
  frameborder="0" 
  scrolling="no"
  style="border: none; overflow: hidden;">
</iframe>
```

## Benefits

- ✅ No JavaScript required
- ✅ Works in Squarespace Code Blocks
- ✅ Tracking still works (passed through iframe URL)
- ✅ Form shows with proper styling

## Tracking Still Works!

When someone visits your page with tracking:
```
yoursite.com/page?rfsn=ABC123
```

The iframe will automatically capture it because our form code reads from the parent URL.

## Adjusting Height

If the form is cut off, increase the height:
- Default: `height="1200"`
- Taller: `height="1400"`
- Shorter: `height="1000"`

## Multiple Forms

For different forms, just change the URL:
- Peptide Inquiry: `/peptide-inquiry.html`
- Consultation: `/consultation.html`
- Custom: `/your-form.html`

## Testing

1. Add the iframe code to a Code Block
2. Visit with `?rfsn=TEST123` in URL
3. Submit form
4. Check HubSpot for tracking data