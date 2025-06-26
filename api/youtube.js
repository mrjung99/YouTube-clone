exports.handler = async (event) => {
  const { type, videoId, channelId, query } = event.queryStringParameters;

  // Validate required parameters
  if (!type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Type parameter is required" }),
    };
  }

  const API_KEYS = [
    process.env.YOUTUBE_API_KEY1,
    process.env.YOUTUBE_API_KEY2,
  ].filter(Boolean);

  if (API_KEYS.length === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No API keys configured" }),
    };
  }

  let lastError = null;

  for (let API_KEY of API_KEYS) {
    try {
      let apiUrl;

      // Validate parameters based on type
      switch (type) {
        case "video":
          if (!videoId) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error: "videoId is required for video type",
              }),
            };
          }
          apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics,status`;
          break;

        case "channel":
          if (!channelId) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error: "channelId is required for channel type",
              }),
            };
          }
          apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,status&id=${channelId}&key=${API_KEY}`;
          break;

        case "search":
          if (!query) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error: "query is required for search type",
              }),
            };
          }
          apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=2&q=${encodeURIComponent(
            query
          )}&key=${API_KEY}`;
          break;

        default:
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request type" }),
          };
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      // Check for API errors
      if (data.error) {
        if (
          data.error.errors &&
          data.error.errors[0].reason === "quotaExceeded"
        ) {
          throw new Error("Quota exceeded");
        }
        throw new Error(data.error.message || "YouTube API error");
      }

      // Validate response structure
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid data structure from YouTube API");
      }

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
    } catch (error) {
      lastError = error;
      console.log(
        `Failed with API key ${API_KEY.slice(0, 5)}...: ${error.message}`
      );
    }
  }

  return {
    statusCode: 503,
    body: JSON.stringify({
      error: "All API keys exhausted",
      details: lastError?.message,
    }),
  };
};
