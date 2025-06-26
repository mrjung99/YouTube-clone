// const API_KEY = "AIzaSyBPaEISoAhz0kwRrEoTU4XtSlZIUFjoAVs";

//mrjung
// const API_KEY = "AIzaSyC0wc41xZbw0CaaYUmwKvP0C-NHe2_FTY8";

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
  player.playVideo();
  duration = player.getDuration();
  document.querySelector(".total-duration").textContent = formatTime(duration);

  //play and pause video overlay
  document
    .querySelector(".player-overlay")
    .addEventListener("click", togglePlayPause);

  //play and pause video bottom left
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
  //fill slider on load
  updateSliderFill(volumeSlider);
  updateSliderFill(seekBar);

  //fullscreen toggle
  document
    .getElementById("full-screen")
    .addEventListener("click", toggleFullScreen);

  document.addEventListener("keydown", (e) => {
    if (e.key === " ") togglePlayPause;
    if (e.key === "ArrowRight")
      player.seekTo(player.getCurrentDuration() + 5, true);
    if (e.key === "ArrowLeft")
      player.seekTo(player.getCurrentDuration() - 5, true);
  });

  setInterval(updateProgress, 1000);
}

function onPlayerStateChange(event) {}

function togglePlayPause() {
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
}

function handleMuteUnmute() {
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
}

function updateProgress() {
  const current = player.getCurrentTime();
  document.querySelector(".now").textContent = formatTime(current);
  seekBar.value = (current / duration) * 100;
  updateSliderFill(seekBar);
}

function handleVolume(e) {
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
}

function handleSeek(e) {
  player.seekTo((e.target.value / 100) * duration, true);
  updateSliderFill(seekBar);
}

function updateSliderFill(slider) {
  const percentage =
    ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #ffffff${percentage}%,rgba(255,255,255,0.1)${percentage}%)`;
}

function toggleFullScreen() {
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
}

function formatTime(duration) {
  duration = Math.floor(duration);

  let hour = Math.floor(duration / 3600);
  const min = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;

  if (hour > 0) {
    return `${hour}:${String(min).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  } else {
    return `${min}:${String(secs).padStart(2, "0")}`;
  }
}

//this will make  volume progress bar visible when hover over on it
const volumeContainer = document.querySelector(".volume");
const volumeBar = document.getElementById("volume-slider");

volumeContainer.addEventListener("mouseenter", () => {
  volumeBar.style.display = "block";
});

volumeContainer.addEventListener("mouseleave", () => {
  volumeBar.style.display = "none";
});

async function getData() {
  const response = await fetch(`/api/youtube?type=video?videoId=${videosId}`);
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Video data not found.");
  }

  const channelId = data.items[0].snippet.channelId;

  const channelInfo = await fetch(
    `/api/youtube?type=channel?channelId=${channelId}`
  );
  const channelData = await channelInfo.json();

  insertInfo(data, channelData);

  const channelTitle = data.items[0].snippet.title;
  const topic = channelTitle.split(" ").slice(0, 4).join(" ");

  const fetchRecomendedVideo = await fetch(
    `/api/youtube?type=search?query=${encodeURIComponent(topic)}`
  );
  const recomendedData = await fetchRecomendedVideo.json();

  const recomendedVideoIds = recomendedData.items
    .map((item) => item.id.videoId)
    .join(",");

  const statResponse = await fetch(
    `/api/youtube?type=video?videoId=${recomendedVideoIds}`
  );
  const statData = await statResponse.json();
  renderRecomendedVideo(statData);
}

async function insertInfo(data, channelData) {
  console.log("chanel data", channelData);

  const infoContainer = document.querySelector(".info-container");
  const descriptionContainer = document.querySelector(".desc-container");

  infoContainer.innerHTML = `
          <div class="video-info">
            <div class="video-title">
              ${data.items[0].snippet.title}
            </div>
            <div class="info">
              <div class="channel-info">
                <div class="profile">
                  <img src="${
                    channelData.items[0].snippet.thumbnails.high.url
                  }" alt="" />
                </div>
                <div class="channel-followers">
                  <div class="channel-name">${
                    data.items[0].snippet.channelTitle
                  }</div>
                  <div class="subscriber">${formatViewLikeCount(
                    channelData.items[0].statistics.subscriberCount
                  )} subscribers</div>
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
                      <span class="videoLike-count">${formatViewLikeCount(
                        data.items[0].statistics.likeCount
                      )}</span>
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
              <p>${formatViewLikeCount(
                data.items[0].statistics.viewCount
              )} views${"  "}${formatPublishedDate(
    data.items[0].snippet.publishedAt
  )}</p>
              <p> </p>
            </div>
            <p class="desc-paragraph">
              ${data.items[0].snippet.description}
            </p>
            <div class="info-box">
              <div class="info-channel">
                <div class="profile">
                  <img src="${
                    channelData.items[0].snippet.thumbnails.high.url
                  }" alt="" />
                </div>
                <div class="content">
                  <p>${data.items[0].snippet.channelTitle}</p>
                  <p>${formatViewLikeCount(
                    channelData.items[0].statistics.subscriberCount
                  )}</p>
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

  const commentCount = data.items[0].statistics.commentCount;
  console.log("comment count", commentCount);

  document.querySelector(".commentCount").innerText =
    commentCount > 1
      ? commentCount + " " + "Comments"
      : commentCount + " " + "Comment";

  //this will hide the show more/less button of the description container if it has <=1 line
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
  const videoContainer = document.querySelector(".recomended");

  videoContainer.innerHTML = "";

  statData.items.forEach((video) => {
    console.log("video data", video);
    const videoId = video.id;

    const videoDiv = document.createElement("div");
    videoDiv.className = "recomended-videos";

    videoDiv.addEventListener("click", () => {
      window.location.href = `PlayVideo.html?videoId=${videoId}`;
    });

    videoDiv.innerHTML = `
          <div class="video">
            <img src="${video.snippet.thumbnails.high.url}" alt="" />
          </div>
          <div class="recomended-video-info">
            <div class="channel">
              <div class="title">
               ${video.snippet.title}
              </div>
              <span class="channel-name">${video.snippet.channelTitle}</span>
              <div class="channel-info">
                <span class="views">${formatViewLikeCount(
                  video.statistics.viewCount
                )} views</span>
                <span>&middot;</span>
                <span class="time">${formatPublishedDate(
                  video.snippet.publishedAt
                )}</span>
              </div>
            </div>
            <div class="dot-icon">
              <i class="ph ph-dots-three-vertical"></i>
            </div>
          </div>        
        `;

    videoContainer.appendChild(videoDiv);
  });
}

