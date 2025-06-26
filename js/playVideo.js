let player;
let duration = 0;
let lastVolume = 100;
let seekBar, volumeSlider;
const videosId = getVideoIdFromUrl();

function getVideoIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("videoId");
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: videosId,
    playerVars: {
      controls: 0,
      modestbranding: 0,
      rel: 0,
      showinfo: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  try {
    player.playVideo();
    duration = player.getDuration();
    document.querySelector(".total-duration").textContent =
      formatTime(duration);

    // Setup event listeners
    document
      .querySelector(".player-overlay")
      .addEventListener("click", togglePlayPause);
    document
      .querySelector(".play-pause")
      .addEventListener("click", togglePlayPause);
    document
      .getElementById("volume-icon")
      .addEventListener("click", handleMuteUnmute);

    volumeSlider = document.getElementById("volume-slider");
    volumeSlider.addEventListener("input", handleVolume);

    seekBar = document.getElementById("progress-bar");
    seekBar.addEventListener("input", handleSeek);

    updateSliderFill(volumeSlider);
    updateSliderFill(seekBar);

    document
      .getElementById("full-screen")
      .addEventListener("click", toggleFullScreen);

    document.addEventListener("keydown", (e) => {
      if (e.key === " ") togglePlayPause();
      if (e.key === "ArrowRight")
        player.seekTo(player.getCurrentTime() + 5, true);
      if (e.key === "ArrowLeft")
        player.seekTo(player.getCurrentTime() - 5, true);
    });

    setInterval(updateProgress, 1000);
  } catch (error) {
    console.error("Error initializing player:", error);
  }
}

function onPlayerStateChange(event) {
  // Handle player state changes if needed
}

function togglePlayPause() {
  try {
    const state = player.getPlayerState();
    const overlay = document.querySelector(".player-overlay");
    const btn = document.querySelector(".overlay-play-pause");
    const lowerBtn = document.querySelector(".play-pause");

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      overlay.style.opacity = "1";
      btn.innerHTML = `<i class="fa-solid fa-play"></i>`;
      lowerBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
    } else {
      player.playVideo();
      overlay.style.opacity = "0";
      btn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
      lowerBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    }
  } catch (error) {
    console.error("Error toggling play/pause:", error);
  }
}

function handleMuteUnmute() {
  try {
    const btn = document.getElementById("volume-icon");

    if (player.isMuted()) {
      player.unMute();
      btn.className = "fa-solid fa-volume-low";
      volumeSlider.value = lastVolume;
      player.setVolume(lastVolume);
    } else {
      lastVolume = player.getVolume();
      player.mute();
      btn.className = "fa-solid fa-volume-xmark";
      volumeSlider.value = "0";
    }
  } catch (error) {
    console.error("Error handling mute/unmute:", error);
  }
}

function updateProgress() {
  try {
    const current = player.getCurrentTime();
    document.querySelector(".now").textContent = formatTime(current);
    seekBar.value = (current / duration) * 100;
    updateSliderFill(seekBar);
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}

function handleVolume(e) {
  try {
    const btn = document.getElementById("volume-icon");
    const newVolume = parseInt(e.target.value);

    if (newVolume === 0) {
      player.mute();
      btn.className = "fa-solid fa-volume-xmark";
    } else {
      player.unMute();
      player.setVolume(newVolume);
      btn.className = "fa-solid fa-volume-low";
    }

    lastVolume = newVolume;
    updateSliderFill(volumeSlider);
  } catch (error) {
    console.error("Error handling volume:", error);
  }
}

function handleSeek(e) {
  try {
    player.seekTo((e.target.value / 100) * duration, true);
    updateSliderFill(seekBar);
  } catch (error) {
    console.error("Error handling seek:", error);
  }
}

function updateSliderFill(slider) {
  const percentage =
    ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #ffffff ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`;
}

function toggleFullScreen() {
  try {
    const container = document.querySelector(".player-wrapper");
    const btn = document.getElementById("full-screen");
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        btn.className = "fa-solid fa-compress";
      });
    } else {
      document.exitFullscreen().then(() => {
        btn.className = "fa-solid fa-expand";
      });
    }
  } catch (error) {
    console.error("Error toggling fullscreen:", error);
  }
}

