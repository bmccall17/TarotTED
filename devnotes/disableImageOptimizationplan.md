below are SUGGESTIONS from my senior dev, please review and let them inform your plan.
goal: ensure that this application is NOT going to push over pay thresholds. the plan needs to be optimized for 0$ costs

from Vercel's AI assistant:
## To Reduce Usage:
Use static image imports where possible instead of dynamic optimization
Implement caching strategies to reduce redundant optimization requests
Consider pre-optimizing images before deployment
Limit the number of image variants/sizes being generated

ref file: https://vercel.com/docs/image-optimization/managing-image-optimization-costs

Best path to keep cost at $0 (do this in order)

Step A — Reduce how many different widths you generate (biggest win)
In `next.config.ts`, shrink `deviceSizes` and `imageSizes` so Next generates fewer variants. Vercel themselves recommend limiting variants as a primary cost-control lever (and managing cache behavior). 
A reasonable “TarotTALKS is mostly-mobile” set:
  `deviceSizes`: [360, 640, 1080]
  `imageSizes` (for small UI thumbs): [64, 96, 128, 256]
This alone usually cuts variants dramatically.

Step B — Increase cache TTL to avoid “STALE → rewrite”
	Set `minimumCacheTTL` to ~30–31 days.
This reduces re-generation when upstream cache headers are weak. Vercel explicitly calls out raising cache max-age / using long caching to reduce transformations + writes. 

Step C — Tighten `sizes` everywhere you use <Image>
This is the silent killer.
If you have thumbnails that visually render at (say) ~96px wide but your `sizes` implies responsive widths, the browser will request multiple `w=` values across breakpoints — each becomes a new cached variant.
Rules of thumb:
	Fixed-size thumbnails: use `sizes="96px"` (or whatever it is)
	Grid cards: use a real `sizes` like (`max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px`
This reduces the number of unique `w=` values created.

Step D — Stop optimizing the high-volume images
For TarotTALKS, the most numerous images are usually:
	talk thumbnails in lists
	card thumbnails in grids
	tiny “mapped” thumbnails in admin tables

Those are perfect candidates to skip Next optimization and use:
	<Image unoptimized ... /> for those specific components, or
	plain <img loading="lazy"> for tiny thumbs
This removes them from `/_next/image` entirely → no Vercel cache writes for those.

Keep optimization only for:
	the hero image on a card detail page
	maybe the featured talk banner

Step E — Reduce output size so each write uses fewer “8KB units”
Because writes are billed/limited in 8KB units, smaller outputs directly reduce write usage. 
Vercel

You can do that by:
	lowering the largest allowed widths (Step A)
	ensuring you’re not producing desktop-sized variants unnecessarily
	optionally using quality={70} (or similar) on the biggest images

What I would do for TarotTALKS (concrete recommendation)
Implement Step A + Step B immediately (fast, low risk).
Add/verify sizes on every <Image> used in grids/lists (this is often the real source of variant explosion).
Mark thumbnails as unoptimized (or switch them to <img>) in:
	talks list rows
	cards grid tiles
	any “mapped thumbnails” UI

This combo is usually enough to pull you well under 100k writes/month on Hobby.