
/* ===============================
   GLOBAL STATE
================================ */

let selectedDay = getTodayKey();

let selectedGym = "tuesday";


/* ===============================
   HELPERS
================================ */

function getTodayKey() {

    const day =
        new Date().getDay();

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    return days[day];
}


function getTodayDate() {

    return new Date().toLocaleDateString(
        "ar-DZ",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* ===============================
   CLOCK
================================ */

function updateClock() {

    const now = new Date();

    const time =
        now.toLocaleTimeString(
            "en-GB",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    document.getElementById("liveClock")
        .textContent = time;

    document.getElementById("statTime")
        .textContent =
        time.substring(0,5);

    document.getElementById("currentDate")
        .textContent =
        getTodayDate();
}

setInterval(updateClock, 1000);

updateClock();


/* ===============================
   NAVIGATION
================================ */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;

                showSection(section);

            }
        );

    });


function showSection(sectionId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    document
        .getElementById(sectionId)
        .classList.add(
            "active-page"
        );


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionId
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ===============================
   TODAY
================================ */

function renderToday() {

    const data =
        schedule[selectedDay];

    document.getElementById("todayTitle")
        .textContent = data.name;

    document.getElementById("todayTag")
        .textContent = data.tag;

    renderTimeline(
        "todayTimeline",
        data.timeline
    );

    renderSelectedDay();

    renderTasks();

    calculateProgress();
}


/* ===============================
   TIMELINE
================================ */

function renderTimeline(
    containerId,
    timeline
) {

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";

    timeline.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "timeline-row";

        row.innerHTML = `

            <div class="timestamp">
                ${item[0]}
            </div>

            <div class="activity-details">

                <strong>
                    ${item[1]}
                </strong>

                <br>

                ${item[2]}

            </div>

        `;

        container.appendChild(row);

    });
}


/* ===============================
   WEEK SELECTOR
================================ */

function renderWeekSelector() {

    const container =
        document.getElementById(
            "weekSelector"
        );

    container.innerHTML = "";

    weekOrder.forEach(day => {

        const data =
            schedule[day];

        const button =
            document.createElement("button");

        button.className =
            "day-button";

        if (day === selectedDay) {

            button.classList.add("active");
        }

        if (data.type === "gym") {

            button.classList.add("gym");
        }

        button.innerHTML = `

            <strong>
                ${data.name}
            </strong>

            <small>
                ${data.type === "gym"
                    ? "🏋️ GYM"
                    : data.tag}
            </small>

        `;

        button.addEventListener(
            "click",
            () => {

                selectedDay = day;

                renderWeekSelector();

                renderToday();

            }
        );

        container.appendChild(button);

    });
}


/* ===============================
   SELECTED DAY
================================ */

function renderSelectedDay() {

    const data =
        schedule[selectedDay];

    document.getElementById(
        "selectedDayTitle"
    ).textContent = data.name;

    document.getElementById(
        "selectedDayTag"
    ).textContent = data.tag;

    renderTimeline(
        "selectedTimeline",
        data.timeline
    );
}


/* ===============================
   TASK SYSTEM
================================ */

function taskKey() {

    const date =
        new Date()
            .toISOString()
            .split("T")[0];

    return `tasks-${date}`;
}


function getTasks() {

    return Storage.get(
        taskKey(),
        {}
    );
}


function saveTasks(tasks) {

    Storage.set(
        taskKey(),
        tasks
    );
}


function renderTasks() {

    const container =
        document.getElementById(
            "tasksList"
        );

    const tasks =
        getTasks();

    const todayTasks =
        dayTasks[selectedDay] || [];

    container.innerHTML = "";

    todayTasks.forEach(
        (task, index) => {

            const done =
                tasks[index] === true;

            const item =
                document.createElement("div");

            item.className =
                "task-item" +
                (done ? " done" : "");

            item.innerHTML = `

                <div class="task-checkbox">
                    ${done ? "✓" : ""}
                </div>

                <div class="task-name">
                    ${task}
                </div>

                <div class="task-meta">
                    ${selectedDay === getTodayKey()
                        ? "TODAY"
                        : schedule[selectedDay].name}
                </div>

            `;

            item.addEventListener(
                "click",
                () => {

                    tasks[index] =
                        !tasks[index];

                    saveTasks(tasks);

                    renderTasks();

                    calculateProgress();

                }
            );

            container.appendChild(item);

        }
    );

}


/* ===============================
   PROGRESS
================================ */

function calculateProgress() {

    const tasks =
        dayTasks[selectedDay] || [];

    const completed =
        Object.values(
            getTasks()
        ).filter(Boolean).length;

    const total =
        tasks.length;

    const percentage =
        total
            ? Math.round(
                completed / total * 100
            )
            : 0;


    document.getElementById(
        "taskCount"
    ).textContent =
        `${completed} / ${total}`;


    document.getElementById(
        "dailyPercent"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "tasksPercent"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "tasksProgressText"
    ).textContent =
        `${completed} / ${total}`;


    document.getElementById(
        "dailyProgress"
    ).style.width =
        `${percentage}%`;


    document.getElementById(
        "tasksProgress"
    ).style.width =
        `${percentage}%`;


    document.getElementById(
        "heroProgress"
    ).textContent =
        `${percentage}%`;


    calculateWeeklyProgress();
}


