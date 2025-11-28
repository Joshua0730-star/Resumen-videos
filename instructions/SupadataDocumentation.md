# Introduction

> Welcome to the Supadata documentation. Our API provides powerful tools for extracting web content.

## Overview

Supadata offers three main services:

- Video Transcripts - Extract transcripts from YouTube, TikTok, Instagram, Facebook, X (Twitter) and video files
- Media Metadata - Get social media post data like title, author and engagement metrics
- Web Reader - Extract content from any website, crawl pages and extract structured data
- YouTube Metadata - Extract video, channel and playlist metadata

## Getting an API Key

All requests to Supadata require authentication using an API key. The same key also works with the SDKs and no-code integrations. To get your API key:

1. Sign up for an account at [dash.supadata.ai](https://dash.supadata.ai)
2. Your API key will be generated automatically during onboarding and available in the dashboard

## Integrations and SDKs

This documentation provides examples for how to use the Supadata API and its various parameters.

We also offer the following SDKs and integrations:

- [JavaScript SDK](https://github.com/supadata-ai/js)
- [Python SDK](https://github.com/supadata-ai/py)
- [n8n](/integrations/n8n)
- [Make](/integrations/make)
- [Zapier](/integrations/zapier)
- [Active Pieces](/integrations/activepieces)
- [MCP](/integrations/mcp)

## Documentation for AI

If you're working with an AI assistant or vibe coding, we recommend using the "Copy Page" dropdown in top right corner of each page to get AI-ready documentation. Alternatively, give your assistant links to [llms.txt](/llms.txt) or [llms-full.txt](/llms-full.txt).

## Rate Limits

API requests are rate-limited based on your subscription plan. Current limits are shown on the [pricing page](https://supadata.ai/pricing).

It is possible to increase rate limits upon request.

## API Usage

### Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```bash theme={null}
curl -H "x-api-key: YOUR_API_KEY" https://api.supadata.ai/v1/...
```

<Warning>
  Never share your API key or commit it to version control. Use environment
  variables to store your API key securely. Only access the API from a secure
  server environment.
</Warning>

### Base URL

All API endpoints use the following base URL:

`https://api.supadata.ai/v1`

### Response Format

All API responses are returned in JSON format.

# Community Resources

The Supadata community has created various resources and guides for using Supadata. [You can find them here](/community-resources).

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.supadata.ai/llms.txt

# Transcript

> Use this API endpoint to fetch text transcript from a video hosted on YouTube, TikTok, Instagram, X (Twitter), Facebook or a public file URL. Supadata will fetch existing transcript or fall back to AI to create one.

## Quick Start

### Request

<CodeGroup>
  ```js Node theme={null}
  import { Supadata } from "@supadata/js";

// Initialize the client
const supadata = new Supadata({
apiKey: "YOUR_API_KEY",
});

// Get transcript from any supported platform (YouTube, TikTok, Instagram, X (Twitter)) or file
const transcriptResult = await supadata.transcript({
url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
lang: "en", // optional
text: true, // optional: return plain text instead of timestamped chunks
mode: "auto", // optional: 'native', 'auto', or 'generate'
});

````

```python Python theme={null}
from supadata import Supadata, SupadataError

# Initialize the client
supadata = Supadata(api_key="YOUR_API_KEY")

transcript = supadata.transcript(
    url="https://x.com/SpaceX/status/1481651037291225113",
    lang="en",  # Optional: preferred language
    text=True,  # Optional: return plain text instead of timestamped chunks
    mode="auto"  # Optional: "native", "auto", or "generate"
)
````

```bash cURL theme={null}
curl -X GET 'https://api.supadata.ai/v1/transcript?url=https://youtu.be/dQw4w9WgXcQ' \
  -H 'x-api-key: YOUR_API_KEY'
```

</CodeGroup>

### Response

```json theme={null}
{
  "content": "Never gonna give you up, never gonna let you down...",
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

## Specification

### Endpoint

`GET https://api.supadata.ai/v1/transcript`

Each request requires an `x-api-key` header with your API key available after signing up. Get your API key [here](https://dash.supadata.ai/organizations/api-key).

### Query Parameters

| Parameter | Type    | Required | Description                                                                                                                                                                                                                                    |
| --------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url       | string  | Yes      | URL of the video to get transcript from. Must be either YouTube, TikTok, Instagram, X (Twitter), Facebook or a public file URL. It is recommended to encode the URL before sending it as a query parameter.                                    |
| lang      | string  | No       | Preferred language code of the transcript (ISO 639-1). See [Languages](#languages).                                                                                                                                                            |
| text      | boolean | No       | When true, returns plain text transcript. Default: false                                                                                                                                                                                       |
| chunkSize | number  | No       | Maximum characters per transcript chunk (only when text=false)                                                                                                                                                                                 |
| mode      | string  | No       | Transcript mode: `native` (only fetch existing transcript), `generate` (always generate transcript using AI), or `auto` (try native, fallback to generate if unavailable). If `url` is a file URL, mode is always `generate`. Default: `auto`. |

<Info>
  To fetch only existing transcripts and avoid costs tied to AI generation, use
  `mode=native`. See <a href="#pricing">Pricing</a> for details.
</Info>

### Response Format

The API can return either a transcript result directly (HTTP 200) or a job ID for asynchronous processing (HTTP 202).

<Info>
  For large videos that require processing time, the API returns HTTP 202 with a
  job ID. Use the `/transcript/{jobId}` endpoint to poll for results.
</Info>

**Immediate transcript response (HTTP 200):**

When `text=true`:

```typescript theme={null}
{
  "content": string,
  "lang": string             // ISO 639-1 language code
  "availableLangs": string[] // List of available languages
}
```

When `text=false`:

```typescript theme={null}
{
  "content": [
    {
      "text": string,        // Transcript segment
      "offset": number,      // Start time in milliseconds
      "duration": number,    // Duration in milliseconds
      "lang": string         // ISO 639-1 language code of chunk
    }
  ],
  "lang": string             // ISO 639-1 language code of transcript
  "availableLangs": string[] // List of available languages
}
```

**Asynchronous job response (HTTP 202):**

```typescript theme={null}
{
  "jobId": string // Job ID for checking results
}
```

### Getting Job Results

When the API returns a job ID, you can poll for results using the job ID endpoint:

<CodeGroup>
  ```js Node theme={null}
  import { Supadata } from "@supadata/js";

// Check if we got a transcript directly or a job ID for async processing
if ("jobId" in transcriptResult) {
// For large files, we get a job ID and need to poll for results
const jobResult = await supadata.transcript.getJobStatus(
transcriptResult.jobId
);
if (jobResult.status === "completed") {
console.log(jobResult.content);
} else if (jobResult.status === "failed") {
console.error(jobResult.error);
} else {
console.log("Job status:", jobResult.status);
}
} else {
// For smaller files or native transcripts, we get the result directly
console.log("Transcript:", transcriptResult);
}

````

```python Python theme={null}
# For immediate results
if hasattr(transcript, 'content'):
    print(f"Transcript: {transcript.content}")
    print(f"Language: {transcript.lang}")
else:
    # For async processing (large files)
    print(f"Processing started with job ID: {transcript.job_id}")
    # Poll for results using existing batch.get_batch_results method
````

```bash cURL theme={null}
curl -X GET 'https://api.supadata.ai/v1/transcript/123e4567-e89b-12d3-a456-426614174000' \
  -H 'x-api-key: YOUR_API_KEY'
```

</CodeGroup>

#### Response

```json theme={null}
{
  "status": "completed",
  "content": "Never gonna give you up, never gonna let you down...",
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

#### Job Status Values

| Status    | Description                                     |
| --------- | ----------------------------------------------- |
| queued    | The job is in the queue waiting to be processed |
| active    | The job is currently being processed            |
| completed | The job has finished and results are available  |
| failed    | The job failed due to an error                  |

<Callout type="info">
  Poll the job status endpoint until the status is either "completed" or
  "failed". The `result` field will contain the transcript data when status is
  "completed", or the `error` field will contain error details when status is
  "failed".
</Callout>

### Error Codes

The API returns HTTP status codes and error codes. See this [page](/errors) for more details.

### Supported URL Formats

`url` parameter supports the following:

- YouTube video URL, e.g. `https://www.youtube.com/watch?v=1234567890`
- TikTok video URL, e.g. `https://www.tiktok.com/@username/video/1234567890`
- X (Twitter) video URL, e.g. `https://x.com/username/status/1234567890`
- Instagram video URL, e.g. `https://instagram.com/reel/1234567890/`
- Facebook video URL, e.g.`https://www.facebook.com/reel/682865820350105/`
- Publicly accessible file URL, e.g. `https://bucket.s3.eu-north-1.amazonaws.com/file.mp4`

### File Transcripts

When `url` is a file URL, the endpoint supports the following file formats:

- MP4
- WEBM
- MP3
- FLAC
- MPEG
- M4A
- OGG
- WAV

The maximum file size is 1 GB. There is no limit on the video duration.

## Languages

The endpoint supports multiple languages. The `lang` parameter is used to specify the preferred language of the transcript. If the video does not have a transcript in the preferred language, the endpoint will return a transcript in the first available language and a list of other available languages. It is then possible to make another request to get the transcript in your chosen fallback language.

When `mode = generate`, the `lang` parameter is ignored and the transcript is generated in the language of the video.

## Latency

Requests for existing transcripts (eg. in `mode=native`) are resolved at normal latency. Requests that involve AI generation (eg. in `mode=generate`) can take up to 60s if they do not return an asynchronous job ID earlier. Long videos and large files take longer to transcribe.

Please consider this when implementing time-outs and UX in your project.

## Pricing

- 1 existing transcript = 1 credit
- 1 generated transcript minute = 2 credits

### Examples

| Case                                     | Mode       | What happens                           | Credits consumed               |
| ---------------------------------------- | ---------- | -------------------------------------- | ------------------------------ |
| YouTube video without any transcript     | `auto`     | Supadata generates transcript with AI  | 2 per min of video             |
| Instagram video                          | `native`   | No transcript available response (206) | 1                              |
| Instagram video with existing transcript | `auto`     | Supadata returns existing transcript   | 1                              |
| TikTok video                             | `generate` | Supadata generates transcript with AI  | 2 per min of video (usually 2) |

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.supadata.ai/llms.txt
