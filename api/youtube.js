const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { type, videoId, channelId, query } = event.queryStringParameters;

  const API_KEYS = [
    process.env.YOUTUBE_API_KEY1,
    process.env.YOUTUBE_API_KEY2,
    process.env.YOUTUBE_API_KEY3,
    process.env.YOUTUBE_API_KEY4,
  ].filter(Boolean);

  let lastError = null;

  for (let API_KEY of API_KEYS) {
    try {
      let apiUrl;

      switch (type) {
        case "video":
          apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics,status`;
          break;

        case "channel":
          apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,status&id=${channelId}&key=${API_KEY}`;
          break;

        case "search":
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

      if (data.error && data.error.errors[0].reason === "quotaExceeded") {
        throw new Error("Quota exceeded");
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

  // ✅ This is now outside the loop, only runs if ALL keys fail
  return {
    statusCode: 503,
    body: JSON.stringify({
      error: "All API keys exhausted",
      details: lastError?.message,
    }),
  };
};
