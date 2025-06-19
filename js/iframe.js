let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100 % ",
    width: "100 % ",
    videoId: "_MbtC7q4z-0",
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
}

function onPlayerReady(event) {
  const card = document.querySelector(".card");

  event.target.pauseVideo();

  card.addEventListener("mouseenter", () => {
    player.playVideo();
  });

  card.addEventListener("mouseleave", () => {
    player.pauseVideo();
  });
}

function onPlayerStateChange() {}

function stopVideo() {
  player.stopVideo();
}
