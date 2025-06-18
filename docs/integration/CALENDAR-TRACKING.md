# HubSpot Calendar Scheduler Tracking

This guide explains how to add Refersion tracking to HubSpot meeting schedulers.

## Quick Start

Add this script **BEFORE** your HubSpot calendar embed code:

```html
<!-- Add this FIRST -->
<script src="https://forms.theloopway.com/calendar-tracking.js"></script>

<!-- Then your HubSpot meeting embed -->
<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/your-meeting-link"></div>
<script type="text/javascript" src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
```

## How It Works

The script attempts multiple methods to pass tracking:

1. **URL Parameters** - Adds `refersionid` to meeting links
2. **HubSpot Identify** - Uses HubSpot's tracking API
3. **PostMessage** - Communicates with the meeting iframe
4. **Server Backup** - Stores hutk→rfsn mapping

## Custom Contact Property Setup

For best results, ensure your HubSpot account has the `refersionid` custom property:

1. Go to HubSpot → Settings → Properties → Contact Properties
2. The property should already exist (created by your forms)
3. Make sure it's set to "single-line text"

## Different Meeting Types

### Standard Meeting Link
```html
<script src="https://forms.theloopway.com/calendar-tracking.js"></script>
<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/william/discovery-call"></div>
<script src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
```

### Round Robin Meeting
```html
<script src="https://forms.theloopway.com/calendar-tracking.js"></script>
<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/team/sales-team"></div>
<script src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
```

### Direct Calendar Link
If using a direct link instead of embed:
```html
<script src="https://forms.theloopway.com/calendar-tracking.js"></script>
<a href="https://meetings.hubspot.com/william/call" class="button">Book a Call</a>
```

## Testing

1. Visit your page with `?rfsn=TEST456`
2. Book a meeting
3. Check the contact in HubSpot for the `refersionid` field

## Advanced Usage

### Manual Tracking Check
```javascript
// Get current tracking
const tracking = window.LoopCalendarTracking.getTracking();
console.log('Current tracking:', tracking);

// Force re-injection
window.LoopCalendarTracking.inject();
```

### Custom Implementation
If you need to pass tracking differently:
```javascript
// Get the tracking value
const rfsn = window.LoopCalendarTracking.getTracking();

// Use it in your custom implementation
if (rfsn) {
  // Add to your calendar URL, form data, etc.
}
```

## Limitations

- HubSpot meeting scheduler has limited customization options
- Some meeting types may not support custom fields
- Tracking works best when contacts are created (not updated)

## Alternative: Workflow Automation

If direct tracking doesn't work, use HubSpot workflows:

1. Create a workflow triggered by "Meeting booked"
2. Check if contact has `refersionid` empty
3. Look up recent form submissions or page visits
4. Copy tracking from related activities

## Support

For issues with calendar tracking, check:
1. Browser console for errors
2. Network tab for `/api/track` calls
3. HubSpot contact properties after booking