# Hadeer's Media Buyer Workflow - Complete Guide

## Overview
Hadeer is the Media Buyer who manages creatives once they're approved by Hamdi. Her workflow has two main components:

1. **Creative Queue Manager** - `/media-buyer/dashboard` - Manage approved creatives
2. **Weekly Reception Report** - `/media-buyer/report` - Submit performance updates

---

## Part 1: Creative Queue Manager Dashboard

### Purpose
View all creatives approved by Hamdi and manage their publishing lifecycle.

### Access
- **URL:** `/media-buyer/dashboard`
- **From Dashboard:** Click "My Queue" tab or "My Queue" link
- **Who can access:** Hadeer (MediaBuyer) + Hamdi (Admin)

### Workflow

#### Step 1: View Approved Creatives
1. Open the Creative Queue Manager
2. By default, shows all "Approved" creatives from all creators
3. Each creative displays:
   - **Media thumbnail** (image/video icon)
   - **Creator name** - who submitted it
   - **Caption** - creative description
   - **Timestamp** - when it was submitted

#### Step 2: Filter by Status
Use the filter buttons to view creatives at different stages:

```
[Approved] [Published] [Back for Update] [Closed]
```

- **Approved** - Ready to publish (default view)
- **Published** - Already live on platforms
- **Back for Update** - Need revision, send back to creator
- **Closed** - Campaign has ended

#### Step 3: Publish Approved Creative
1. Find an "Approved" creative
2. Click **"▶ Publish"** button
3. Creative moves to "Published" status
4. Status appears in the Publish column
5. Activity logged: "published_creative"

#### Step 4: Send Back for Update (Poor Performance)
1. Find a "Published" creative with poor results
2. Click **"⚠ Update"** button
3. Creative goes back to "Back for Update" status
4. Creator sees feedback and can resubmit
5. Activity logged: "marked_for_update"

#### Step 5: Close Campaign
1. Find a "Published" creative
2. Click **"✓ Close Campaign"** button
3. Campaign ends, status becomes "Closed"
4. Activity logged: "closed_creative"

---

## Part 2: Weekly Reception Report

### Purpose
Document weekly campaign performance and spending for each project.

### Access
- **URL:** `/media-buyer/report`
- **From Dashboard:** Click "Submit Report" link
- **Who can access:** Hadeer (MediaBuyer) + Hamdi (Admin)

### What to Report

#### Campaign Name (Required)
- Example: "Instagram Summer Sale 2024"
- Auto-suggests previous campaign names for consistency

#### Current Spend (Optional)
- How much budget has been spent so far
- Format: USD (dollar sign auto-added)
- Example: 2500.50

#### Daily Status Update (Optional)
- Free-text notes about the campaign
- Max 1000 characters
- Examples:
  - "Video performing well, 25K impressions, 1.2% CTR"
  - "Static image underperforming, recommend variation test"
  - "All creatives approved and live on Facebook & Instagram"

### Workflow

#### Step 1: Fill Out Report
1. Go to Submit Report
2. Enter Campaign Name (e.g., "Q3 Product Launch")
3. Enter Current Spend (e.g., 5000)
4. Write Status Update (e.g., "Campaign live, tracking well")
5. Click **"Submit Report"** button

#### Step 2: View Previous Reports
1. After submitting, scroll down to "Previous Reports"
2. All past reports are listed with:
   - Report Date
   - Campaign Name
   - Spend Amount
   - Status Update (expandable)
3. Click to expand and read full details

#### Step 3: Submit Again Next Week
1. Repeat the process next week
2. You can only submit one report per day (UNIQUE constraint)
3. To update today's report, you must edit via database or create tomorrow

---

## Dashboard Overview

### Navigation Tabs
From the main dashboard, Hadeer sees these tabs:

| Tab | Purpose | For Hadeer |
|-----|---------|-----------|
| Submit Creative | Upload new creative | Not visible (Creator only) |
| Approve Queue | Review submissions | Not visible (Admin only) |
| My Queue | Manage approved creatives | ✅ Main workflow |
| Submit Report | Weekly performance update | ✅ Secondary workflow |
| Activity Log | View all team actions | Not visible (Admin only) |

---

## Status Pipeline

```
Bakr/Asmaa Submits Creative
        ↓
Hamdi Reviews & Approves (becomes "Approved")
        ↓
Hadeer Publishes (becomes "Published")
        ↓
Two Possible Paths:
    ├→ Good Performance: Hadeer closes campaign ("Closed")
    └→ Poor Performance: Hadeer sends back ("Back for Update")
            ↓
        Bakr/Asmaa resubmit with revision
            ↓
        (Returns to Hamdi for approval)
```

---

## Key Features

### Real-Time Updates
- When you publish a creative, it immediately updates status
- Filter buttons reflect current counts
- No page refresh needed

### Activity Logging
Every action Hadeer takes is logged in the Activity Log:
- `published_creative` - When you publish
- `marked_for_update` - When you send back
- `closed_creative` - When you close campaign

### Performance Insights
The Daily Reports create a historical record:
- Track spending trends
- Monitor campaign performance
- Share weekly updates with team
- Visible to Hamdi in Activity Log

---

## Tips for Success

✅ **Check "Published" Status Regularly**
   - Review how published creatives are performing
   - Identify underperforming ones early

✅ **Use "Back for Update" Strategically**
   - Don't let poor performers run forever
   - Give creators clear feedback via internal_note

✅ **Submit Reports Consistently**
   - Every Monday or Friday
   - Include spend and performance metrics
   - Helps Hamdi track ROI

✅ **Communicate with Creators**
   - If you send back a creative, message Bakr/Asmaa
   - Explain what needs improvement
   - They can see manager_comment in their dashboard

---

## Troubleshooting

### Can't see "My Queue" tab
- Check your role: You must be MediaBuyer or Admin
- Ask Hamdi if you have the right permissions

### Creative won't update status
- Check your internet connection
- Try refreshing the page
- Make sure you have the latest version deployed

### Can't submit report twice in one day
- Reports are limited to one per day per user
- Try again tomorrow, or ask Hamdi for database access to modify

### Report shows old data after refresh
- It takes a moment to sync with database
- Try closing the browser tab and reopening

---

## Integration Points

### What Hadeer Controls
- Publishing status of creatives
- Sending creatives back for updates
- Closing campaigns
- Weekly performance reporting

### What Hamdi Controls
- Approving/rejecting creatives
- Reading all activity logs
- Accessing all team data

### What Bakr/Asmaa Control
- Uploading new creatives
- Adding captions and internal notes
- Revising rejected creatives

---

## Success Metrics

Track these KPIs while using the system:

1. **Time to Publish** - How fast from approval to published?
2. **Revision Rate** - % of creatives sent back for update
3. **Campaign Completion** - % of creatives that reach "Closed" status
4. **Average Spend per Campaign** - From daily reports
5. **Activity Log Trends** - When do most approvals happen?

---

## Next Steps

1. ✅ Set up Supabase database (see SUPABASE_SETUP.md)
2. ✅ Have Bakr/Asmaa submit some test creatives
3. ✅ Have Hamdi approve them
4. ✅ Use your dashboard to manage the queue
5. ✅ Submit your first weekly report

You're ready to go! 🚀
