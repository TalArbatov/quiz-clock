let timerID;
let line = 0;
let workTime = 20;

let startTime;
let minutes = 0;
let seconds = 0;
let tickCheck;
let dingPlayed = false;
let modalShown = false;
let isFinished = false;
let running = false;
let onBreak = false;

$(document).ready(function() {
  let ticking = new Audio("./music/tick.wav");
  let workDing = new Audio("./music/buzzer.wav");
  calcTime();

  //empty the timer circle on load
  document
    .getElementById("circle-fill")
    .setAttributeNS(null, "stroke-dasharray", "0 100");

  //set the default times display in minutes
  $("#work-box").text("Work: " + workTime / 60 + " min");
  //$('#break-box').text("Break: " + (breakTime / 60) + " min");
  $("#countdown").text(minutes + ":" + ("0" + Math.floor(seconds)).slice(-2));

  //This function controls the clock display and ticking
  function countDown(num) {
    seconds -= num;
    //play a tick if the second will change
    if (Math.floor(seconds) !== tickCheck && !onBreak) {
      ticking.play();
      tickCheck = Math.floor(seconds);
    }
    //roll over to the next minute
    if (seconds <= 0) {
      seconds = 59.9;
      minutes -= 1;
    }
    //prevent minutes from displaying -1
    if (minutes < 0) {
      minutes = 0;
    }
    //change the countdown text
    $("#countdown").text(minutes + ":" + ("0" + Math.floor(seconds)).slice(-2));
  }

  //This is the primary timing function that is called in setInterval()
  function timer() {
    let currentTime = new Date().getTime();
    //Time to work. Fill the circle.
    if (line < 100) {
      line += ((currentTime - startTime) / 1000 / workTime) * 100;
      countDown((currentTime - startTime) / 1000);
      startTime = currentTime;
      document
        .getElementById("circle-fill")
        .setAttributeNS(null, "stroke-dasharray", line + " 100");
      //
 
      //console.log("workTime: " + workTime);
      const currentLeft = minutes * 60 + Math.floor(seconds);
      //console.log("currentLeft: " + currentLeft);
      const percent = currentLeft / workTime;
      //console.log("percent: " + percent);
      $("#circle-fill").css("stroke", getColor(1 - percent));

      //
      //When break is done, start work again
    } else if (line === 0 && onBreak === true) {
      // workDing.addEventListener('ended', function() {
      //     this.currentTime = 0;
      //     this.play();
      // }, false);
      workDing.play();
      setTimeout(function() {
        console.log("TIMEOUT!!!");
        workDing.pause();
      }, 3000);
      onBreak = false;
      $("#countdown").text(workTime / 60 + ":00");
      $("#activity").text("Work");
      $("#work-slider").slider("disable");
      $("#work-box").css("background-color", "#2F364C");
      $("#work-box").css("color", "gray");
      $("#break-slider").slider("enable");
      $("#break-box").css("background-color", "#212121");
      $("#break-box").css("color", "#E0F7FA");
      minutes = workTime / 60;
      seconds = 0;
      //if the circle is full, work time is over, set up break time
    } else if (line >= 100 || onBreak === true) {
      isFinished = true;
      if (!dingPlayed) {
        dingPlayed = true;
        workDing.play();
        setTimeout(function() {
          console.log("TIMEOUT!!!");
          workDing.pause();
        }, 2000);
      }
      $("#countdown").text("נגמר הזמן");
      $("#countdown").css("font-size", "6em");
      //If this is the first iteration for break, play the break ding and set sliders, countdown, etc
      if (onBreak === false) {
        $("#break-slider").slider("disable");
        $("#break-box").css("background-color", "#2F364C");
        $("#break-box").css("color", "gray");
        $("#work-slider").slider("enable");
        $("#work-box").css("background-color", "#212121");
        $("#work-box").css("color", "#E0F7FA");
      }
    }
  }

  //functions for the start, pause, and reset buttons
  $("#start-button").click(function() {
    start();
  });

  $("#pause-button").click(function() {
    pause();
  });

 

  function start() {
    console.log('starting.....')
    dingPlayed = false;
    if (!running) {
      $("#circle-fill").css("transition", "stroke-dasharray 0.1s");
      startTime = new Date().getTime();
      timerID = setInterval(timer, 50);
      running = true;
    }
    if (!onBreak) {
      $("#activity").text("");
      $("#work-slider").slider("disable");
      $("#work-box").css("background-color", "#2F364C");
      $("#work-box").css("color", "gray");
    }
    $("#activity").addClass("animated rubberBand");
  }

 

  $("#reset-button").click(function() {
    isFinished = false;
    calcTime();
    running = false;
    //onBreak = false;
    clearInterval(timerID);
    line = 0;
    //minutes = workTime/60;
    //seconds = 0;
    $("#countdown").text(minutes + ":" + ("0" + Math.floor(seconds)).slice(-2));
    $("#activity").text("");
    $("#activity").removeClass("animated rubberBand");
    $("#work-slider").slider("enable");
    $("#work-box").css("background-color", "#212121");
    $("#work-box").css("color", "#E0F7FA");
    //$('#break-slider').slider('enable');
    //$('#break-box').css('background-color', '#212121');
    //$('#break-box').css('color', '#E0F7FA');
    $("#circle-fill").css("transition", "stroke-dasharray 1.5s ease-out");
    document
      .getElementById("circle-fill")
      .setAttributeNS(null, "stroke-dasharray", "0 100");
  });

  //increase and decrease work time
  $("#work-slider").slider({
    min: 1,
    max: 50,
    value: 25,
    range: "min",
    slide: function(event, ui) {
      workTime = ui.value * 60;
      if (!running) {
        $("#countdown").text(ui.value + ":00");
        minutes = workTime / 60;
      }
      $("#work-box").text("Work: " + ui.value + " min");
    }
  });
  
  document.body.onkeyup = function(e) {
    //if user presses enter, clock will start/stop, if clock is finished, it will reset
    if (e.keyCode == 32) {
      if (isFinished) {
        reset();
      } else {
        if (running) {
          pause();
        } else {
          start();
        }
      }
      //if user presses Tab, model will toggle
    } else if (e.keyCode == 9) {
      if(modalShown)
        $("#timerModal").modal("hide");
      else
        $("#timerModal").modal('show');
      modalShown = !modalShown;
    }
    //if user presses R, clock will reset
    else if (e.keyCode == 82) {
      reset();
    }
    else if(e.keyCode == 13) {
      if(modalShown) {
        changeTime();
        modalShown = false;        
      }
        
    }
  };

  $("#symbols").slick({
    slidesToShow: 7,
    slidesToScroll: 7,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 5,
    cssEase: "linear",
    infinite: true,
    speed: 1600,
    arrows:false,
    pauseOnFocus: false,
  });
});