function formatTime(duration) {
  if (isNaN(duration)) return "0:00";

  duration = Math.floor(duration);
  const min = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;
  return `${min}:${String(secs).padStart(2, "0")}`;
}

// Volume slider visibility
const volumeContainer = document.querySelector(".volume");
const volumeBar = document.getElementById("volume-slider");

volumeContainer.addEventListener("mouseenter", () => {
  volumeBar.style.display = "block";
});

volumeContainer.addEventListener("mouseleave", () => {
  volumeBar.style.display = "none";
});

async function getData() {
  try {
    const response = await fetch(`/api/youtube?type=video&videoId=${videosId}`);
    if (!response.ok) throw new Error("Failed to fetch video data");

    const data = await response.json();
    if (!data?.items?.[0]?.snippet) {
      throw new Error("Invalid video data structure");
    }

    const channelId = data.items[0].snippet.channelId;
    const channelInfo = await fetch(
      `/api/youtube?type=channel&channelId=${channelId}`
    );
    if (!channelInfo.ok) throw new Error("Failed to fetch channel data");

    const channelData = await channelInfo.json();
    if (!channelData?.items?.[0]?.snippet) {
      throw new Error("Invalid channel data structure");
    }

    insertInfo(data, channelData);

    const channelTitle = data.items[0].snippet.title;
    const topic = channelTitle.split(" ").slice(0, 4).join(" ");

    const fetchRecomendedVideo = await fetch(
      `/api/youtube?type=search&query=${encodeURIComponent(topic)}`
    );
    if (!fetchRecomendedVideo.ok)
      throw new Error("Failed to fetch recommended videos");

    const recomendedData = await fetchRecomendedVideo.json();
    if (!recomendedData?.items) {
      throw new Error("Invalid recommended videos data structure");
    }

    const recomendedVideoIds = recomendedData.items
      .map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (recomendedVideoIds) {
      const statResponse = await fetch(
        `/api/youtube?type=video&videoId=${recomendedVideoIds}`
      );
      if (statResponse.ok) {
        const statData = await statResponse.json();
        renderRecomendedVideo(statData);
      }
    }
  } catch (error) {
    console.error("Error fetching video data:", error);
    // Show error message to user
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent =
      "Could not load video details. Please try again later.";
    document.querySelector(".info-container").prepend(errorElement);
  }
}

