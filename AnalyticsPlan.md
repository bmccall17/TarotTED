 Analytics Implementation Plan for TarotTED (v3.1)

 # Overview

### Add Vercel Web Analytics for automatic page view tracking only (Hobby plan constraint: no custom events).

 What you'll get:
 - Page views per route (cards, talks, themes, search, home)
 - Top pages, referrers, countries, devices, browsers
 - Real-time and historical data
 - Web Vitals via Speed Insights (already enabled)

 What you WON'T get (Hobby plan limitation):
 - Custom event tracking (draw_card clicks, search submissions, etc.)
 - See "Future Consideration" section for upgrade path

 ---
 Implementation Steps

 ## Step 1: dependencies DONE
 both of these have been enabled on Vercel and manually installed locally using:
  `npm i @vercel/speed-insights`
  `npm i @vercel/analytics`


 ---
 ## Step 2: Create Public-Only Analytics Wrapper

 File: components/analytics/AnalyticsProvider.tsx (NEW)

 Since app/layout.tsx is a Server Component and we can't pass functions to client components, create a dedicated client wrapper:

 'use client'

 import { Analytics } from '@vercel/analytics/react'
 import { usePathname } from 'next/navigation'

 export function AnalyticsProvider() {
   const pathname = usePathname()

   // Don't render Analytics on admin routes at all
   if (pathname?.startsWith('/admin')) {
     return null
   }

   return <Analytics />
 }

 Why this approach?
 - Avoids the "functions cannot be passed to Client Components" error
 - Completely excludes admin routes from Analytics (no events sent at all)
 - Clean separation of concerns

 ---
 ## Step 3: Add Provider to Root Layout

 File: app/layout.tsx

 import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
 import { SpeedInsights } from '@vercel/speed-insights/next'

 export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
     <html lang="en">
       <body className="...">
         {children}
         <BottomNav />
         <AnalyticsProvider />
         <SpeedInsights />
       </body>
     </html>
   )
 }

 ---
 ## Step 4: Verify Admin Exclusion (Defense in Depth)

 The AnalyticsProvider already excludes admin routes. For extra safety, also verify /admin/layout.tsx does NOT
 import or include any analytics.

 Current admin layout should remain analytics-free (it already is).

 ---
 Files to Create/Modify

 | File                                       | Action                                           |
 |--------------------------------------------|--------------------------------------------------|
 | package.json                               | Add @vercel/analytics                            |
 | components/analytics/AnalyticsProvider.tsx | NEW - Client wrapper with admin exclusion        |
 | app/layout.tsx                             | Import and add AnalyticsProvider + SpeedInsights |

 Total: 3 files (1 new, 2 modified)

 ---
 
 ## What You'll See in Vercel Dashboard

 After deployment:

 1. Analytics Tab:
   - Page views by route (/cards/the-fool, /talks/vulnerability, etc.)
   - Unique visitors (daily hash - resets each day, not long-term tracking)
   - Top referrers, countries, devices, browsers
   - Real-time visitors
 2. Speed Insights Tab:
   - Core Web Vitals (LCP, FID, CLS)
   - Performance by route

 ---
 Limitations to Know

 | What Vercel Analytics CAN'T tell you  | Workaround                          |
 |---------------------------------------|-------------------------------------|
 | Button clicks (Draw Card, etc.)       | Upgrade to Pro for custom events    |
 | Search queries or filters used        | Upgrade to Pro                      |
 | Which specific talks are clicked most | Infer from /talks/[slug] page views |
 | Long-term user retention              | Not possible (daily hash resets)    |
 | Conversion funnels                    | Upgrade to Pro or use external tool |

 ---
## Verification Checklist

 After deployment:

 - Visit several public pages (/, /cards, /talks/some-talk)
 - Check Vercel Dashboard → Analytics tab shows page views
 - Visit /admin pages
 - Confirm NO admin page views appear in Analytics
 - Check Speed Insights tab shows Web Vitals

