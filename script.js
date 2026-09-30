const progressFill = document.querySelector("#progress-fill");
const sections = [...document.querySelectorAll(".chapter")];
const chapterLinks = [...document.querySelectorAll("[data-chapter]")];
const revealItems = [...document.querySelectorAll(".reveal")];

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));

const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    chapterLinks.forEach((link) => {
      link.classList.toggle("is-current", link.dataset.chapter === entry.target.id);
    });
  });
}, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

sections.forEach((section) => chapterObserver.observe(section));

const audio = document.querySelector("#site-audio");
const musicPlayer = document.querySelector(".music-player");
const musicToggle = document.querySelector("#music-toggle");
const muteToggle = document.querySelector("#mute-toggle");
let autoplayNeedsGesture = false;
let musicPausedByChoice = false;

const playMusic = async ({ userInitiated = false } = {}) => {
  if (!audio) return false;
  try {
    await audio.play();
    autoplayNeedsGesture = false;
    if (userInitiated) musicPausedByChoice = false;
    syncMusicControls();
    return true;
  } catch {
    if (!userInitiated) autoplayNeedsGesture = true;
    syncMusicControls();
    return false;
  }
};

const updateMusicProgress = () => {
  if (!audio || !progressFill || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
  progressFill.style.width = `${Math.min(100, (audio.currentTime / audio.duration) * 100)}%`;
};

const syncMusicControls = () => {
  if (!audio || !musicPlayer) return;
  musicPlayer.classList.toggle("is-playing", !audio.paused);
  musicPlayer.classList.toggle("is-muted", audio.muted);
  musicToggle?.setAttribute("aria-label", audio.paused ? "Tocar música" : "Pausar música");
  musicToggle?.setAttribute("aria-pressed", String(!audio.paused));
  muteToggle?.setAttribute("aria-label", audio.muted ? "Ativar som" : "Silenciar música");
  muteToggle?.setAttribute("aria-pressed", String(audio.muted));
};

musicToggle?.addEventListener("click", async () => {
  if (!audio) return;
  if (audio.paused) await playMusic({ userInitiated: true });
  else {
    musicPausedByChoice = true;
    audio.pause();
  }
  syncMusicControls();
});

muteToggle?.addEventListener("click", () => {
  if (!audio) return;
  audio.muted = !audio.muted;
  syncMusicControls();
});

audio?.addEventListener("timeupdate", updateMusicProgress);
audio?.addEventListener("durationchange", updateMusicProgress);
audio?.addEventListener("play", syncMusicControls);
audio?.addEventListener("pause", syncMusicControls);
audio?.addEventListener("volumechange", syncMusicControls);

if (audio) {
  audio.muted = false;
  audio.volume = 1;
  playMusic();
  syncMusicControls();
}

const startAfterFirstGesture = (event) => {
  if (!autoplayNeedsGesture || musicPausedByChoice || !audio?.paused) return;
  if (event.target instanceof Element && event.target.closest("#music-toggle, #mute-toggle, .format-links a[data-reel], .video-dialog")) return;
  playMusic({ userInitiated: true });
};

document.addEventListener("pointerdown", startAfterFirstGesture, true);
document.addEventListener("keydown", startAfterFirstGesture, true);

const uiHistoryLayers = [];
const ignoreDetailToggle = new Set();
let uiLayerSequence = 0;
let closingVideoFromPopstate = false;

const pushUiHistoryLayer = (type, id) => {
  const token = `sambalaxo-ui-${++uiLayerSequence}`;
  const currentState = history.state && typeof history.state === "object" ? history.state : {};
  history.pushState({ ...currentState, sambalaxoUiLayer: token }, "", location.href);
  uiHistoryLayers.push({ type, id, token });
};

window.addEventListener("popstate", (event) => {
  const layer = uiHistoryLayers.at(-1);
  if (!layer || event.state?.sambalaxoUiLayer === layer.token) return;
  uiHistoryLayers.pop();

  if (layer.type === "details") {
    const details = document.getElementById(layer.id);
    if (details?.open) {
      ignoreDetailToggle.add(layer.id);
      details.open = false;
    }
    return;
  }

  if (layer.type === "video") {
    const dialog = document.getElementById(layer.id);
    if (dialog?.open) {
      closingVideoFromPopstate = true;
      dialog.close();
    }
  }
});

document.querySelectorAll(".stage-board").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) {
      if (ignoreDetailToggle.delete(details.id)) return;
      const layer = uiHistoryLayers.at(-1);
      if (layer?.type === "details" && layer.id === details.id) history.back();
      return;
    }
    pushUiHistoryLayer("details", details.id);
    const preview = details.querySelector(".stage-preview");
    if (preview && !preview.src) preview.src = preview.dataset.src;
  });
});

const videoDialog = document.querySelector("#show-video-dialog");
const videoFrame = videoDialog?.querySelector(".video-dialog-frame");
const videoTitle = videoDialog?.querySelector("#show-video-title");
const videoFallback = videoDialog?.querySelector(".video-dialog-fallback");
let resumeMusicAfterVideo = false;

document.querySelectorAll(".format-links a[data-reel]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!videoDialog?.showModal || !videoFrame) return;
    event.preventDefault();
    const reel = link.dataset.reel;
    const format = link.dataset.format || "Sambalaxo ao vivo";
    videoTitle.textContent = format;
    videoFrame.title = `Sambalaxo ao vivo · ${format}`;
    videoFrame.src = `https://www.instagram.com/reel/${encodeURIComponent(reel)}/embed/`;
    videoFallback.href = link.href;
    resumeMusicAfterVideo = Boolean(audio && !musicPausedByChoice && (!audio.paused || autoplayNeedsGesture));
    pushUiHistoryLayer("video", videoDialog.id);
    videoDialog.showModal();
    if (resumeMusicAfterVideo) audio.pause();
  });
});

videoDialog?.querySelector(".video-dialog-close")?.addEventListener("click", () => videoDialog.close());
videoDialog?.addEventListener("click", (event) => {
  if (event.target === videoDialog) videoDialog.close();
});
videoDialog?.addEventListener("close", () => {
  videoFrame?.removeAttribute("src");
  if (closingVideoFromPopstate) closingVideoFromPopstate = false;
  else if (uiHistoryLayers.at(-1)?.type === "video") history.back();
  if (!resumeMusicAfterVideo || !audio) return;
  resumeMusicAfterVideo = false;
  playMusic({ userInitiated: true });
});

const heroVideo = document.querySelector(".hero-video");
const motionQuery = window.matchMedia("(max-width: 760px) and (prefers-reduced-motion: no-preference)");

const syncHeroVideo = () => {
  if (!heroVideo) return;
  if (motionQuery.matches) {
    if (!heroVideo.src) heroVideo.src = heroVideo.dataset.src;
    if (!document.hidden) heroVideo.play().catch(() => {});
  } else if (heroVideo.src) {
    heroVideo.pause();
    heroVideo.removeAttribute("src");
    heroVideo.load();
  }
};

motionQuery.addEventListener("change", syncHeroVideo);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) heroVideo?.pause();
  else syncHeroVideo();
});
syncHeroVideo();
