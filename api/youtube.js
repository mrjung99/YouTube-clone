exports.handler = async (event) => {
  const { type, videoId, channelId, query } = event.queryStringParameters;
  const API_KEYS = [
    process.env.YOUTUBE_API_KEY1,
    process.env.YOUTUBE_API_KEY2,
  ].filter(Boolean);

  let lastError = null;

  for (const API_KEY of API_KEYS) {
    try {
      let apiUrl;

      // Validate required parameters
      if (
        (type === "video" && !videoId) ||
        (type === "channel" && !channelId) ||
        (type === "search" && !query)
      ) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required parameters" }),
        };
      }

      switch (type) {
        case "video":
          apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics,status`;
          break;
        case "channel":
          apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,status&id=${channelId}&key=${API_KEY}`;
          break;
        case "search":
          apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
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

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data.error) {
        if (data.error.errors[0].reason === "quotaExceeded") {
          throw new Error("Quota exceeded");
        }
        throw new Error(data.error.message);
      }

      // Validate response structure
      if (!data.items) {
        throw new Error("Invalid API response structure");
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
      console.error(
        `API Key ${API_KEY?.substring(0, 5)}... failed:`,
        error.message
      );
      // Continue to next API key
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
