let googleChartsIsLoaded = false;
let readyToRenderChart = false;
const lifetime = {};
let categories = [
  {
    name: "Sleep",
    number: 8,
    unit: "hours",
    context: "days"
  },
  {
    name: "Work",
    number: 8,
    unit: "hours",
    context: "days"
  },
  {
    name: "Eating",
    number: 1,
    unit: "hours",
    context: "days"
  },
  {
    name: "Driving",
    number: 1,
    unit: "hours",
    context: "days"
  },
  {
    name: "Watching TV",
    number: 1,
    unit: "hours",
    context: "days"
  },
  {
    name: "Online web surfing",
    number: 1,
    unit: "hours",
    context: "days"
  },
  {
    name: "Trying to sleep",
    number: 30,
    unit: "minutes",
    context: "days"
  },
  {
    name: "Showering",
    number: 30,
    unit: "minutes",
    context: "days"
  },
  {
    name: "Brushing teeth",
    number: 10,
    unit: "minutes",
    context: "days"
  },
  {
    name: "Getting ready/dressed",
    number: 10,
    unit: "minutes",
    context: "days"
  },
  {
    name: "On the toilet",
    number: 20,
    unit: "minutes",
    context: "days"
  },
  {
    name: "Watching movies",
    number: 6,
    unit: "hours",
    context: "months"
  },
  {
    name: "Exercising at the gym",
    number: 5,
    unit: "hours",
    context: "weeks"
  },
  {
    name: "Cooking",
    number: 4,
    unit: "hours",
    context: "weeks"
  },
  {
    name: "Cleaning/chores",
    number: 90,
    unit: "minutes",
    context: "weeks"
  },
  {
    name: "Shaving",
    number: 1,
    unit: "hours",
    context: "weeks"
  }
];
let chartData = [];

const units = ["years", "months", "days", "hours", "minutes"];
const lsOptions = { maximumFractionDigits: 1 };
const beginningFormElement = document.getElementById("beginning-form");
const lifetimeCalcElement = document.getElementById("lifetime-calculator");
const lsoElements = {};
units.forEach(unit => {
  lsoElements[unit] = document.getElementById(`lifespan-${unit}`);
});
const categoryTable = document.getElementById("category-table");
const categoriesDiv = document.getElementById("categories");

function renderChart() {
  const data = new google.visualization.DataTable();
  data.addColumn("string", "Category");
  data.addColumn("number", "Minutes");
  data.addRows(chartData);
  const chart = new google.visualization.PieChart(
    document.getElementById("chart")
  );
  chart.draw(data, {
    width: 440,
    height: 300,
    pieHole: 0.4
  });
}

function createCategoryInput(category) {
  const { name, number, unit, context } = category;
  const div = document.createElement("div");
  div.className = "category";
  if (name === "" && number === 1) {
    div.id = "new-cat";
  }
  div.innerHTML = `
    <input type="text" placeholder="Category" value="${name}" />
    <input
      type="number"
      min="1"
      max="200"
      placeholder="1"
      value="${number}"
    />
    <select>
      <option value="hours" ${unit === "hours" ? "selected" : ""}>
        hour(s)
      </option>
      <option value="minutes" ${unit === "minutes" ? "selected" : ""}>
        minute(s)
      </option>
    </select>
    <p>every</p>
    <select>
      <option value="days" ${context === "days" ? "selected" : ""}>
        day
      </option>
      <option value="weeks" ${context === "weeks" ? "selected" : ""}>
        week
      </option>
      <option value="months" ${context === "months" ? "selected" : ""}>
        month
      </option>
    </select>
  `;
  categoriesDiv.appendChild(div);
}

function createRow(category, cDuration) {
  const tr = document.createElement("tr");
  const tds = units
    .map(
      unit => `
        <td>${cDuration.as(unit).toLocaleString("en-US", lsOptions)}</td>
      `
    )
    .join("");
  tr.innerHTML = `
    <td>${category.name}</td>
    ${tds}
  `;
  categoryTable.appendChild(tr);
}