async function insertInfo(data, channelData) {
  try {
    const infoContainer = document.querySelector(".info-container");
    const descriptionContainer = document.querySelector(".desc-container");

    // Default values for missing data
    const videoTitle = data.items[0].snippet.title || "Untitled Video";
    const channelTitle =
      data.items[0].snippet.channelTitle || "Unknown Channel";
    const viewCount = formatViewLikeCount(
      data.items[0].statistics?.viewCount || 0
    );
    const likeCount = formatViewLikeCount(
      data.items[0].statistics?.likeCount || 0
    );
    const subscriberCount = formatViewLikeCount(
      channelData.items[0].statistics?.subscriberCount || 0
    );
    const channelThumbnail =
      channelData.items[0].snippet.thumbnails?.high?.url ||
      "./images/default-profile.jpg";
    const videoThumbnail =
      data.items[0].snippet.thumbnails?.high?.url ||
      "./images/default-thumbnail.jpg";
    const publishedAt = formatPublishedDate(data.items[0].snippet.publishedAt);
    const description =
      data.items[0].snippet.description || "No description available";

    infoContainer.innerHTML = `
      <div class="video-info">
        <div class="video-title">${videoTitle}</div>
        <div class="info">
          <div class="channel-info">
            <div class="profile">
              <img src="${channelThumbnail}" alt="" />
            </div>
            <div class="channel-followers">
              <div class="channel-name">${channelTitle}</div>
              <div class="subscriber">${subscriberCount} subscribers</div>
            </div>
            <div class="subscribe">
              <button>Subscribe</button>
            </div>
          </div>
          <div class="like-dislike">
            <div class="like-button">
              <div class="like">
                <button class="like-count">
                  <i id="like-video" class="ri-thumb-up-line"></i>
                  <span class="videoLike-count">${likeCount}</span>
                </button>
              </div>
              <div class="dislike">
                <button class="">
                  <i id="dislike-video" class="ri-thumb-down-line"></i>
                </button>
              </div>
            </div>
            <div class="share-button share">
              <button><i class="ph ph-share-fat"></i>Share</button>
            </div>
            <div class="download-button download">
              <button><i class="ph ph-arrow-down"></i>Download</button>
            </div>
            <div class="download-button clip">
              <button><i class="ph ph-scissors"></i>Clip</button>
            </div>
            <div class="download-button save">
              <button><i class="ph ph-bookmark-simple"></i>Save</button>
            </div>
            <div class="three-dot">
              <button>
                <i class="ph ph-dots-three"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    descriptionContainer.innerHTML = `
      <div class="description-text">
        <div class="desc-top">
          <p>${viewCount} views • ${publishedAt}</p>
        </div>
        <p class="desc-paragraph">${description}</p>
        <div class="info-box">
          <div class="info-channel">
            <div class="profile">
              <img src="${channelThumbnail}" alt="" />
            </div>
            <div class="content">
              <p>${channelTitle}</p>
              <p>${subscriberCount} subscribers</p>
            </div>
          </div>
          <div class="button">
            <button class="videos">
              <i class="ri-video-line"></i>Videos
            </button>
            <button class="about">
              <i class="ri-file-user-line"></i>About
            </button>
          </div>
        </div>
      </div>
    `;

    const commentCount = data.items[0].statistics?.commentCount || 0;
    document.querySelector(".commentCount").innerText =
      commentCount > 1 ? `${commentCount} Comments` : `${commentCount} Comment`;

    hideButton();

    document.getElementById("like-video").addEventListener("click", () => {
      const likeCount = document.querySelector(".videoLike-count");
      const btn = document.getElementById("like-video");
      toggleLikeDislikeBtn(
        btn,
        "like",
        likeCount,
        "#like-video",
        "#dislike-video"
      );
    });

    document.getElementById("dislike-video").addEventListener("click", () => {
      const likeCount = document.querySelector(".videoLike-count");
      const btn = document.getElementById("dislike-video");
      toggleLikeDislikeBtn(
        btn,
        "dislike",
        likeCount,
        "#like-video",
        "#dislike-video"
      );
    });
  } catch (error) {
    console.error("Error inserting video info:", error);
  }
}

function hideButton() {
  const paragraph = document.querySelector(".desc-paragraph");
  const lineHeight = parseInt(getComputedStyle(paragraph).lineHeight);
  const totalHeight = paragraph.offsetHeight;
  const lineCount = totalHeight / lineHeight;
  const btn = document.getElementById("more-less");

  if (lineCount <= 1) {
    btn.style.display = "none";
  }
}

async function renderRecomendedVideo(statData) {
  try {
    const videoContainer = document.querySelector(".recomended");
    videoContainer.innerHTML = "";

    if (!statData?.items) return;

    statData.items.forEach((video) => {
      if (!video.id || !video.snippet) return;

      const videoId = video.id;
      const videoTitle = video.snippet.title || "Untitled Video";
      const channelTitle = video.snippet.channelTitle || "Unknown Channel";
      const viewCount = formatViewLikeCount(video.statistics?.viewCount || 0);
      const publishedAt = formatPublishedDate(video.snippet.publishedAt);
      const thumbnail =
        video.snippet.thumbnails?.high?.url || "./images/default-thumbnail.jpg";

      const videoDiv = document.createElement("div");
      videoDiv.className = "recomended-videos";
      videoDiv.addEventListener("click", () => {
        window.location.href = `PlayVideo.html?videoId=${videoId}`;
      });

      videoDiv.innerHTML = `
        <div class="video">
          <img src="${thumbnail}" alt="" />
        </div>
        <div class="recomended-video-info">
          <div class="channel">
            <div class="title">${videoTitle}</div>
            <span class="channel-name">${channelTitle}</span>
            <div class="channel-info">
              <span class="views">${viewCount} views</span>
              <span>&middot;</span>
              <span class="time">${publishedAt}</span>
            </div>
          </div>
          <div class="dot-icon">
            <i class="ph ph-dots-three-vertical"></i>
          </div>
        </div>
      `;

      videoContainer.appendChild(videoDiv);
    });
  } catch (error) {
    console.error("Error rendering recommended videos:", error);
  }
}

document.getElementById("more-less").addEventListener("click", () => {
  const descBox = document.querySelector(".description-text");
  const btn = document.getElementById("more-less");
  descBox.classList.toggle("expand");
  btn.textContent = descBox.classList.contains("expand")
    ? "Show less"
    : "Show more";
});

// Helper functions
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

function parseAbbreviatedNumber(str) {
  if (!str) return 0;

  const num = parseFloat(str);
  if (str.includes("B")) return num * 1e9;
  if (str.includes("M")) return num * 1e6;
  if (str.includes("k")) return num * 1e3;
  return num;
}

function toggleLikeDislikeBtn(
  btn,
  action,
  likeCount,
  likeSelector,
  dislikeSelector
) {
  try {
    let likeBtn = "",
      dislikeBtn = "";

    if (likeSelector.charAt(0) === "#") {
      const buttons = btn.closest(".like-button");
      dislikeBtn = buttons.querySelector(dislikeSelector);
      likeBtn = buttons.querySelector(likeSelector);
    } else {
      const commentBox = btn.closest(".comment");
      dislikeBtn = commentBox.querySelector(dislikeSelector);
      likeBtn = commentBox.querySelector(likeSelector);
    }

    const likeValue = parseAbbreviatedNumber(likeCount.textContent);

    if (action === "like") {
      if (btn.classList.contains("ri-thumb-up-line")) {
        btn.classList.remove("ri-thumb-up-line");
        btn.classList.add("ri-thumb-up-fill");
        likeCount.innerText = formatViewLikeCount(likeValue + 1);

        if (dislikeBtn.classList.contains("ri-thumb-down-fill")) {
          dislikeBtn.classList.remove("ri-thumb-down-fill");
          dislikeBtn.classList.add("ri-thumb-down-line");
        }
      } else {
        btn.classList.remove("ri-thumb-up-fill");
        btn.classList.add("ri-thumb-up-line");

        const newCount = likeValue - 1;
        likeCount.innerText =
          newCount === 0 ? "" : formatViewLikeCount(newCount);
      }
    } else {
      if (btn.classList.contains("ri-thumb-down-line")) {
        btn.classList.remove("ri-thumb-down-line");
        btn.classList.add("ri-thumb-down-fill");

        if (likeBtn.classList.contains("ri-thumb-up-fill")) {
          likeBtn.classList.remove("ri-thumb-up-fill");
          likeBtn.classList.add("ri-thumb-up-line");
          const newCount = likeValue - 1;
          likeCount.innerText =
            newCount === 0 ? "" : formatViewLikeCount(newCount);
        }
      } else {
        btn.classList.remove("ri-thumb-down-fill");
        btn.classList.add("ri-thumb-down-line");
      }
    }
  } catch (error) {
    console.error("Error toggling like/dislike:", error);
  }
}

// Initialize
getData();

// Load YouTube API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
