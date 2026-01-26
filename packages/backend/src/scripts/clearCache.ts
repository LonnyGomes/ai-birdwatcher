/**
 * Clear OpenAI cache via HTTP API
 *
 * This script clears the in-memory OpenAI cache in the running backend server.
 * Useful when reprocessing videos to ensure fresh API calls instead of cached results.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function clearCache() {
  try {
    console.log('Attempting to clear OpenAI cache...\n');

    const response = await fetch(`${BACKEND_URL}/api/admin/clear-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to clear cache: ${response.status} ${response.statusText}`);
      console.log('\nNote: The /api/admin/clear-cache endpoint may not exist yet.');
      console.log('You need to restart the backend to clear the cache.');
      process.exit(1);
    }

    const result = await response.json();
    console.log('✓ Cache cleared successfully!');
    console.log(`  Previous cache size: ${result.cacheSize || 0} entries\n`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    console.log('\nThe backend may not be running or the endpoint does not exist.');
    console.log('Solution: Restart the backend to clear the in-memory cache.');
    process.exit(1);
  }
}

clearCache();
