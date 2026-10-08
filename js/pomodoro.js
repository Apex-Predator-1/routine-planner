
let timerSeconds = 25 * 60;

let timerInterval = null;

let timerRunning = false;


function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    document.getElementById("timerDisplay")
        .textContent =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}


function startTimer() {

    if (timerRunning) return;

    timerRunning = true;

    document.getElementById("timerStatus")
        .textContent = "FOCUS";

    timerInterval =
        setInterval(() => {

            if (timerSeconds <= 0) {

                clearInterval(timerInterval);

                timerRunning = false;

                document.getElementById("timerStatus")
                    .textContent = "DONE";

                return;
            }

            timerSeconds--;

            updateTimerDisplay();

        }, 1000);
}


function pauseTimer() {

    clearInterval(timerInterval);

    timerRunning = false;

    document.getElementById("timerStatus")
        .textContent = "PAUSED";
}


function resetTimer(minutes = 25) {

    clearInterval(timerInterval);

    timerRunning = false;

    timerSeconds = minutes * 60;

    document.getElementById("timerStatus")
        .textContent = "FOCUS";

    updateTimerDisplay();
}


document
    .getElementById("startTimer")
    .addEventListener(
        "click",
        startTimer
    );


document
    .getElementById("pauseTimer")
    .addEventListener(
        "click",
        pauseTimer
    );


document
    .getElementById("resetTimer")
    .addEventListener(
        "click",
        () => resetTimer()
    );


document
    .querySelectorAll(".timer-presets button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const minutes =
                    Number(button.dataset.minutes);

                resetTimer(minutes);
            }
        );

    });


updateTimerDisplay();