# EW-TC Team ACTV — Quick Start Guide

**Get started in 5 minutes**

---

## 🚀 Step 1: Run Locally

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Open in browser
# http://localhost:3000
```

---

## 🔐 Step 2: Login with Your Account

### Demo Credentials

| Your Name | Email                | PIN  |
|-----------|----------------------|------|
| **Hamdi** | sokare5564@nuitx.com | 1234 |
| **Hadeer** | hadeer@ew-tc.com   | 2345 |
| **Bakr**   | bakr@ew-tc.com     | 3456 |
| **Asmaa**  | asmaa@ew-tc.com    | 4567 |

### How to Login
1. Go to `/login`
2. Click your name
3. Enter your 4-digit PIN
4. Click "Log In"

---

## ✨ What You Can Do

### 👨‍🎨 If You're Bakr or Asmaa (Creators)

**Submit a Creative:**
1. Click "Submit Creative" tab
2. Click the upload area
3. Select an image or video
4. Write a caption
5. Optionally add internal notes
6. Click "Submit Creative"

**See Feedback:**
1. Scroll down to "View My Submissions"
2. Click to expand
3. If status is "Returned", read manager's comment
4. Edit and resubmit with new file

---

### 👔 If You're Hadeer (Media Buyer)

**View Your Queue:**
1. Click "My Queue" tab
2. See all approved creatives
3. Build the ad on Meta
4. Come back and click "Publish"
5. When done, click "Close Campaign"

---

### 🔑 If You're Hamdi (Manager)

**Review Submissions:**
1. Click "Approve Queue" tab
2. See pending creatives one by one
3. Click to expand and see details
4. Either:
   - Click ✅ **Approve** (sends to Hadeer)
   - Add comment and click ↻ **Return** (sends back to creator)

**Also Access:**
- Submit Creative (like creators)
- My Queue (like media buyer)

---

## 📂 File Upload Help

### Supported Formats
- **Images:** PNG, JPG, WebP
- **Videos:** MP4, WebM

### Tips
- Files should be under 50MB
- Maximum caption: 500 characters
- Maximum notes: 300 characters
- All uploads are permanent (version history kept)

---

## 🔄 Status Meanings

| Status | What It Means | Next Step |
|--------|---------------|-----------|
| **Pending** | Waiting for Hamdi to review | Wait for feedback |
| **Returned** | Hamdi wants changes | Read comment, edit, resubmit |
| **Approved** | Hamdi approved ✅ | (If Hadeer) Build on Meta |
| **Published** | Live on Meta 🟢 | Monitor results |
| **Back for Update** | Hadeer needs changes | Prepare update |
| **Closed** | Campaign is done | Archive |

---

## ❓ Common Questions

### How do I know when my submission is reviewed?
Check the app regularly or ask Hamdi. (Email notifications coming soon)

### Can I upload a new version?
Yes! When returning to a submission, just upload a new file. Old versions are kept.

### What if I make a mistake?
Contact Hamdi. Submitted creatives can't be edited, but they can be marked as "Closed" if unused.

### Is my data secure?
Yes! Files are stored in Supabase (AWS-backed encryption) and all actions are logged.

### Can I undo an action?
Contact Hamdi. Most actions can be reversed by changing the status.

---

## 🎯 Your First Task

### For Bakr (Creative)
1. Login with PIN 3456
2. Click "Submit Creative"
3. Upload a test image or screenshot
4. Write a caption like "Test submission for onboarding"
5. Click "Submit Creative"
6. Check back in an hour for Hamdi's feedback

### For Hadeer (Media Buyer)
1. Login with PIN 2345
2. Click "My Queue"
3. You'll see approved creatives (after Hamdi approves Bakr's)
4. Click "Publish" to move to next status

### For Hamdi (Manager)
1. Login with PIN 1234
2. Click "Approve Queue"
3. See pending creatives from the team
4. Click to expand one
5. Click "Approve" to move to Hadeer's queue
6. (Or click "Return" with a comment to ask for revision)

### For Asmaa (Video)
1. Login with PIN 4567
2. Same as Bakr—upload a video instead of image

---

## 🚀 Deploy to Production

When ready, follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to:
1. Set up Supabase database
2. Deploy to Vercel
3. Configure real users
4. Go live!

---

## 📞 Need Help?

### Common Issues

**"Invalid PIN or login failed"**
- Double-check the PIN (1234, 2345, 3456, 4567)
- Make sure email is exactly right
- Clear cache and try again

**"File upload failed"**
- Check file is under 50MB
- Try a different image/video
- Refresh page and try again

**"I can't see the dashboard"**
- You may be logged out. Login again.
- Clear browser cache.
- Open in a new incognito window.

### Still Stuck?
Check console for errors (F12 → Console tab) and screenshot to share with Hamdi.

---

## 📚 Learn More

- **Full Features:** [README.md](./README.md)
- **Technical Details:** [MODULE3_SUMMARY.md](./MODULE3_SUMMARY.md)
- **Setup & Deployment:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Version:** 1.0  
**Last Updated:** May 26, 2026  
**Status:** Ready to Use 🚀
