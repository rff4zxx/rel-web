const video = document.getElementById("video");
const homeBtn = document.getElementById("homeBtn");

let triggered = false;

function requestFullscreen() {
    const { documentElement } = document;
    if (documentElement.requestFullscreen) return documentElement.requestFullscreen();
    if (documentElement.webkitRequestFullscreen) return documentElement.webkitRequestFullscreen();
    if (documentElement.mozRequestFullScreen) return documentElement.mozRequestFullScreen();
    if (documentElement.msRequestFullscreen) return documentElement.msRequestFullscreen();
}

function jumpscare(e) {
    e.preventDefault(); // batalin navigasi ke home

    if (triggered) return;
    triggered = true;

    requestFullscreen();

    video.muted = false;
    video.currentTime = 0;
    video.classList.remove("hidden");
    video.classList.add("show");
    video.play();
}

homeBtn.addEventListener("click", jumpscare);
