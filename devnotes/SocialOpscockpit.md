SocialOpscockpit.md
Here’s a clean way to imagine this as a **single “Social Ops cockpit”** for TarotTALKS—starting dead simple, then growing into something that feels like a *radar + inbox + scoreboard*.

## The core concept

A **Share Tracker** that treats every social post as a “shipping artifact” with:

* **Proof you posted** (and where)
* **A canonical link** back to the post
* **Performance pulse** over time
* **Speaker relationship status** (followed / not followed)
* Eventually: **organic mentions** of TarotTALKS.app you didn’t post

Think: “SHIP LOG, but for social.”

---

## MVP experience

### Primary jobs-to-be-done

1. “I shipped a post—log it fast.”
2. “Find that post later.”
3. “Know what’s working without opening 5 tabs.”

### MVP data you track (per post)

* Platform (X / Bluesky / etc.)
* Date/time
* What you shared (Card page / Talk page / both)
* Post URL
* Speaker(s) referenced (optional, but helpful)
* Status: Draft → Posted → Verified

### MVP user flow

**Flow A: Log a post in under 15 seconds**

1. Click **“New Share”**
2. Pick platform (X / Bluesky)
3. Paste the post URL
4. Auto-detect TarotTALKS.app links inside it (or you can paste the TarotTALKS link too)
5. Save → it lands in **Today’s Log**

**Flow B: Your daily loop**

* Open tracker → see **Today / This Week**
* Each post is a card with:

  * platform icon
  * title (card name + talk title)
  * post URL
  * “notes” (optional)
  * (later) quick metrics snapshot

---

## Bonus layer 1: Performance metrics (likes, reposts, replies)

### What it feels like

Each logged post becomes a little “plant” you can watch grow:

* “Since posted: +12 likes, +3 reposts, +2 replies”
* A tiny sparkline or “momentum” indicator (up / flat / down)

### User flow

**Flow C: Check performance without doomscrolling**

1. Open **Dashboard**
2. See:

   * Top posts this week
   * Posts with “unanswered replies”
   * Posts gaining momentum
3. Click any post → open details → open post on platform (if you want)

---

## Bonus layer 2: “Is @tarottalks following the speaker?”

### What it feels like

On each Share record:

* Speaker handle(s) detected
* A simple badge:

  * ✅ Following
  * ➕ Not following (button: “Follow checklist”)
  * ❓ Unknown (needs handle)

### User flow

**Flow D: Relationship hygiene**

1. In the post details, you see speaker handle(s)
2. If not followed, it flags it
3. You optionally keep a small “to-follow” queue

(You’re not automating following here—just making it visible and easy to act on.)

---

## The “eventual” evolution: Social Mention Radar

This is the part that makes it feel magical.

### What it does

It continuously gathers:

* Posts you made (tracked)
* Posts others made that include:

  * `tarottalks.app` links
  * or “TarotTALKS” mentions
  * or specific card/talk slugs

### What it feels like

An **Engagement Inbox**:

* “Someone shared your link”
* “Someone replied to a thread you started”
* “Someone quoted your post”
* “Someone mentioned TarotTALKS without linking”

### User flow

**Flow E: Triage engagement like an inbox**

1. Open **Mentions**
2. Filter by:

   * Platform
   * Link type (talk / card / homepage)
   * “Needs reply”
   * “High signal” (lots of engagement)
3. Click an item:

   * See context
   * Quick actions:

     * “Reply” (opens platform)
     * “Log as Highlight”
     * “Add to Speaker Relationship notes”

---

## The product shape (screens you’d likely have)

1. **Dashboard**

* This week’s posts
* Top performers
* Momentum
* “Needs attention” (replies, mentions, not-following)

2. **New Share**

* fast logging form

3. **Share Log**

* chronological list + filters

4. **Share Detail**

* post URL
* tarot links included
* speaker handles + follow status
* notes
* metrics (if enabled)

5. **Mentions (Radar Inbox)**

* all organic links/mentions
* triage + filters

---

## A simple “ladder” to build it without overwhelm

* **Phase 1:** Manual tracker (posted? link? notes?) — frictionless logging
* **Phase 2:** Metrics pulse — performance snapshots + “top this week”
* **Phase 3:** Speaker relationship badges — follow hygiene + handle capture
* **Phase 4:** Mention radar — discover organic sharing and replies

---

If you want a punchy name for it inside TarotTALKS admin:
**“Signal Deck”** (your shares are cards; your mentions are draws; your engagement is the reading).
