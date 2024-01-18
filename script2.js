const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const audio1 = document.getElementById("audio1");
const audioContext = new AudioContext();
let audioSource;
let analyser;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const filecount = 82;
let arr = Array.from({ length: filecount + 1 }, (_, i) => i);
shuffle(arr);

let index = 0;
let focus = 1;

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    switch (e.code) {
        case "ArrowDown":
            adjustVolume(-0.1);
            break;
        case "ArrowUp":
            adjustVolume(0.1);
            break;
        case "ArrowRight":
            changeIndex(1);
            play();
            break;
        case "ArrowLeft":
            changeIndex(-1);
            play();
            break;
    }
}

function adjustVolume(amount) {
    focus = 1;
    audio1.volume = Math.max(0, Math.min(1, audio1.volume + amount));
}

function changeIndex(delta) {
    index = (index + delta + filecount + 1) % (filecount + 1);
}

audio1.addEventListener("ended", handleAudioEnded);

function handleAudioEnded() {
    audio1.currentTime = 0;
    changeIndex(1);
    play();
}

function play() {
    if (!audioSource) {
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    analyser.fftSize = 128;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (canvas.width / bufferLength) * 0.95;

    let tabHeightOld = new Array(analyser.fftSize / 2).fill(0);
    let tabVelocity = new Array(analyser.fftSize / 2).fill(0);

    const file = `audio/${arr[index]}.mp3`;
    console.log(file);
    audio1.src = file;
    audio1.play();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        drawVisualiser(bufferLength, barWidth, dataArray, tabHeightOld, tabVelocity);
        drawControls(audio1.volume, audio1.duration, audio1.currentTime);

        requestAnimationFrame(animate);
    }

    animate();
}

function drawVisualiser(bufferLength, barWidth, dataArray, tabHeightOld, tabVelocity) {
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 2;
        const tabHeight = tabHeightOld[i] <= barHeight
            ? (tabVelocity[i] = (tabHeightOld[i] - barHeight) / 15 - 5, tabHeightOld[i] = barHeight)
            : (tabVelocity[i] += 0.5, tabHeightOld[i] -= tabVelocity[i]);

        drawBar(x, barHeight, dataArray[i]);
        drawTab(x, tabHeight);

        x += barWidth + 2;
    }
}

function drawBar(x, barHeight, value) {
    const red = (1 * value / 1.25) * 1.4;
    const green = (1 * value / 2) * 1.4;
    const blue = (1 * value / 2) * x / 15 * 1.4;
    ctx.fillStyle = `rgb(${red},${green},${blue})`;
    ctx.fillRect(x, canvas.height - (barHeight * 1.5), barWidth, barHeight * 1.5);
}

function drawTab(x, tabHeight) {
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(x, canvas.height - (tabHeight * 1.5) - 10, barWidth, 10);
}

function drawControls(volume, duration, progress) {
    const offset = 50;

    if (focus > 0) {
        drawVolumeBar(offset, volume);
        focus -= 0.01;
    }

    drawProgressBar(offset, duration, progress);
}

function drawVolumeBar(offset, volume) {
    const barWidth = 40;
    const barHeight = 300;

    ctx.fillStyle = `rgb(0,0,${255 * focus})`;
    ctx.fillRect(canvas.width - barWidth - offset, offset, barWidth, barHeight);

    const volumeWidth = barWidth - 10;
    const volumeHeight = barHeight - 10;
    const volumeHeightScale = volumeHeight * volume;

    ctx.fillStyle = `rgb(0,${255 * focus},0)`;
    ctx.fillRect(canvas.width - barWidth - offset + 5, offset + 5 + volumeHeight, volumeWidth, -volumeHeightScale);

    drawVolumeSegments(offset, volumeHeight);
}

function drawVolumeSegments(offset, volumeHeight) {
    const barHeight = 5;

    ctx.fillStyle = `rgb(0,0,${255 * focus})`;
    for (let i = 0; i < 11; i++) {
        ctx.fillRect(canvas.width - 90, offset + 5 + volumeHeight - ((volumeHeight / 10) * i) - 2.5, 40, barHeight);
    }
}

function drawProgressBar(offset, duration, progress) {
    ctx.fillStyle = "rgb(127,127,127)";
    ctx.fillRect(offset * 2, offset, canvas.width - (offset * 4), 20);

    const durationScale = progress / duration;
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(offset * 2 + 5, offset + 5, (canvas.width - ((5 + offset * 2) * 2)) * durationScale, 10);
}
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}