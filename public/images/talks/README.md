# Talk Thumbnails

This directory stores locally-hosted thumbnails for TED talks.

## Why Local Storage?

- **Prevents broken links** - External URLs can change or be removed
- **Faster loading** - Images are served from the same domain
- **Full control** - No reliance on third-party CDNs

## File Naming

Images are named using the talk's database ID:
- `{talk-id}.jpg`
- `{talk-id}.png`
- `{talk-id}.webp`

## Automatic Download

When creating or updating talks via the admin portal:
1. If a thumbnail URL starts with `http://` or `https://`, it's automatically downloaded
2. The file is saved here with the talk's ID as the filename
3. The database is updated to point to the local path (`/images/talks/{filename}`)

## Manual Migration

To download all existing external thumbnails:

```bash
npx tsx scripts/download-talk-thumbnails.ts
```

This script will:
- Find all talks with external thumbnail URLs
- Download each image to this directory
- Update the database with local paths
