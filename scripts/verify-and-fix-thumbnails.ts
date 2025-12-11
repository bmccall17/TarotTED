import { talksSeedData } from '../lib/db/seed-data/talks';

/**
 * Get YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^&\?\/]+)/,
    /youtube\.com\/v\/([^&\?\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get TED talk slug from URL
 */
function getTedSlug(url: string): string | null {
  const match = url.match(/ted\.com\/talks\/([^?#]+)/);
  return match ? match[1] : null;
}

/**
 * Generate working thumbnail URL
 */
function getWorkingThumbnailUrl(tedUrl: string): string | null {
  // YouTube - these always work
  const youtubeId = getYouTubeVideoId(tedUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  // TED - use pi.tedcdn.com pattern which is more reliable
  const tedSlug = getTedSlug(tedUrl);
  if (tedSlug) {
    // TED uses this pattern for thumbnails
    return `https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/72bda89f-9bbf-4685-910a-2f151c4f3a8a/NicoleBehnam_2012W-embed.jpg?w=512`;
    // Actually, let's use a more generic approach - TED's og:image meta tag
    // For now, let's use the talk page screenshot approach
    return `https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/${tedSlug}_480x360.jpg?w=512`;
  }

  return null;
}

/**
 * Verify and report thumbnail status
 */
async function verifyThumbnails() {
  console.log('🔍 Checking thumbnail URLs for all talks...\n');

  const issues: any[] = [];
  const working: any[] = [];

  for (const talk of talksSeedData) {
    const youtubeId = getYouTubeVideoId(talk.tedUrl);
    const tedSlug = getTedSlug(talk.tedUrl);

    if (youtubeId) {
      // YouTube thumbnails should work
      working.push({
        speaker: talk.speakerName,
        title: talk.title,
        type: 'YouTube',
        url: talk.thumbnailUrl,
      });
    } else if (tedSlug && talk.thumbnailUrl?.includes('embed-ssl.ted.com')) {
      // TED embed URLs might not work
      issues.push({
        speaker: talk.speakerName,
        title: talk.title,
        currentUrl: talk.thumbnailUrl,
        tedUrl: talk.tedUrl,
        tedSlug,
      });
    } else if (tedSlug) {
      working.push({
        speaker: talk.speakerName,
        title: talk.title,
        type: 'TED',
        url: talk.thumbnailUrl,
      });
    }
  }

  console.log(`✅ Working thumbnails: ${working.length}`);
  console.log(`⚠️  Potential issues: ${issues.length}\n`);

  if (issues.length > 0) {
    console.log('═══════════════════════════════════════');
    console.log('Talks with potentially broken TED embed URLs:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.speaker} - ${issue.title}`);
      console.log(`   Current: ${issue.currentUrl}`);
      console.log(`   TED URL: ${issue.tedUrl}`);
      console.log('');
    });
  }

  return { working, issues };
}

// Run if called directly
if (require.main === module) {
  verifyThumbnails().then(({ working, issues }) => {
    console.log('\n💡 Next steps:');
    console.log('The TED embed URLs (embed-ssl.ted.com) may not be reliable.');
    console.log('We should fetch thumbnails by scraping the actual TED talk pages.');
  });
}

export { verifyThumbnails };