function calculateWeeklyProgress() {

    let completed = 0;

    let total = 0;

    weekOrder.forEach(day => {

        const tasks =
            dayTasks[day] || [];

        total += tasks.length;

        if (day === selectedDay) {

            const saved =
                getTasks();

            completed +=
                Object.values(saved)
                    .filter(Boolean)
                    .length;

        }

    });


    const percentage =
        total
            ? Math.round(
                completed / total * 100
            )
            : 0;

    document.getElementById(
        "weeklyProgress"
    ).textContent =
        `${percentage}%`;
}


/* ===============================
   NEXT ACTIVITY
================================ */

function updateNextActivity() {

    const data =
        schedule[getTodayKey()];

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    let next = null;


    for (const item of data.timeline) {

        const match =
            item[0].match(
                /^(\d{2}):(\d{2})/
            );

        if (!match) continue;

        const hour =
            Number(match[1]);

        const minute =
            Number(match[2]);

        const activityMinutes =
            hour * 60 + minute;

        if (activityMinutes > currentMinutes) {

            next = item;

            break;
        }

    }


    if (!next) {

        document.getElementById(
            "nextTime"
        ).textContent =
            "DONE";

        document.getElementById(
            "nextActivity"
        ).textContent =
            "انتهت أنشطة اليوم";

        document.getElementById(
            "nextDescription"
        ).textContent =
            "استمتع بوقتك واستعد للغد.";

        return;
    }


    document.getElementById(
        "nextTime"
    ).textContent =
        next[0];

    document.getElementById(
        "nextActivity"
    ).textContent =
        next[1];

    document.getElementById(
        "nextDescription"
    ).textContent =
        next[2];
}

setInterval(
    updateNextActivity,
    30000
);

updateNextActivity();


/* ===============================
   GYM
================================ */

function renderGym() {

    const exercises =
        gymExercises[selectedGym];

    const container =
        document.getElementById(
            "exerciseList"
        );

    container.innerHTML = "";

    exercises.forEach(
        (exercise, index) => {

            const saved =
                Storage.get(
                    `gym-${selectedGym}-${index}`,
                    {
                        sets: "",
                        reps: "",
                        weight: "",
                        done: false
                    }
                );

            const row =
                document.createElement("div");

            row.className =
                "exercise-row";

            row.innerHTML = `

                <strong>
                    ${exercise}
                </strong>

                <input
                    value="${saved.sets}"
                    placeholder="3"
                    data-field="sets"
                >

                <input
                    value="${saved.reps}"
                    placeholder="10"
                    data-field="reps"
                >

                <input
                    value="${saved.weight}"
                    placeholder="kg"
                    data-field="weight"
                >

                <input
                    type="checkbox"
                    class="exercise-check"
                    ${saved.done ? "checked" : ""}
                >

            `;

            const inputs =
                row.querySelectorAll(
                    "input"
                );

            inputs.forEach(input => {

                input.addEventListener(
                    "input",
                    () => {

                        saveExercise(
                            selectedGym,
                            index,
                            row
                        );

                    }
                );

                input.addEventListener(
                    "change",
                    () => {

                        saveExercise(
                            selectedGym,
                            index,
                            row
                        );

                    }
                );

            });

            container.appendChild(row);

        }
    );
}


function saveExercise(
    gym,
    index,
    row
) {

    const inputs =
        row.querySelectorAll(
            "input"
        );

    Storage.set(
        `gym-${gym}-${index}`,
        {
            sets: inputs[0].value,
            reps: inputs[1].value,
            weight: inputs[2].value,
            done: inputs[3].checked
        }
    );
}


document
    .querySelectorAll(".gym-day")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".gym-day")
                    .forEach(
                        b =>
                        b.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                selectedGym =
                    button.dataset.gym;

                document.getElementById(
                    "gymTitle"
                ).textContent =
                    schedule[
                        selectedGym
                    ].name +
                    " Session";

                renderGym();

            }
        );

    });


/* ===============================
   NOTES
================================ */

const dailyNotes =
    document.getElementById(
        "dailyNotes"
    );

const weeklyNotes =
    document.getElementById(
        "weeklyNotes"
    );


dailyNotes.value =
    Storage.get(
        "dailyNotes",
        ""
    );

weeklyNotes.value =
    Storage.get(
        "weeklyNotes",
        ""
    );


dailyNotes.addEventListener(
    "input",
    () => {

        Storage.set(
            "dailyNotes",
            dailyNotes.value
        );

        document.getElementById(
            "saveStatus"
        ).textContent =
            "✓ تم الحفظ تلقائيًا";

    }
);


weeklyNotes.addEventListener(
    "input",
    () => {

        Storage.set(
            "weeklyNotes",
            weeklyNotes.value
        );

    }
);


/* ===============================
   THEME
================================ */

const savedTheme =
    Storage.get(
        "theme",
        "dark"
    );

if (savedTheme === "light") {

    document.body.classList.add(
        "light"
    );
}


document
    .getElementById("themeToggle")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light"
            );

            Storage.set(
                "theme",
                document.body.classList.contains(
                    "light"
                )
                    ? "light"
                    : "dark"
            );

        }
    );


/* ===============================
   TODAY BUTTON
================================ */

document
    .getElementById("todayButton")
    .addEventListener(
        "click",
        () => {

            selectedDay =
                getTodayKey();

            renderWeekSelector();

            renderToday();

            showSection(
                "schedule"
            );

        }
    );


/* ===============================
   INITIALIZE
================================ */

renderWeekSelector();

renderToday();

renderGym();

calculateProgress();

updateNextActivity();