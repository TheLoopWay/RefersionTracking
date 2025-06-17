# 🚨 SCRIPTS EXPLAINED - VISUAL GUIDE

## Two COMPLETELY Different Scripts

### 1️⃣ FORM EMBED SCRIPT
**Purpose**: Shows the actual form on your page

```html
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
```

**Where it goes**:
```
Squarespace Page Editor
    ↓
Add Block (+)
    ↓
Code Block ✅
    ↓
Paste the code above
```

**What happens**:
- ✅ A form appears on that page
- ✅ Visitors can fill it out
- ✅ Tracking is automatic

---

### 2️⃣ GLOBAL TRACKING SCRIPT
**Purpose**: Captures affiliate IDs on ALL pages (no form shown)

```html
<script>
(function() {
  var rfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (rfsn) {
    document.cookie = 'rfsn=' + rfsn + '; max-age=2592000; path=/';
    if (window.r) window.r('click', rfsn);
  }
})();
</script>
```

**Where it goes**:
```
Settings
    ↓
Advanced
    ↓
Code Injection
    ↓
Footer ✅
    ↓
Paste the code above
```

**What happens**:
- ❌ NO form appears
- ✅ Captures ?rfsn= on every page
- ✅ Stores for 30 days

---

## 🤔 Which Do I Need?

### Scenario 1: "I just want a form on one page"
✅ Use **FORM EMBED** only  
❌ Skip global tracking

### Scenario 2: "I want forms on multiple pages"
✅ Use **FORM EMBED** on each page  
❌ Still skip global tracking (form embed handles it)

### Scenario 3: "I want to track affiliates everywhere, even pages without forms"
✅ Use **FORM EMBED** on form pages  
✅ Use **GLOBAL TRACKING** in Code Injection

---

## ⚠️ Common Mistakes

### ❌ WRONG: Putting form embed in Code Injection
```
Settings → Code Injection → ❌ FORM EMBED CODE
```
Result: No form appears anywhere!

### ❌ WRONG: Putting global tracking in Code Block
```
Page → Code Block → ❌ GLOBAL TRACKING CODE
```
Result: Tracking only works on that one page!

### ✅ RIGHT: Each script in its proper place
```
Form Embed → Code Block on specific pages
Global Tracking → Code Injection (if needed)
```

---

## 📝 Summary

| Script | Shows Form? | Where It Goes | When To Use |
|--------|------------|---------------|-------------|
| **Form Embed** | ✅ Yes | Code Block | Always - on pages with forms |
| **Global Tracking** | ❌ No | Code Injection | Optional - for site-wide tracking |

**Remember**: The form embed script ALREADY tracks affiliates. You only need global tracking if you want to capture affiliates on pages that DON'T have forms.