const videoContainer = document.querySelector(".container");
const videoTopics = [
  "sports",
  "programming",
  "music",
  "dance",
  "education",
  "esport",
  "cricket",
  "football",
  "bike",
  "race",
];
const maxVideos = 1;
const players = [];

async function fetchData(topic) {
  try {
    const response = await fetch(`/api/youtube?type=search&query=${topic}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();

    // More comprehensive response validation
    if (!data || typeof data !== "object") {
      throw new Error("Invalid API response format");
    }

    if (data.error) {
      throw new Error(data.error.message || "YouTube API error");
    }

    if (!Array.isArray(data.items)) {
      throw new Error("Expected items array in response");
    }

    // Skip if no items instead of throwing error
    if (data.items.length === 0) {
      console.warn(`No videos found for topic: ${topic}`);
      return;
    }

    // Process each video
    for (const video of data.items) {
      try {
        await createCard(video, topic, data.items.indexOf(video));
      } catch (cardError) {
        console.error("Error creating card for video:", video, cardError);
        // Continue with next video even if one fails
      }
    }
  } catch (error) {
    console.error(`Error fetching data for topic ${topic}:`, error);
    // Show user-friendly error message
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = `Could not load videos for ${topic}. Please try again later.`;
    videoContainer.appendChild(errorElement);
  }
}

async function createCard(video, topic, index) {
  try {
    const videoId = video.id?.videoId;
    if (!videoId) {
      console.warn("Missing videoId for topic:", topic);
      return;
    }

    const playerId = `player-${topic}-${index}`;

    // Fetch video details
    const videoResponse = await fetch(
      `/api/youtube?type=video&videoId=${videoId}`
    );
    if (!videoResponse.ok) throw new Error("Failed to fetch video details");

    const videoData = await videoResponse.json();
    if (!videoData?.items?.[0]?.snippet) {
      throw new Error("Invalid video data structure");
    }

    const channelId = videoData.items[0].snippet.channelId;

    // Fetch channel details
    const channelResponse = await fetch(
      `/api/youtube?type=channel&channelId=${channelId}`
    );
    if (!channelResponse.ok) throw new Error("Failed to fetch channel details");

    const channelData = await channelResponse.json();
    if (!channelData?.items?.[0]?.snippet) {
      throw new Error("Invalid channel data structure");
    }

    const channelProfile =
      channelData.items[0].snippet.thumbnails?.default?.url ||
      "./images/default-profile.jpg";

    const card = document.createElement("div");
    card.className = "card";
    card.addEventListener("click", () => {
      redirectPlayVideoPage(videoId);
    });

    card.innerHTML = `
      <div class="video-preview">
        <img class="video-thumb" src="${
          videoData.items[0].snippet.thumbnails?.high?.url ||
          "./images/default-thumbnail.jpg"
        }" alt="" />
        <div id="${playerId}" class="video-iframe"></div>
        <div class="iframe-overlay"></div>
      </div>
      <div class="description">
        <div class="profile">
          <img src="${channelProfile}" alt="" />
        </div>
        <div class="video-info">
          <span class="video-title">${
            video.snippet.title || "Untitled Video"
          }</span>
          <span class="channel-name">${
            video.snippet.channelTitle || "Unknown Channel"
          }</span>
          <div class="views-time">
            <span class="views">
              ${formatViewLikeCount(
                videoData.items[0].statistics?.viewCount || 0
              )} views
            </span>
            <span>&middot;</span>
            <span class="time">${formatPublishedDate(
              videoData.items[0].snippet.publishedAt
            )}</span> 
          </div>
        </div>
      </div>
    `;

    const profileLink = card.querySelectorAll(".profile, .channel-name");
    profileLink.forEach((elem) => {
      elem.addEventListener("click", (e) => {
        e.stopPropagation();
        redirectToChannelProfile(channelId);
      });
    });

    videoContainer.appendChild(card);

    const iframe = card.querySelector(".video-iframe");
    iframe.addEventListener("click", (e) => {
      e.stopPropagation();
      redirectPlayVideoPage(videoId);
    });

    setTimeout(() => {
      const player = new YT.Player(playerId, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          controls: 0,
          mute: 1,
          modestbranding: 0,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      players.push({ card, player });

      function onPlayerReady(event) {
        event.target.pauseVideo();
        card.addEventListener("mouseenter", () => player.playVideo());
        card.addEventListener("mouseleave", () => player.pauseVideo());
      }

      function onPlayerStateChange() {}
    }, 500);
  } catch (err) {
    console.error("Failed to create card for video:", video, err);
  }
}

function redirectPlayVideoPage(videoId) {
  window.location.href = `PlayVideo.html?videoId=${videoId}`;
}

function redirectToChannelProfile(channelId) {
  window.location.href = `channelProfile.html?channelId=${channelId}`;
}

function formatViewLikeCount(count) {
  if (typeof count === "string") count = parseInt(count);
  if (isNaN(count)) return "0";

  if (count >= 1e9) return (count / 1e9).toFixed(1) + "B";
  if (count >= 1e6) return (count / 1e6).toFixed(1) + "M";
  if (count >= 1e3) return (count / 1e3).toFixed(1) + "k";
  return count.toString();
}

function formatPublishedDate(date) {
  if (!date) return "Unknown time";

  const publishedDate = new Date(date);
  if (isNaN(publishedDate.getTime())) return "Unknown time";

  const now = new Date();
  const diff = now - publishedDate;

  const sec = diff / 1000;
  const min = sec / 60;
  const hrs = min / 60;
  const day = hrs / 24;
  const month = day / 30;
  const year = month / 12;

  if (year >= 1)
    return Math.floor(year) + " year" + (year >= 2 ? "s" : "") + " ago";

  if (month >= 1)
    return Math.floor(month) + " month" + (month >= 2 ? "s" : "") + " ago";

  if (day >= 1)
    return Math.floor(day) + " day" + (day >= 2 ? "s" : "") + " ago";

  if (hrs >= 1)
    return Math.floor(hrs) + " hour" + (hrs >= 2 ? "s" : "") + " ago";

  if (min >= 1)
    return Math.floor(min) + " minute" + (min >= 2 ? "s" : "") + " ago";

  return "Just now";
}

// UI Event Handlers (keep the existing ones)
const createBtn = document.querySelector(".create");
const createPopUp = document.querySelector(".create-popUP");
const bell = document.querySelector(".bell");
const notificationBox = document.querySelector(".notification");
const hamburgarIcon = document.querySelector(".menu");
const sideBar = document.querySelector("aside");
const mainArea = document.querySelector("main");
const sideBarContainer = document.querySelector(".sidebar");

createBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  createPopUp.classList.toggle("show");
  notificationBox.classList.remove("show");
});

document.getElementById("upload").addEventListener("click", (e) => {
  e.stopPropagation();
  createPopUp.classList.toggle("show");
  notificationBox.classList.remove("show");
});

bell.addEventListener("click", (e) => {
  e.stopPropagation();
  notificationBox.classList.toggle("show");
  createPopUp.classList.remove("show");
});

document.addEventListener("click", () => {
  createPopUp.classList.remove("show");
  notificationBox.classList.remove("show");
});

hamburgarIcon.addEventListener("click", () => {
  const width = window.innerWidth;

  if (width <= 800) {
    sideBar.classList.toggle("show");
    sideBarContainer.classList.toggle("showContainer");
  } else if (width <= 1270) {
    sideBar.classList.toggle("expanded");
    sideBarContainer.classList.toggle("showContainer");
  } else {
    sideBar.classList.toggle("collaspe");

    if (sideBar.classList.contains("collaspe")) {
      mainArea.style.marginLeft = "72px";
    } else {
      mainArea.style.marginLeft = "215px";
    }
  }
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;

  if (width <= 800) {
    mainArea.style.marginLeft = "0px";
  } else if (width <= 1270) {
    mainArea.style.marginLeft = "72px";
  } else {
    if (sideBar.classList.contains("collaspe")) {
      mainArea.style.marginLeft = "72px";
    } else {
      mainArea.style.marginLeft = "215px";
    }
  }
});

sideBarContainer.addEventListener("click", () => {
  sideBar.classList.remove("show");
  sideBarContainer.classList.remove("showContainer");
});

document.getElementById("search-icon2").addEventListener("click", () => {
  document.querySelector(".navBar").classList.toggle("center");
  document.querySelector(".back").style.display = "block";
  document.querySelector(".nav-middle").classList.toggle("middle");

  document.querySelector(".search").classList.toggle("show");
  document.querySelector(".nav-left").style.display = "none";
  document.querySelector(".nav-right").style.display = "none";
  document.getElementById("search-icon2").classList.toggle("hide");
});

document.querySelector(".back").addEventListener("click", () => {
  document.querySelector(".navBar").classList.toggle("center");
  document.querySelector(".back").style.display = "none";
  document.querySelector(".nav-middle").classList.toggle("middle");

  document.querySelector(".search").classList.toggle("show");
  document.querySelector(".nav-left").style.display = "flex";
  document.querySelector(".nav-right").style.display = "flex";
  document.getElementById("search-icon2").classList.toggle("hide");
});

function loadYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.onYouTubeIframeAPIReady = async () => {
  for (const topic of videoTopics) {
    await fetchData(topic);
    await delay(1000); // Add delay between requests to avoid rate limiting
  }
};

loadYouTubeAPI();
