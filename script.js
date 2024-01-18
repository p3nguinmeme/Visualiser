const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let audioSource;
let analyser;
const audio1 = document.getElementById("audio1");


const filecount = 1 //refer to rename.py to get the number for this quickly
//in order to have this work automatically it would require smth like nodejs




function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
// Used like so
//generate array
let arr = [];
for (let i = 0; i <= filecount; i++) {
    arr.push(i);
}

shuffle(arr);
//console.log(arr);
let index = 0;


var focus = 1
document.addEventListener('keydown', logKey);
    function logKey(e) {
        if (`${e.code}` == "ArrowDown") {
            focus = 1
        //console.log("old:" + audio1.volume)
        if (audio1.volume >= 0.1){
            audio1.volume -= 0.1
            //console.log("new:" + audio1.volume)
        } else{
            //console.log("Too low!")
        }
        
    }
        if (`${e.code}` == "ArrowUp") {
            focus = 1
            //console.log("old:" + audio1.volume)
        if (audio1.volume <= 0.9){
            audio1.volume += 0.1
            //console.log("new:" + audio1.volume)
        } else{
            //console.log("Too high")
        }
    }

    if (`${e.code}` == "ArrowRight") {
        index = index + 1;
        if (index > filecount){
            index = 0;
        }
        //console.log(index);
        play();
    
    }
    if (`${e.code}` == "ArrowLeft") {
        index = index - 1;
        if (index < 0){
            index = filecount;
        }
        //console.log(index);
        play();
    
    }
    }


//container.addEventListener("click", function(){
//    play();
//});
audio1.addEventListener("ended", function(){
    audio1.currentTime = 0;
    //console.log("ended");
    index = index + 1;
    if (index > filecount){
        index = 0;
    }
    play();
});



function play(){
    //let audio1 = new Audio()
    file = arr[index]
    
    file = "audio/" + file + ".mp3";
    console.log(file);

    audio1.src = file;


    //change index
    
    
    

    const audioContext = new AudioContext();
    //console.log(audioContext);


    //CATCHING THIS ERROR WITH NO SIDE EFFECTS IS WORSE THAN SISYPHUS'S PUNISHMENT!
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination)
    analyser.fftSize = 128;//128
    

    tabHeightOld = new Array(analyser.fftSize / 2);
    tabVelocity = new Array(analyser.fftSize / 2);
    for (var i = 0; i < tabHeightOld.length; i++){
        tabHeightOld[i] = 0;
        tabVelocity[i] = 0;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = (canvas.width / bufferLength)* 0.95;
    let barHeight;
    let x = 0;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        
        drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, tabHeightOld, tabVelocity)
        drawControls(audio1.volume, audio1.duration, audio1.currentTime)
        
        requestAnimationFrame(animate);
    }
    animate();
}




function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, tabHeightOld, tabVelocity){
    
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        tabHeight = barHeight;
        // creates the main bar
        var red = (1 * dataArray[i] / 1.25) * 1.4;
        var green = (1 * dataArray[i] / 2) * 1.4;
        var blue = (1 * dataArray[i] / 2) * i / 15 * 1.4; 
        ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
        ctx.fillRect(x, canvas.height - (barHeight * 1.5), barWidth, barHeight * 1.5);//multipler on barheight makes it weird but nifty
       //ctx.fillRect(x, canvas.height - (barHeight * 1.5), barWidth, 20);//creates a consistently sized bar that goes up and down

        //creates a set little bit over the main bar
        //height and other related logic for tabs
        if (tabHeightOld[i] <= barHeight){
            tabVelocity[i] = (tabHeightOld[i] - barHeight) / 15 - 5;// bouncy
            //tabVelocity[i] = 0; // no bounce
            tabHeightOld[i] = barHeight;


            var red = (255);
            var green = (255);
            var blue = (255);
            ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
            ctx.fillRect(x, canvas.height - (barHeight *1.5) - 10, barWidth, 10);
        } else {
            tabVelocity[i] = tabVelocity[i] + 0.5
            tabHeight = tabHeightOld[i] - tabVelocity[i]; 
            tabHeightOld[i] = tabHeight;


            var red = (255);
            var green = (255);
            var blue = (255);
            ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
            ctx.fillRect(x, canvas.height - (tabHeight *1.5) - 10, barWidth, 10);
        }
        //tabHeightOld[i] = tabHeight;
        //ctx.fillRect(x, canvas.height - (tabHeight), barWidth, 20);//creates a consistently sized bar that goes up and down

        
        x += barWidth + 2;
    }
}


function drawControls(volume, duration, progress){
    const offset = 50

    if (focus > 0){
        //draw volume bar box container
        const barWidth = 40
        var barHeight = 300
        var red = (0);
        var green = (0);
        var blue = (255 * focus);
        ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
        ctx.fillRect(canvas.width - barWidth - offset, offset, barWidth, barHeight);


        //draw volume bar
        const volumeWidth = barWidth - 10
        const volumeHeight = barHeight - 10
        var volumeHeightScale = volumeHeight * volume
        var red = (0);
        var green = (255 * focus);
        var blue = (0);
        ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
        ctx.fillRect(canvas.width - barWidth  - offset + 5,   offset + 5 + volumeHeight, volumeWidth, - volumeHeightScale);

        //segmenting the volume
        var barHeight = 5
        var red = (0);
        var green = (0);
        var blue = (255 * focus);
        ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";

        for (let i = 0; i < 11; i++){//loop 10 times
            ctx.fillRect(canvas.width - barWidth - offset,  offset + 5 + volumeHeight - ((volumeHeight/10) * i) - 2.5, barWidth, barHeight);
        }

        focus = focus - 0.01
    }



    //draw song progress bar box container
    var red = (127);
    var green = (127);
    var blue = (127);
    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(0 + (offset * 2),  0 + offset, canvas.width - (offset * 4), 20);
    //draw song progress bar

    var red = (255);
    var green = (0);
    var blue = (0);

    var durationScale = progress/duration 
    

    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(5 + (offset * 2),  5 + offset, (canvas.width - ((5 + (offset * 2)) * 2))  * durationScale, 20 - 10);
}













































/*
const button1 = document.getElementById("button1");
let audio1 = new Audio();
audio1.src = "../aRadio/Bad Apple.mp3";
const audioCTX = new (window.AudioContext || window.webkitAudioContext)();

button1.addEventListener("click", function(){
    audio1.play();
    audio1.addEventListener("playing", function(){
        console.log("audio 1 started");
    })
    audio1.addEventListener("ended", function(){
        console.log("Audio 1 ended");
    })
})
const button2 = document.getElementById("button2");
let audio2 = new Audio();
audio2.src = "http://stream.laut.fm/eurosmoothjazz";
button2.addEventListener("click", function(){
    audio2.play();
    audio2.addEventListener("playing", function(){
        console.log("audio 2 started");
    })
    audio2.addEventListener("ended", function(){
        console.log("Audio 2 ended");
    })
})
const button3 = document.getElementById("button3");
button3.addEventListener("click", playSound);
function playSound(){
    const oscillator = audioCTX.createOscillator();
    oscillator.connect(audioCTX.destination);
    oscillator.type = "triangle";// sine, square, sawtooth, triangle
    oscillator.start();
    setTimeout(function(){oscillator.stop();}, 1000)
}
*/