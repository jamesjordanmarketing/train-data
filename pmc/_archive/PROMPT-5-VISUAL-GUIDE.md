# PROMPT 5 VISUAL GUIDE
## Metadata & Preview Features - UI Flow

---

## 📸 COMPONENT OVERVIEW

### Upload Queue - Actions Menu

```
┌─────────────────────────────────────────────────────────────────┐
│ Upload Queue                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Document            Status      Type   Size    Actions          │
│ ─────────────────────────────────────────────────────────────── │
│ 📄 Test Doc         [Completed] PDF    2.5 MB   [⋮]            │
│    test.pdf                                       │              │
│                                                   ▼              │
│                                     ┌──────────────────────┐    │
│                                     │ View Document        │    │
│                                     │ Preview Content   ✨│    │ <- NEW
│                                     │ Edit Metadata     ✨│    │ <- NEW
│                                     │ Delete               │    │
│                                     └──────────────────────┘    │
│                                                                  │
│ 📄 Error Doc        [Error]     PDF    1.2 MB   [⋮]            │
│    error.pdf                                      │              │
│                                                   ▼              │
│                                     ┌──────────────────────┐    │
│                                     │ View Document        │    │
│                                     │ View Error Details ✨│    │ <- NEW
│                                     │ Retry Processing     │    │
│                                     │ Delete               │    │
│                                     └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ METADATA EDIT DIALOG

**Trigger:** Click "Edit Metadata" in actions menu (for completed documents)

```
┌────────────────────────────────────────────────────────────┐
│  ✕  Edit Document Metadata                                 │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Update document information. Changes are saved to the     │
│  database.                                                  │
│                                                             │
│  Title *                                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ My Important Document                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Version                                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ v2.0                                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│  Optional version or status label                          │
│                                                             │
│  Source URL                                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ https://example.com/document                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  Optional URL where document was sourced                   │
│                                                             │
│  Document Date                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📅 October 10, 2025                          [▼]      │ │ <- Opens calendar
│  └───────────────────────────────────────────────────────┘ │
│  Original document date (not upload date)                  │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│  File Type          File Size        Status                │
│  PDF                2.5 MB           Completed              │
│                                                             │
│                                 [ Cancel ]  [ Save Changes ]│
└────────────────────────────────────────────────────────────┘
```

**Validation:**
- ❌ Empty title → "Title is required"
- ❌ Invalid URL → "Must be a valid HTTP or HTTPS URL"
- ✅ Valid data → Saves successfully

---

## 2️⃣ CONTENT PREVIEW SHEET

**Trigger:** Click "Preview Content" in actions menu (for completed documents)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                        [✕]       │
│                                                                  │
│  📄 My Important Document                                       │
│  test.pdf • 2.5 MB • PDF                                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Content Statistics                                         │ │
│  │                                                             │ │
│  │  Characters      Words         Lines        Paragraphs     │ │
│  │  12,458          2,341          456          89            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Extraction Quality                                         │ │
│  │                                                             │ │
│  │  Format Validation           [✓ Valid]                     │ │
│  │  Content Length              [✓ Good]                      │ │
│  │  Encoding                    [✓ UTF-8]                     │ │
│  │  Quality Score               95%                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Extracted Text              [ Copy ] [ Download ]          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ This is the beginning of the extracted text content...    │ │
│  │                                                             │ │
│  │ Lorem ipsum dolor sit amet, consectetur adipiscing elit.  │ │
│  │ Sed do eiusmod tempor incididunt ut labore et dolore      │ │
│  │ magna aliqua. Ut enim ad minim veniam, quis nostrud       │ │
│  │ exercitation ullamco laboris nisi ut aliquip ex ea        │ │
│  │ commodo consequat...                                       │ │
│  │                                                             │ │
│  │ [Scroll for more...]                                       │ │
│  │                                                             │ │
│  │ ─────────────────────────────────────────────────────     │ │
│  │ Showing first 2,000 characters of 12,458 total            │ │
│  │                                                             │ │
│  │              [🔍 View Full Document]                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Uploaded               Processed                           │ │
│  │ 5m ago                 4m ago                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Real-time statistics
- ✅ Quality score calculation
- ✅ Scrollable text preview
- ✅ Copy entire content
- ✅ Download as .txt file

---

## 3️⃣ ERROR DETAILS DIALOG

**Trigger:** Click "View Error Details" in actions menu (for error documents)

```
┌────────────────────────────────────────────────────────────┐
│  ⊗  Processing Error                                   [✕] │
│     error.pdf                                               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [⚠️ Server Error] • Recoverable (retry available)         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠️  Error Details:                                    │  │
│  │                                                        │  │
│  │     Failed to extract text from PDF file. The file   │  │
│  │     may be corrupted or contain only scanned images. │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💡  Suggested Action:                                 │  │
│  │                                                        │  │
│  │     Retry processing or contact support               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Common Causes:                                       │  │
│  │                                                        │  │
│  │  • Temporary server issue or high load                │  │
│  │  • Network connection interrupted during processing   │  │
│  │  • File size may be too large for processing          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Technical Information:                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Document ID: 550e8400-e29b-41d4-a716-446655440000    │  │
│  │ Error Category: system                                │  │
│  │ Timestamp: 2025-10-10T14:32:15.823Z                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [ 📋 Copy Error Details ]  [ 🔄 Retry Processing ]        │
│                             [ 🔗 Contact Support ]          │
└────────────────────────────────────────────────────────────┘
```

**Error Types:**
- 🟠 **File Errors:** Corrupt, unsupported format, password-protected
- 🟡 **Content Errors:** No text, scanned images, empty
- 🔴 **System Errors:** Timeout, server issues, network problems

**Actions:**
- ✅ Copy error details (formatted for support tickets)
- ✅ Retry processing (if recoverable)
- ✅ Contact support (pre-filled email)

---

## 🎨 COLOR CODING

### Status Badges
```
[✓ Completed]   - Green   - Document processed successfully
[⚙️ Processing]  - Blue    - Text extraction in progress
[❌ Error]       - Red     - Processing failed
[📤 Uploaded]    - Yellow  - Awaiting processing
```

### Error Categories
```
[File Error]     - 🟠 Orange  - File issues (corrupt, wrong format)
[Content Error]  - 🟡 Yellow  - Content issues (no text, empty)
[System Error]   - 🔴 Red     - System issues (timeout, server)
```

---

## 🔄 USER FLOWS

### Flow 1: Edit Metadata
```
Upload Queue → Actions (⋮) → Edit Metadata
                               ↓
                        [Dialog Opens]
                               ↓
                        Update Fields
                               ↓
                        Click "Save"
                               ↓
                        [Toast: Success]
                               ↓
                        Dialog Closes
                               ↓
                        List Refreshes
