// const API_KEY = "AIzaSyC0wc41xZbw0CaaYUmwKvP0C-NHe2_FTY8";

//CODE ADDICT NEPAL
const API_KEY = "AIzaSyBPaEISoAhz0kwRrEoTU4XtSlZIUFjoAVs";

const videoContainer = document.querySelector(".container");
const videoTopics = ["sports"];
const maxVideos = 2;
const players = [];

async function fetchData(topic) {
  const searchVideoUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxVideos}&q=${topic}&type=video&key=${API_KEY}`;
  try {
    const response = await fetch(searchVideoUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    data.items.forEach((video, index) => {
      createCard(video, topic, index);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//create video card with unque id
async function createCard(video, topic, index) {
  const videoId = video.id.videoId;
  const playerId = `player-${topic}-${index}`;

  //this will fetch the details about video
  const searchContentDetailUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics,status`;
  const response = await fetch(searchContentDetailUrl);
  const data = await response.json();
  const channelId = data.items[0].snippet.channelId;

  //this fetch the details about channel
  const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
  const channel = await fetch(channelInfoUrl);
  const channelData = await channel.json();

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
  if (likeCount >= 1e9) return (likeCount / 139).toFixed(1) + "B";
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

function loadYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// This gets called by the YouTube API once it's loaded
window.onYouTubeIframeAPIReady = function () {
  console.log("YouTube API is ready.");
  videoTopics.forEach((topic) => {
    fetchData(topic);
  });
};

loadYouTubeAPI();
