// const API_KEY = "AIzaSyC0wc41xZbw0CaaYUmwKvP0C-NHe2_FTY8";

//second api key
// const API_KEY = "AIzaSyBPaEISoAhz0kwRrEoTU4XtSlZIUFjoAVs";

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
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid data structure from API");
    }

    // Clear previous content
    // videoContainer.innerHTML = "";

    data.items.forEach((video, index) => {
      createCard(video, topic, index);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//create video card with unque id
async function createCard(video, topic, index) {
  try {
    const videoId = video.id?.videoId;
    if (!videoId) {
      console.warn("Missing videoId for topic:", topic);
      return;
    }

    const playerId = `player-${topic}-${index}`;

    //this will fetch the details about video

    const response = await fetch(`/api/youtube?type=video&videoId=${videoId}`);

    const data = await response.json();

    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Video details not found");
    }

    const channelId = data.items[0].snippet.channelId;

    //this fetch the details about channel
    const channel = await fetch(
      `/api/youtube?type=channel&channelId=${channelId}`
    );
    const channelData = await channel.json();
    if (
      !channelData ||
      !Array.isArray(channelData.items) ||
      channelData.items.length === 0
    ) {
      throw new Error("Channel details not found");
    }

    const channelProfile = channelData.items[0].snippet.thumbnails.default.url;

    const card = document.createElement("div");
    card.className = "card";
    card.addEventListener("click", () => {
      redirectPlayVideoPage(videoId);
    });

    card.innerHTML = `
          <div class="video-preview">
              <img class="video-thumb" src="${
                data.items[0].snippet.thumbnails.high.url
              }" alt="" />
              <div id="${playerId}" class="video-iframe"></div>
              <div class="iframe-overlay"></div>
            </div>
            <div class="description">
              <div class="profile">
                  <img src="${channelProfile}" alt="" />
              </div>
              <div class="video-info">
                <span class="video-title">${video.snippet.title}</span>
                  <span class="channel-name">${video.snippet.channelTitle}
                    </span>
                <div class="views-time">
                  <span class="views">
                  ${formatViewLikeCount(
                    data.items[0].statistics.viewCount
                  )} views
                  </span>
                  <span>&middot;</span>
                  <span class="time">${formatPublishedDate(
                    data.items[0].snippet.publishedAt
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

      console.log(player);

      players.push({ card, player });

      //play pause on hover on card
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

//this will format the like count as 1k,1.5k etc
function formatViewLikeCount(count) {
  const likeCount = Number(count);
  if (likeCount >= 1e9) return (likeCount / 1e9).toFixed(1) + "B";
  if (likeCount >= 1e6) return (likeCount / 1e6).toFixed(1) + "M";
  if (likeCount >= 1e3) return (likeCount / 1e3).toFixed(1) + "k";
}

//this will format the published date as 1day ago, 2months ago, 1year ago etc
function formatPublishedDate(date) {
  const publishedDate = new Date(date);
  const now = new Date();
  const diff = now - publishedDate; //in milliseconds

  const sec = diff / 1000;
  const min = sec / 60;
  const hrs = min / 60;
  const day = hrs / 24;
  const month = day / 30;
  const year = month / 12;

  if (year >= 1)
    return year.toFixed() + " " + "year" + (year >= 2 ? "s" : "") + " " + "ago";

  if (month >= 1)
    return (
      month.toFixed() + " " + "month" + (month >= 2 ? "s" : "") + " " + "ago"
    );

  if (day >= 1)
    return Math.floor(day) + " " + "day" + (day >= 2 ? "s" : "") + " " + "ago";

  if (hrs >= 1)
    return Math.floor(hrs) + " " + "hour" + (hrs >= 2 ? "s" : "") + " " + "ago";

  if (min >= 1)
    return (
      Math.floor(min) + " " + "minute" + (min >= 2 ? "s" : "") + " " + "ago"
    );

  return "Just now";
}

//**************************************************************/

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

// This gets called by the YouTube API once it's loaded
window.onYouTubeIframeAPIReady = async () => {
  for (const topic of videoTopics) {
    await fetchData(topic);
    // await delay(100);
  }
};

loadYouTubeAPI();
