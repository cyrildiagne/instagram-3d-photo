// The service URL.
// TODO: Update this if you've deployed the backend to AppEngine.
const SERVICE_URL = "http://localhost:8080";

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
      video.autoplay = true;
      video.loop = true;
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
  let images = document.getElementsByTagName("img");
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
}

// Listen for background script message when the button has been clicked.
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action == "run") {
    run();
  }
});
