// The service URL.
// TODO: Update this if you've deployed the backend to AppEngine.
const SERVICE_URL = "http://localhost:8080";

// Switch to 'mouse' to interact with the mouse.
const mode = 'loop';

const videos = [];

async function processAndReplace(img) {
  img.classList.remove("waiting");
  const requestURL = SERVICE_URL + "?url=" + encodeURIComponent(img.src);
  const res = await fetch(requestURL).then((x) => x.json());

  console.log(res.status, ":", img.src);

  switch (res.status) {
    case "queued": // Waiting
      img.classList.add("queued");
      break;
    case "processing": // Being processed
      img.classList.remove("queued");
      img.classList.add("processing");
      break;
    case "ready":
      // Use fetch to bypass CSP restrictions.
      const videoData = await fetch(res.url);
      const blob = await videoData.blob();
      const src = window.URL.createObjectURL(blob);
      // Initialize video element.
      const video = document.createElement("video");
      video.src = src;
      video.width = img.width;
      video.height = img.height;
      video.muted = true;
      if (mode == 'loop') {
        video.autoplay = true;
        video.loop = true;
      }
      video.style.position = "absolute";
      video.style.left = 0;
      video.style.top = 0;
      videos.push(video);
      img.parentNode.paddingBottom = 0;
      img.parentNode.appendChild(video);
      img.remove();
      return;
  }
  // setTimeout(() => processAndReplace(img), 1000);
}

function mapScrollToMousePosition(evt) {
  const pointer = {
    x: evt.clientX,
    y: evt.clientY,
  };

  for (const video of videos) {
    if (!video.duration) {
      continue;
    }
    const rect = video.getBoundingClientRect();
    // Only update if mouse is over window.
    if (
      pointer.x < rect.x ||
      pointer.y < rect.y ||
      pointer.x > rect.x + rect.width ||
      pointer.y > rect.y + rect.height
    ) {
      continue;
    }
    // Get angle between video position and mouse.
    const x = pointer.x - (rect.x + rect.width * 0.5);
    const y = pointer.y - (rect.y + rect.height * 0.5);
    const a = Math.atan2(y, x);
    // Apply angle as frame position.
    const pct = a / (2 * Math.PI) + 0.5;
    video.currentTime = pct * video.duration;
  }
}

// function mapScrollToCurrentTime() {
//   for (const video of videos) {
//     if (!video.duration) {
//       continue;
//     }
//     const rect = video.getBoundingClientRect();
//     // Only update if video is visible.
//     if (rect.y < -rect.height * 0.5 || rect.y > window.innerHeight) {
//       continue;
//     }
//     // Translate y position to current frame. Because the video has been encoded
//     // with 1 keyframe per frame, the update will be very fast.
//     let offset =
//       (rect.y + rect.height * 0.25) / (window.innerHeight - rect.height * 0.5);
//     offset = 1 - Math.min(Math.max(0, offset), 1);
//     video.currentTime = offset * video.duration;
//   }
// }

function run() {
  const images = document.getElementsByTagName("img");
  for (const img of images) {
    if (img.dataset["insta3d"]) {
      continue;
    }
    // Distinguish posts from other images.
    if (!img.srcset || img.src.includes("mobile_nav_type_logo")) {
      continue;
    }
    img.classList.add("waiting");
    processAndReplace(img);
  }

  // window.addEventListener("scroll", mapScrollToCurrentTime);

  if (mode = 'mouse') {
    // Instagram's dom is pretty funky so we must listen for mouse moves over
    // the entire window rather than each individual video.
    window.addEventListener("mousemove", mapScrollToMousePosition);
  }
}

// Listen for background script message when the button has been clicked.
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action == "run") {
    run();
  }
});
