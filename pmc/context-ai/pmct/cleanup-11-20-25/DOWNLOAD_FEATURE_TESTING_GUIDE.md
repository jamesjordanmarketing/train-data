# Download Feature - Quick Testing Guide

## 🚀 Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/conversations
   ```

3. **Test the download feature!**

---

## 🧪 Test Scenarios

### Test 1: Basic Download from Table
**Steps:**
1. Find any conversation in the table
2. Look for the download icon (📥) in the Actions column
3. Click the download icon
4. **Expected:**
   - Icon changes to spinning loader (⟳)
   - Button becomes disabled
   - After ~500ms, new tab opens
   - JSON file downloads
   - Toast notification: "✅ Download Started"
   - Button returns to normal state

**Visual:**
```
Before:  [View] [📥] [Approve] [Reject]
During:  [View] [⟳] [Approve] [Reject]  ← Disabled, spinning
After:   [View] [📥] [Approve] [Reject]  ← Back to normal
```

---

### Test 2: Download from Dialog
**Steps:**
1. Click "View" button on any conversation
2. Dialog opens with conversation details
3. Click "Download JSON" button at bottom
4. **Expected:**
   - Button text changes: "Download JSON" → "Generating..."
   - Download icon changes to spinner
   - Button becomes disabled
   - After ~500ms, new tab opens
   - JSON file downloads
   - Toast: "✅ Download Started - Downloading conversation_xxx.json"
   - Button returns to: "📥 Download JSON"

**Visual:**
```
Before:  [ 📥 Download JSON ]
During:  [ ⟳ Generating...  ]  ← Disabled
After:   [ 📥 Download JSON ]
```

---

### Test 3: Keyboard Shortcut
**Steps:**
1. Click "View" on any conversation to open dialog
2. Press `Cmd+D` (Mac) or `Ctrl+D` (Windows/Linux)
3. **Expected:**
   - Same behavior as clicking Download button
   - Download starts immediately
   - Toast notification appears

**Note:** Browser may try to bookmark the page - our code prevents this!

---

### Test 4: Error Handling - Not Found
**Steps:**
1. Open browser console
2. Manually call: `handleDownloadConversation('fake-id-12345')`
3. **Expected:**
   - API returns 404
   - Toast: "❌ File Not Available - Conversation file not found"
   - Button returns to normal (not stuck)

---

### Test 5: Multiple Downloads
**Steps:**
1. Click download on Conversation A
2. While it's loading, try to click download on Conversation B
3. **Expected:**
   - Conversation A button disabled with spinner
   - Conversation B button works normally
   - Can start download for B after A completes
   - Both downloads work independently

---

### Test 6: Loading State Visibility
**Steps:**
1. Throttle network to "Slow 3G" in browser DevTools
2. Click download button
3. **Expected:**
   - Loading spinner clearly visible for several seconds
   - Button stays disabled entire time
   - User can see something is happening
   - Eventually download completes

**How to throttle:**
- Chrome: DevTools → Network tab → Throttling dropdown → Slow 3G
- Firefox: DevTools → Network Monitor → Throttling → GPRS

---

## 🎨 Visual States Reference

### Button States

#### 1. Idle (Default)
```
┌────────────────────┐
│ 📥 Download JSON   │
└────────────────────┘
```

#### 2. Loading
```
┌────────────────────┐
│ ⟳ Generating...    │  (disabled, spinner animates)
└────────────────────┘
```

#### 3. Success
```
┌────────────────────┐
│ 📥 Download JSON   │  + Toast notification
└────────────────────┘
```

---

### Toast Notifications

#### Success Toast
```
┌─────────────────────────────────────────┐
│ ✅ Download Started                     │
│                                         │
│ Downloading conversation_abc123.json    │
└─────────────────────────────────────────┘
```

#### Error Toast - Not Found
```
┌─────────────────────────────────────────┐
│ ❌ File Not Available                   │
│                                         │
│ Conversation file not found             │
└─────────────────────────────────────────┘
```

#### Error Toast - Auth Required
```
┌─────────────────────────────────────────┐
│ ❌ Authentication Required              │
│                                         │
│ Please log in to download conversations │
└─────────────────────────────────────────┘
```

#### Error Toast - Access Denied
```
┌─────────────────────────────────────────┐
│ ❌ Access Denied                        │
│                                         │
│ You do not have permission to download  │
│ this conversation                       │
└─────────────────────────────────────────┘
```

---

## 🐛 Debugging

### Check Console Logs

**Successful download:**
```
[Download] Requesting download URL for conversation: conv_123
[Download] ✅ Received download URL: {
  conversation_id: "conv_123",
  filename: "conversation_conv_123.json",
  expires_at: "2025-11-18T15:30:00Z"
}
```

**Error scenario:**
```
[Download] Requesting download URL for conversation: conv_123
[Download] API error: { message: "Conversation file not found", code: "FILE_NOT_FOUND" }
[Download] Error: Error: Conversation file not found
```

### Check Network Tab

**Request:**
```
GET /api/conversations/conv_123/download
Status: 200 OK
```

**Response:**
```json
{
  "conversation_id": "conv_123",
  "filename": "conversation_conv_123.json",
  "download_url": "https://storage.googleapis.com/bucket/path/file.json?signed=...",
  "expires_at": "2025-11-18T15:30:00Z"
}
```

---

## ✅ Acceptance Criteria Checklist

### Functionality
- [ ] Download button in table works
- [ ] Download button in dialog works
- [ ] Keyboard shortcut (Cmd/Ctrl+D) works
- [ ] Downloads correct JSON file
- [ ] Multiple downloads work independently

### UI/UX
- [ ] Loading spinner visible during generation
- [ ] Button disabled while loading
- [ ] Success toast shows filename
- [ ] Error toasts show appropriate messages
- [ ] Button returns to normal after completion/error

### Error Handling
- [ ] 401 error shows "Authentication Required"
- [ ] 403 error shows "Access Denied"
- [ ] 404 error shows "File Not Available"
- [ ] Generic errors show "Download Failed"
- [ ] All errors logged to console

### Performance
- [ ] API response < 1 second (typical < 500ms)
- [ ] No memory leaks
- [ ] No duplicate requests
- [ ] Loading state prevents spam clicking

### Code Quality
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Code is well-documented

---

## 🎯 Common Issues & Solutions

### Issue: "Download doesn't start"

**Possible causes:**
1. Popup blocker enabled
2. API endpoint not responding
3. File not available in storage

**Debug steps:**
1. Check browser console for errors
2. Check network tab for 404/500 errors
3. Check popup blocker settings
4. Try a different conversation

---

### Issue: "Button stuck in loading state"

**Possible causes:**
1. Network timeout
2. API endpoint error (not caught)
3. JavaScript error in handler

**Debug steps:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Refresh the page
4. Check if error toast appeared

---

### Issue: "Toast doesn't appear"

**Possible causes:**
1. Sonner not configured in layout
2. JavaScript error preventing toast
3. Toast timeout too short

**Debug steps:**
1. Check if `Toaster` component in layout.tsx
2. Check browser console for errors
3. Try manually calling `toast.success('Test')`

---

### Issue: "Keyboard shortcut doesn't work"

**Possible causes:**
1. Browser shortcut conflict
2. Focus not on dialog
3. JavaScript error in event listener

**Debug steps:**
1. Try Cmd/Ctrl+Shift+D instead
2. Check browser console for errors
3. Verify dialog is open
4. Check if conversation is selected

---

## 📱 Mobile Testing

### iOS Safari
- [ ] Download button visible and tappable
- [ ] Loading spinner visible
- [ ] Toast notifications appear
- [ ] Downloaded file accessible in Files app

### Android Chrome
- [ ] Download button visible and tappable
- [ ] Loading spinner visible
- [ ] Toast notifications appear
- [ ] Downloaded file accessible in Downloads

---

## 🎬 Recording a Demo Video

### Suggested Script

**Scene 1: Table Download (15 seconds)**
1. Show conversations table
2. Point to download icon
3. Click download icon
4. Show loading state
5. Show success toast
6. Show downloaded file

**Scene 2: Dialog Download (20 seconds)**
1. Click "View" on a conversation
2. Show conversation details
3. Scroll to download button
4. Click "Download JSON"
5. Show loading state ("Generating...")
6. Show success toast with filename
7. Show downloaded file in browser

**Scene 3: Keyboard Shortcut (10 seconds)**
1. Open conversation dialog
2. Show keyboard (press Cmd/Ctrl+D)
3. Download starts immediately
4. Show success toast

**Scene 4: Error Handling (10 seconds)**
1. Try to download non-existent conversation
2. Show error toast
3. Show button returns to normal state
4. Click to try again

**Total video length:** ~60 seconds

---

## 📸 Screenshot Checklist

### Required Screenshots

1. **Normal state (table view)**
   - Full conversations table
   - Download icon visible
   - No loading states

2. **Loading state (table view)**
   - Download icon changed to spinner
   - Button disabled (different opacity)
   - Other buttons still enabled

3. **Dialog view (idle)**
   - Conversation details visible
   - "Download JSON" button at bottom
   - Download icon visible

4. **Dialog view (loading)**
   - "Generating..." text
   - Spinner visible
   - Button disabled

5. **Success toast**
   - Green checkmark
   - "Download Started" title
   - Filename in description

6. **Error toast**
   - Red X icon
   - "File Not Available" (or other error)
   - Error message in description

7. **Downloaded file**
   - Browser downloads bar
   - JSON file visible
   - Correct filename format

---

## 🚦 Testing Status

### ✅ Completed
- [ ] Basic download from table
- [ ] Download from dialog
- [ ] Keyboard shortcut
- [ ] Loading states
- [ ] Success notifications
- [ ] Error handling
- [ ] Multiple downloads
- [ ] Mobile responsive

### 🔍 To Review
- [ ] Accessibility (screen readers)
- [ ] Performance (large files)
- [ ] Browser compatibility
- [ ] Offline behavior

### 📝 Notes
_Add your testing notes here..._

---

## 🎉 Success!

Once all tests pass:
1. ✅ Mark all checklist items complete
2. 📸 Take screenshots
3. 🎬 Record demo video
4. 📄 Update documentation
5. 🚀 Ready for deployment!

---

**Last Updated:** November 18, 2025  
**Tester:** _____________  
**Date Tested:** _____________  
**Status:** ⬜ Pass  ⬜ Fail  ⬜ Needs Review

