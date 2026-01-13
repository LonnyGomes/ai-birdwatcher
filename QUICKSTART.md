# 🚀 Quick Start Guide

Get the AI Bird Watcher up and running in 5 minutes!

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ FFmpeg installed (`brew install ffmpeg` on macOS)
- ✅ OpenAI API key (get one at https://platform.openai.com)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
# The .env file is already created, just add your OpenAI API key
nano .env  # or use your favorite editor
```

Update these values in `.env`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
JWT_SECRET=your-secure-random-secret-32-chars-minimum
```

## Step 3: Start the Backend

```bash
npm run dev:backend
```

You should see:
```
✓ Database connected: ./data/database.sqlite
✓ Initial schema migration completed
✓ Executed 1 migration(s)
⚠️  Default admin user created with username "admin" and password "admin123"
Job queue started
Starting file watcher on: /watch-folder
File watcher is ready and monitoring for new videos
🚀 Server listening on port 3000
📚 API documentation: http://localhost:3000/api
❤️  Health check: http://localhost:3000/health
✅ AI Bird Watcher Backend is running!
```

## Step 4: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-12T...",
  "uptime": 5.2
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "created_at": "2024-01-12T..."
  }
}
```

Save the token for next requests:
```bash
export TOKEN="your-token-here"
```

### Get Statistics

```bash
curl http://localhost:3000/api/statistics/overview \
  -H "Authorization: Bearer $TOKEN"
```

## Step 5: Process Your First Video

### Option A: Automatic (File Watcher)

Simply drop a video file into the `watch-folder/` directory:

```bash
cp /path/to/bird-video.mp4 watch-folder/
```

The system will automatically:
1. Detect the new file
2. Copy it to uploads
3. Start processing
4. Extract frames
5. Identify birds
6. Match to existing bird profiles
7. Update statistics

Watch the logs to see progress!

### Option B: Manual Upload

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/bird-video.mp4"
```

Response:
```json
{
  "video": {
    "id": 1,
    "filename": "bird-video_1234567890.mp4",
    "status": "pending",
    ...
  },
  "message": "Video uploaded successfully and processing started"
}
```

### Check Processing Status

```bash
curl http://localhost:3000/api/videos/1/status \
  -H "Authorization: Bearer $TOKEN"
```

Response shows progress:
```json
{
  "video": {
    "id": 1,
    "status": "processing",
    ...
  },
  "jobs": [
    {
      "job_type": "frame_extraction",
      "status": "completed",
      "progress": 100
    },
    {
      "job_type": "bird_identification",
      "status": "active",
      "progress": 45
    }
  ],
  "overallProgress": 72
}
```

## Step 6: View Results

### List Sightings

```bash
curl http://localhost:3000/api/sightings \
  -H "Authorization: Bearer $TOKEN"
```

### View Bird Profiles

```bash
curl http://localhost:3000/api/birds \
  -H "Authorization: Bearer $TOKEN"
```

### Get Statistics

```bash
# Overview
curl http://localhost:3000/api/statistics/overview \
  -H "Authorization: Bearer $TOKEN"

# Species frequency
curl http://localhost:3000/api/statistics/species \
  -H "Authorization: Bearer $TOKEN"

# Hourly activity
curl http://localhost:3000/api/statistics/hourly-activity \
  -H "Authorization: Bearer $TOKEN"
```

## What Happens During Processing?

1. **Motion Detection** (10-20s)
   - Analyzes video for bird activity
   - Identifies segments with motion
   - Saves 60-70% of API costs

2. **Frame Extraction** (5-10s per minute of video)
   - Extracts frames at 1 FPS from motion segments
   - Saves to `packages/backend/data/frames/VIDEO_ID/`

3. **AI Identification** (2-3s per frame)
   - Sends frames to GPT-4 Vision
   - Identifies species, gender, confidence
   - Describes unique features
   - Creates sighting records

4. **Visual Similarity Matching** (1-2s per sighting)
   - Compares new birds with existing profiles
   - Uses perceptual hashing for pre-filtering
   - Uses AI for detailed comparison
   - Creates or links to bird profile (e.g., CARDINAL_001)

5. **Statistics Update** (<1s)
   - Updates visit counts
   - Calculates frequency data
   - Ready for frontend display

## Estimated Costs

For a 1-minute video at 1 FPS:

**Without optimization:**
- 60 frames × $0.01 = ~$0.60
- Comparisons: ~$0.30
- **Total: ~$0.90**

**With motion detection:**
- 20 frames × $0.01 = ~$0.20
- Comparisons: ~$0.10
- **Total: ~$0.30**

**Savings: 67%** 🎉

## Troubleshooting

### "OPENAI_API_KEY is required"
- Check your `.env` file has the correct API key
- Restart the backend after updating `.env`

### "FFmpeg not found"
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org
```

### "No birds detected"
- Ensure video has visible birds
- Check video quality (not too dark/blurry)
- Birds should be at least 10% of frame size
- Try a test video with clearly visible birds first

### Database locked
- Only one backend instance should run at a time
- Check for zombie processes: `ps aux | grep node`
- Kill if needed: `pkill -f "tsx watch"`

### Port 3000 already in use
- Change port in `.env`: `PORT=3001`
- Restart the backend

## Next Steps

1. **Change the admin password!**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "your-username", "password": "your-secure-password"}'
   ```

2. **Test with multiple videos** to see bird matching in action

3. **Explore the API** - check out all endpoints at `http://localhost:3000/api`

4. **Monitor logs** to see the processing pipeline in action

5. **Wait for the frontend** (coming soon!) for a beautiful UI

## Support

Need help?
- Check the full README.md
- Review the logs for error details
- Ensure all prerequisites are installed

Happy bird watching! 🐦✨
