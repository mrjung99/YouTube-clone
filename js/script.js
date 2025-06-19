// const API_KEY = "AIzaSyC0wc41xZbw0CaaYUmwKvP0C-NHe2_FTY8";

const BASE_URL = `https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=${API_KEY}&part=snippet,contentDetails,statistics,status`;

async function fetchData() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();

// youtube iframe form homepage
const players = new Map();

function onYouTubeIframeApiReady() {
  document.querySelectorAll(".video-iframe").forEach((iframe, index) => {
    iframe.id = `yt-player-${i}`;
    const player = new YT.player(iframe, {
      event: {
        onready: (e) => {
          e.target.pauseVideo();
          players.set(iframe.id, e.target);
        },
      },
    });
  });
}

// this will play the video when mouse enter in to the card
function playVideo(card) {
  const iframe = card.querySelector(".video-iframe");

  const player = players.get(iframe.id);
  if (player) {
    player.mute(); // start muted
    player.playVideo();
  }
}

// this will pause the video when mouse leave the card
function pauseVideo(card) {
  const iframe = card.querySelector(".video-iframe");

  const player = players.get(iframe.id);
  if (player) {
    player.pauseVideo();
    player.seekTo(0);
  }
}

const createBtn = document.querySelector(".create");
const createPopUp = document.querySelector(".create-popUP");
const bell = document.querySelector(".bell");
const notificationBox = document.querySelector(".notification");
const hambargarIcon = document.querySelector(".menu");
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

hambargarIcon.addEventListener("click", () => {
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
