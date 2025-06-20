const videosId = getVideoIdFromUrl();

function getVideoIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("videoId");
}

console.log("videos id form play", videosId);
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: videosId,
    playerVars: {
      controls: 0,
      mute: 0,
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
  console.log("hello");
}

function onPlayerStateChange(event) {}