document.getElementById("more-less").addEventListener("click", () => {
  const descBox = document.querySelector(".description-text");
  const btn = document.getElementById("more-less");
  descBox.classList.toggle("expand");
  if (descBox.classList.contains("expand")) {
    btn.textContent = "Show less";
  } else {
    btn.textContent = "Show more";
  }
});

//post comment

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("commentBtn")) {
    const commentContainer = document.querySelector(".display-comment");
    const comment = document.querySelector(".comment").value.trim();

    const commentBody = `
                                
            <div class="comment">
              <div class="profile">
                <img src="./images/profile.jpg" alt="" />
              </div>
              <div class="details">
                <div class="user-detail">
                  <span id="username">@crocoblock</span
                  ><span id="time">3 days ago</span>
                </div>
                <div class="comment-section">
                  <p>${comment}</p>
                  <i class="ri-more-2-fill"></i>
                </div>
                <div class="comment-action">
                  <div>
                    <i id="like-comment" class="like-comment ri-thumb-up-line"></i
                    ><span class="commentLike-count" id="commentLike-count"></span>
                  </div>
                  <i id="dislike-comment" class="dislike-comment ri-thumb-down-line"></i>
                  <button class="replyBtn" id="reply">Reply</button>
                </div>
                <div id="replier" class="commenter replier">
                  <div class="profile">
                    <img src="./images/profile.jpg" alt="" />
                  </div>
                  <div class="write-comment">
                    <input
                      class="reply-comment"
                      id="comment"
                      type="text"
                      placeholder=""
                      autocomplete="off"
                    />
                    <div class="btn-emoji">
                      <i class="fa-regular fa-face-laugh-beam"></i>
                      <div class="button">
                        <button class="cancel-reply" id="cancel">Cancel</button>
                        <button class="reply" id="commentBtn" disabled>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    `;

    commentContainer.innerHTML += commentBody;
    document.querySelector(".comment").value = "";
    addBlueBackgroundToBtn(e.target, e);
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("comment")) {
    const btn = e.target.closest(".write-comment").querySelector(".commentBtn");
    addBlueBackgroundToBtn(btn, e);
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("reply-comment")) {
    const btn = e.target.closest(".write-comment").querySelector(".reply");
    addBlueBackgroundToBtn(btn, e);
  }
});

function addBlueBackgroundToBtn(btn, e) {
  if (e.target.value != "") {
    btn.disabled = false;
    btn.style.cursor = "pointer";
    btn.style.background = "#0556bf";
    btn.style.color = "#fffffb";
  } else {
    btn.disabled = true;
    btn.style.cursor = "auto";
    btn.style.background = "rgb(241, 241, 241)";
    btn.style.color = "rgb(15,15,15)";
  }
}

document.addEventListener("click", (e) => {
  e.stopPropagation();

  if (e.target.classList.contains("comment")) {
    document.querySelector(".btn-emoji").style.display = "flex";
    document.querySelector(".comment").style.borderBottom = "1px solid black";
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cancel")) {
    document.querySelector(".btn-emoji").style.display = "none";
    document.querySelector(".comment").value = "";
    document.querySelector(".comment").style.borderBottom =
      "1px solid rgb(229,229,229)";
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("replyBtn")) {
    document.querySelector(".replier").style.display = "flex";
    document.querySelector(".reply-comment").focus();
    document.querySelector(".reply-comment").style.borderBottom =
      "1px solid black";
  }
});

document.addEventListener("click", (e) => {
  e.stopPropagation();

  if (e.target.classList.contains("cancel-reply")) {
    document.querySelector(".replier").style.display = "none";
  }
});

//like and dislike comment
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("like-comment")) {
    const commentBox = e.target.closest(".comment");
    const likeCount = commentBox.querySelector(".commentLike-count");

    toggleLikeDislikeBtn(
      e.target,
      "like",
      likeCount,
      ".like-comment",
      ".dislike-comment"
    );
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("dislike-comment")) {
    const commentBox = e.target.closest(".comment");
    const likeCount = commentBox.querySelector(".commentLike-count");

    toggleLikeDislikeBtn(
      e.target,
      "dislike",
      likeCount,
      ".like-comment",
      ".dislike-comment"
    );
  }
});

function toggleLikeDislikeBtn(
  btn,
  action,
  likeCount,
  likeSelector,
  dislikeSelector
) {
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
      likeCount.innerText = newCount === 0 ? "" : formatViewLikeCount(newCount);
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
}

getData();
