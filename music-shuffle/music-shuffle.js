const pickButton = document.getElementById("pick");
const folderInput = document.getElementById("folderInput");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const shuffleButton = document.getElementById("shuffle");
const stopButton = document.getElementById("stop");
const player = document.getElementById("player");
player.volume = 0.15;
const track = document.getElementById("track");

let songs = [];
let queue = [];
let currentIndex = -1;

function setPlaybackButtonsDisabled(disabled) {
  prevButton.disabled = disabled;
  nextButton.disabled = disabled;
  shuffleButton.disabled = disabled;
  stopButton.disabled = disabled;
}

pickButton.addEventListener("click", () => {
  folderInput.click();
});

folderInput.addEventListener("change", (e) => {
  const files = e.target.files;
  if (!files || !files.length) return;

  songs = Array.from(files).filter(
    (file) =>
      file.type.startsWith("audio/") ||
      /\.(mp3|m4a|aac|flac|ogg|opus|wav|wma)$/i.test(file.name)
  );

  if (!songs.length) {
    track.textContent = "No music files found.";
    setPlaybackButtonsDisabled(true);
    return;
  }
  track.textContent = `${songs.length} tracks found.`;
  setPlaybackButtonsDisabled(false);
  createShuffleQueue();
  playTrack(0);
});

function createShuffleQueue() {
  queue = [...songs]; // Fisher-Yates shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  currentIndex = -1;
}

function playTrack(idx) {
  if (!queue.length) return;
  if (idx >= queue.length) {
    createShuffleQueue();
    idx = 0;
  } else if (idx < 0) {
    idx = queue.length - 1;
  }
  currentIndex = idx;
  const file = queue[currentIndex];
  const url = URL.createObjectURL(file);
  player.src = url;
  player.play().catch(() => {});
  track.textContent = `🎵 ${file.name}`;

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: file.name,
    });
  }
}

function playNext() {
  playTrack(currentIndex + 1);
}

function playPrev() {
  if (player.currentTime > 3) {
    player.currentTime = 0;
  } else {
    playTrack(currentIndex - 1);
  }
}

player.addEventListener("ended", playNext);
prevButton.addEventListener("click", playPrev);
nextButton.addEventListener("click", playNext);

shuffleButton.addEventListener("click", () => {
  if (!songs.length) return;
  createShuffleQueue();
  playTrack(0);
});

stopButton.addEventListener("click", () => {
  player.pause();
  player.currentTime = 0;
  track.textContent = "Stopped";
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("previoustrack", playPrev);
  navigator.mediaSession.setActionHandler("nexttrack", playNext);
}

