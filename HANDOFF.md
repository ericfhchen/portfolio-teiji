# Site Updates — Handoff Notes

This document summarizes recent changes to the site and Sanity Studio. Review each section to understand what's new and what (if anything) you need to do.

---

## Completed

### 1. Embed Block (Iframe)
You can now add external embeds (like Endless Tools, YouTube, etc.) directly into project pages.

**How to use:**
- Open a project in Sanity Studio → scroll to the **Content** section
- Click the **+** button → choose **Iframe Embed**
- Paste the **URL** from the embed code (the `src` value, not the full HTML)
- Choose an **aspect ratio** (default is 16:9, or use "Full Viewport Height" for full-screen embeds)
- Optionally set a **width** (40%, 60%, 80%, 100%, or custom)
- Set **background** to transparent, white, or black depending on the embed
- Add a **caption** if needed

---

### 2. Project Ordering — Now Separate for Home and Work Pages
Previously, there was one "Featured" toggle and one drag order for all projects. Now, **Home** and **Work** pages are controlled independently.

**What changed in each project document:**
- The old **Featured** toggle is gone
- There are now two toggles:
  - **Featured on Home** — controls whether the project appears on the section home page slideshow
  - **Featured on Work** — controls whether the project appears on the section work page grid
- When a toggle is turned on, a **number field** appears next to it:
  - **Home Order** — sets the position in the home slideshow (1 = first, 2 = second, etc.)
  - **Work Order** — sets the position in the work grid (1 = first, 2 = second, etc.)

**What you need to do:**
- Open each project and set the new toggles and order numbers. The old "Featured" setting did not carry over automatically.
- A project can appear on both pages, just one, or neither — it's up to you.

---

### 3. Work Grid — Fixed Alignment on Odd Number of Projects
When the work page had an odd number of projects, the last row's grid lines were visually misaligned. This has been fixed — no action needed on your end.

---

### 4. Navigation Text — Auto-Contrast Over Images
The top navigation (Art/Design) and side navigation (Work/Index/About) now automatically adjust to remain visible against any background. Over light images or backgrounds, text appears dark; over dark images, text appears light. No action needed on your end.

---

### 5. Project Description — Now Rich Text with Links
The description field on each project is now a rich text editor instead of plain text. You can add **bold**, *italic*, and **links** directly in the description.

**What you need to know:**
- All existing descriptions have been automatically converted — no re-entry needed
- To add a link: select text in the description → click the link icon → paste the URL
- Links in the description will open in a new tab automatically
- The "See More / See Less" expand behavior still works the same way

---

### 6. Menu Stays Visible While Scrolling
The navigation links no longer hide when you scroll on mobile. They remain visible at all times.

---

### 7. About Page (Art) — Right Side Image Gallery
The right side of the Art about page now supports **multiple images** instead of a single image. Images are displayed top-aligned with the left-side text, stacked vertically, and scroll independently. Different aspect ratios are fully supported.

**What changed:**
- The old single "Media Item" field has been replaced by a new **Image Gallery** field
- Your existing image was automatically moved into the new gallery
- You can now add, remove, and reorder as many images as you want

**How to use:**
- Open the Art about page in Sanity Studio
- Scroll to the **Image Gallery (Art)** field
- Click **Add item** to upload new images
- Drag to reorder
- Each image can have optional alt text

---

### 8. About Page — Links Open in New Tab
All external links on both Art and Design about pages (CV entries, bio text, client links, Instagram) now open in a new tab. Additionally, **links can now be added** in the Bio and CV text fields — select text and click the link icon to add a URL.

---

### 9. Final Research Credit
A "Website by FINAL RESEARCH" credit now appears on both About pages (Art and Design), positioned at the bottom of the left column next to the center grid line. On hover, it changes to "FINALRESEARCH.ORG" and draws decorative lines from the viewport corners. No action needed on your end.

---

### 10. Mobile Index Filters — Horizontal Scroll
Filter pills on the mobile index page no longer stack vertically. They now scroll horizontally with overflow. No action needed on your end.

---

### 11. Mobile Safe Area Fix
Removed a white bar that appeared at the bottom of all pages on mobile (below the navigation). Content now flows cleanly to the edge of the screen. The theme background color is also applied instantly on page load (no white flash when switching between Art and Design).

---

## In Progress

*More updates will be added here as they are completed.*
