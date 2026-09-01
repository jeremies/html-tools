const pickButton = document.getElementById("pick");
const shuffleButton = document.getElementById("shuffle");
const stopButton = document.getElementById("stop");
const player = document.getElementById("player");
const track = document.getElementById("track");
let songs = [];
let queue = [];
let index = 0;
pickButton.addEventListener("click", async () => {
  try {
    const handle = await window.showDirectoryPicker();
    songs = [];
    async function scan(directory) {
      for await (const entry of directory.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          if (
            file.type.startsWith("audio/") ||
            /\.(mp3|m4a|aac|flac|ogg|opus|wav|wma)$/i.test(file.name)
          ) {
            songs.push(file);
          }
        } else if (entry.kind === "directory") {
          await scan(entry);
        }
      }
    }
    await scan(handle);
    if (!songs.length) {
      track.textContent = "No music files found.";
      shuffleButton.disabled = true;
      stopButton.disabled = true;
      return;
    }
    track.textContent = `${songs.length} tracks found.`;
    shuffleButton.disabled = false;
    stopButton.disabled = false;
    createShuffleQueue();
    playNext();
  } catch (err) {
    // User cancelled the folder picker.
  }
});
function createShuffleQueue() {
  queue = [...songs]; // Fisher-Yates shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  index = 0;
}
function playNext() {
  if (index >= queue.length) {
    createShuffleQueue();
  }
  const file = queue[index++];
  const url = URL.createObjectURL(file);
  player.src = url;
  player.play().catch(() => {});
  track.textContent = `🎵 ${file.name}`;
}
player.addEventListener("ended", playNext);
shuffleButton.addEventListener("click", () => {
  if (!songs.length) return;
  createShuffleQueue();
  playNext();
});
stopButton.addEventListener("click", () => {
  player.pause();
  player.currentTime = 0;
  track.textContent = "Stopped";
});