```

### Flow 2: Preview Content
```
Upload Queue → Actions (⋮) → Preview Content
                               ↓
                        [Sheet Slides In]
                               ↓
                        View Statistics
                               ↓
                        Scroll Text
                               ↓
                        Copy or Download
                               ↓
                        Close Sheet
```

### Flow 3: View Error
```
Upload Queue → Actions (⋮) → View Error Details
                               ↓
                        [Dialog Opens]
                               ↓
                        Read Error Info
                               ↓
                        Copy Details
                               ↓
                        Retry or Contact Support
                               ↓
                        Dialog Closes
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (1920x1080)
```
┌──────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Upload Queue (full width)                     │
│             │  ┌──────────────────────────────────────────┐  │
│  Navigation │  │  Document list with all columns          │  │
│             │  │  Actions menu fully expanded             │  │
│             │  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (375x667)
```
┌──────────────────────┐
│  ☰  Upload Queue     │
├──────────────────────┤
│  📄 Doc 1            │
│  [Completed]    [⋮] │
│                      │
│  📄 Doc 2            │
│  [Error]        [⋮] │
└──────────────────────┘

Dialog adapts:
- Full screen overlay
- Touch-friendly buttons
- Calendar optimized for mobile
- Sheet slides from bottom
```

---

## 🎯 KEY INTERACTIONS

### Calendar Date Picker
```
Click Date Field → Calendar Opens
                    ↓
                Select Date
                    ↓
                Format: "October 10, 2025"
                    ↓
                Click Outside → Closes
```

### Copy to Clipboard
```
Click "Copy" → Content Copied
                ↓
           [Toast: "Content copied"]
                ↓
           Paste anywhere (Ctrl+V)
```

### Download File
```
Click "Download" → Browser downloads
                    ↓
               [Toast: "Content downloaded"]
                    ↓
               File: "document_extracted.txt"
```

---

## ✨ ACCESSIBILITY

- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators visible
- ✅ Error messages announced to screen readers
- ✅ Color is not the only indicator (icons + text)
- ✅ Contrast ratios meet WCAG AA standards

---

## 🎉 WHAT USERS SEE

### Before (Prompt 4)
```
Actions Menu:
  - View Document
  - Delete
  (- Retry if error)
```

### After (Prompt 5) ✨
```
Actions Menu (Completed):
  - View Document
  - Preview Content      ← NEW
  - Edit Metadata        ← NEW
  - Delete

Actions Menu (Error):
  - View Document
  - View Error Details   ← NEW
  - Retry Processing
  - Delete
```

---

## 📊 FEATURE COMPARISON

| Feature              | Before | After |
|---------------------|--------|-------|
| Edit Metadata       | ❌     | ✅    |
| Preview Content     | ❌     | ✅    |
| View Error Details  | ❌     | ✅    |
| Copy Content        | ❌     | ✅    |
| Download Content    | ❌     | ✅    |
| Calendar Picker     | ❌     | ✅    |
| Error Classification| ❌     | ✅    |
| Quality Score       | ❌     | ✅    |
| Content Statistics  | ❌     | ✅    |

---

**END OF VISUAL GUIDE**
