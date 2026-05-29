# EW-TC Team ACTV — Quick Reference Guide

## 🎯 Who Can Do What?

| Role | Pages | Actions |
|------|-------|---------|
| **Hamdi** (Admin) | Approve Queue, Activity Log | Approve/Reject creatives, View all activities |
| **Hadeer** (Media Buyer) | My Queue, Submit Report | Manage approved creatives, Submit daily reports |
| **Bakr** (Creator) | Submit Creative | Upload images/videos, View submission history |
| **Asmaa** (Creator) | Submit Creative | Upload images/videos, View submission history |

---

## 🔐 Login Credentials

```
Hamdi:  sokare5564@nuitx.com  PIN: 1234
Hadeer: hadeer@ew-tc.com      PIN: 2345
Bakr:   bakr@ew-tc.com        PIN: 3456
Asmaa:  asmaa@ew-tc.com       PIN: 4567
```

---

## 📝 Daily Workflows

### For Bakr & Asmaa (Creators)
1. **Log in** → Dashboard
2. **Click "Submit Creative"** → Fill form
3. **Upload** image/video → Write caption
4. **Submit** → Wait for approval
5. **Check status** in "My Submissions" section

### For Hadeer (Media Buyer)
1. **Log in** → Dashboard
2. **Click "My Queue"** → See approved creatives
3. **Publish** creatives to campaigns
4. **Click "Submit Report"** → Daily campaign status
5. **Check "Activity Log"** (if admin) to audit actions

### For Hamdi (Manager/Admin)
1. **Log in** → Dashboard
2. **Click "Approve Queue"** → Review pending creatives
3. **Approve** or **Request Revisions**
4. **Click "Activity Log"** → Audit all team actions
5. **Monitor** trends and performance

---

## 🔄 Creative Status Pipeline

```
Pending (Creator submits)
   ↓
Manager Reviews
   ├→ APPROVE ──→ Approved (Hadeer can publish)
   └→ RETURN ──→ Returned (Creator resubmits with revisions)

Published (after Hadeer launches campaign)
   ├→ Back for Update (campaign underperforming)
   └→ Closed (campaign finished)
```

---

## 💡 New Features in v2.0

| Feature | User | Location |
|---------|------|----------|
| **Weekly Reception Report** | Hadeer | `/media-buyer/report` |
| **Activity Log Audit** | Hamdi | `/admin/activity-log` |
| **Back Buttons** | All | All inner pages |
| **Fixed Form Bug** | Bakr, Asmaa | Creator submission form |

---

## 🎨 Dashboard Navigation

### For Hamdi (Admin)
```
Dashboard Header
├── Submit Creative  (create new posts)
├── Approve Queue    (review pending)
├── My Queue         (manage published)
├── Submit Report    (daily status)
└── Activity Log     (audit all actions) ← NEW
```

### For Hadeer (Media Buyer)
```
Dashboard Header
├── My Queue         (manage creatives)
└── Submit Report    (daily status) ← NEW
```

### For Creators (Bakr & Asmaa)
```
Dashboard Header
└── Submit Creative  (upload media)
```

---

## ⚙️ System Actions Logged

Every action is logged to Activity Log:

✅ **Submitted Creative**
- User: Bakr/Asmaa
- Captured: File name, caption preview

✅ **Approved Creative**
- User: Hamdi
- Captured: Previous status

✅ **Returned Creative**
- User: Hamdi
- Captured: Manager comment

✅ **Published Creative**
- User: Hadeer
- Captured: Campaign info

✅ **Marked for Update**
- User: Hadeer
- Captured: Reason

✅ **Closed Creative**
- User: Hadeer
- Captured: Campaign completion

✅ **Submitted Daily Report**
- User: Hadeer
- Captured: Campaign name, spend amount

---

## 🆘 Troubleshooting

### "I'm stuck on a page"
→ Click the **Back** button in the top left

### "I can't see the Submit Report link"
→ Make sure you're logged in as **Hadeer** (MediaBuyer role)

### "Form submission says 'internal_note is not defined'"
→ **FIXED in v2.0** — This should no longer happen

### "I need to see who did what"
→ Log in as **Hamdi** and go to **Activity Log**

### "The dashboard tabs aren't changing"
→ Use the **navigation links** instead (they're styled differently)

---

## 📊 Reports Page Fields

When submitting a report, fill:

1. **Campaign Name** ← Name of the active campaign
2. **Current Spend** ← Total USD spent to date
3. **Daily Status Update** ← Performance summary and notes

Example:
```
Campaign: Q2 Product Launch
Spend: $2,450.00
Status: CTR up 12%, CPC down 5%. Budget on track. 
        Creative #3 underperforming, pausing tomorrow.
```

---

## 🔍 Activity Log Filters

### Filter by Action
Choose from:
- Submitted Creative
- Approved Creative
- Returned Creative (for revision)
- Published Creative
- Marked for Update
- Closed Creative
- Submitted Daily Report

### Filter by User
See actions by:
- Hamdi
- Hadeer
- Bakr
- Asmaa

---

## ✅ Version Info

- **Module:** 3 - Creative Submission & Approval
- **Version:** 2.0
- **Status:** Production Ready
- **Last Updated:** May 26, 2026

---

## 📞 Questions?

Refer to:
- **BUG_FIXES_SUMMARY.md** — Technical details of fixes
- **README.md** — Full feature documentation
- **DEPLOYMENT_GUIDE.md** — Setup & deployment

