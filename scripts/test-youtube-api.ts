/**
 * Test script to verify YouTube API key is working
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY not found in environment variables');
  console.error('Please add YOUTUBE_API_KEY to your .env.local file');
  process.exit(1);
}

async function testYouTubeAPI() {
  console.log('🔍 Testing YouTube API connection...\n');

  // Test with a known TED talk video ID
  const testVideoId = 'cRC0Kvrn93Q'; // Charlie Mackesy talk
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${testVideoId}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ YouTube API Error:', data.error.message);
      console.error('Status:', data.error.status);
      console.error('\nPlease check:');
      console.error('1. API key is correct in .env.local');
      console.error('2. YouTube Data API v3 is enabled in Google Cloud Console');
      console.error('3. API key restrictions allow YouTube Data API v3');
      process.exit(1);
    }

    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      console.log('✅ YouTube API is working!\n');
      console.log('Test Video:');
      console.log('  Title:', video.snippet.title);
      console.log('  Channel:', video.snippet.channelTitle);
      console.log('  Duration:', video.contentDetails.duration);
      console.log('  Published:', video.snippet.publishedAt.split('T')[0]);
      console.log('\n✨ API key is valid and ready to use!');
    } else {
      console.error('❌ No video data returned');
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    process.exit(1);
  }
}

testYouTubeAPI();