function getColor(value) {
  //value from 0 to 1
  let hue = ((1 - value) * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}

let filtered = false;

//when clicking SAVE on the CHANGE TIME modal


function calcTime() {
  let time = workTime;
  minutes = 0;
  while (time > 60) {
    minutes++;
    time -= 60;
  }
  seconds = time;
  $("#countdown").text(minutes + ":" + ("0" + Math.floor(seconds)).slice(-2));
}
function pause() {
  console.log('pausing.....')
  running = false;
  clearInterval(timerID);
  $("#activity").removeClass("animated rubberBand");
}
function changeTime() {
  reset();
  line = 0;
  let newMinutes = $("#minutes").val();
  let newSeconds = $("#seconds").val();
  console.log("minutes " + newMinutes);
  console.log("seconds " + newSeconds);
  workTime = parseInt(newMinutes) * 60 + parseInt(newSeconds);

  console.log("workTime : " + workTime);
  calcTime();
  $("#timerModal").modal("hide");
}


function reset() {
  pause();

  calcTime();
  isFinished = false;
  running = false;
  clearInterval(timerID);
  line = 0;
  $("#countdown").text(minutes + ":" + ("0" + Math.floor(seconds)).slice(-2));
  $("#activity").text("");
  $("#activity").removeClass("animated rubberBand");
  $("#work-slider").slider("enable");
  $("#work-box").css("background-color", "#212121");
  $("#work-box").css("color", "#E0F7FA");
  $("#circle-fill").css("transition", "stroke-dasharray 1.5s ease-out");
  document
    .getElementById("circle-fill")
    .setAttributeNS(null, "stroke-dasharray", "0 100");
  pause();
}