function renderData(shouldAddInputs) {
  categoryTable.innerHTML = `
    <tr>
      <td>(Uncategorized)</td>
      <td id="ull-years"></td>
      <td id="ull-months"></td>
      <td id="ull-days"></td>
      <td id="ull-hours"></td>
      <td id="ull-minutes"></td>
    </tr>
  `;
  chartData = [];
  let totalMinutes = 0;
  categories.forEach(category => {
    const cDuration = moment.duration(
      category.number * lifetime[category.context],
      category.unit
    );
    createRow(category, cDuration);
    const minutes = cDuration.asMinutes();
    totalMinutes += minutes;
    if (shouldAddInputs) {
      createCategoryInput(category);
    }
    chartData.push([category.name, minutes]);
  });

  if (lifetime.minutes > totalMinutes) {
    const leftoverMinutes = lifetime.minutes - totalMinutes;
    const leftoverDuration = moment.duration(leftoverMinutes, "minutes");
    units.forEach(unit => {
      document.getElementById(`ull-${unit}`).innerText = leftoverDuration
        .as(unit)
        .toLocaleString("en-US", lsOptions);
    });
    chartData.push(["(Uncategorized)", leftoverMinutes]);
  } else {
    units.forEach(unit => {
      document.getElementById(`ull-${unit}`).innerText = 0;
    });
  }

  readyToRenderChart = true;
  if (googleChartsIsLoaded) {
    renderChart();
  }
  window.scrollTo(0, 0);
}

function renderLifetimeForm(lifetimeLeft) {
  beginningFormElement.style.display = "none";
  lifetimeCalcElement.style.display = "block";
  const lifetimeDuration = moment.duration(lifetimeLeft, "years");
  lifetime.weeks = lifetimeDuration.asWeeks();
  units.forEach(unit => {
    const ltdur = lifetimeDuration.as(unit);
    lifetime[unit] = ltdur;
    lsoElements[unit].innerText = ltdur.toLocaleString();
  });
  renderData(true);
}

function update() {
  const categoryElements = document.getElementsByClassName("category");
  categories = Array.from(categoryElements)
    .filter(c => c.children[0].value && c.children[1].valueAsNumber)
    .map(c => ({
      name: c.children[0].value,
      number: c.children[1].valueAsNumber,
      unit: c.children[2].value,
      context: c.children[4].value
    }));
  renderData(false);
}
document.getElementById("update").onclick = update;

function addNewCategoryInput() {
  const newCatEl = document.getElementById("new-cat");
  if (newCatEl) {
    if (!newCatEl.children[0].value || !newCatEl.children[1].value) {
      return;
    }
    newCatEl.id = "";
  }
  createCategoryInput({
    name: "",
    number: 1,
    unit: "hours",
    context: "days"
  });
}
document.getElementById("add").onclick = addNewCategoryInput;

const ageInputElement = document.getElementById("age");
const lifespanInputElement = document.getElementById("expected-lifespan");
const beginningFormErrorsElement = document.getElementById(
  "beginning-form-error"
);

function renderErrors(errors) {
  const errorHTML = errors.map(error => `<p>${error}</p>`).join("");
  beginningFormErrorsElement.innerHTML = errorHTML;
}

function submitBeginningForm() {
  beginningFormErrorsElement.innerHTML = "";
  const ageInput = ageInputElement.valueAsNumber;
  const lifespanInput = lifespanInputElement.valueAsNumber;
  const errors = [];
  // Validate
  let bothAreNumbers = true;
  if (Number.isNaN(lifespanInput)) {
    errors.push("Please enter a number for the lifespan input.");
    bothAreNumbers = false;
  }
  if (Number.isNaN(ageInput)) {
    errors.push("Please enter a number for the age input.");
    bothAreNumbers = false;
  }
  if (!bothAreNumbers) {
    renderErrors(errors);
    return;
  }
  if (lifespanInput < 2 || lifespanInput > 200) {
    errors.push(
      "Please enter a number between 2 and 200 for the lifespan input."
    );
  }
  if (ageInput < 1 || ageInput > 120) {
    errors.push("Please enter a number between 1 and 120 for the age input.");
  }
  if (ageInput >= lifespanInput) {
    errors.push(
      "Please ensure the number you entered for your age is less than the number you entered for your lifespan."
    );
  }
  if (errors.length) {
    renderErrors(errors);
    return;
  }
  // Continue
  const lifetimeLeft = lifespanInput - ageInput;
  renderLifetimeForm(lifetimeLeft);
}
document.getElementById("continue").onclick = submitBeginningForm;

google.charts.load("current", { packages: ["corechart"] });
function onLoadGoogleChartsAPI() {
  googleChartsIsLoaded = true;
  if (readyToRenderChart) {
    renderChart();
  }
}
google.charts.setOnLoadCallback(onLoadGoogleChartsAPI);
