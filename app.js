// 1. Настройки анимаций — все значения в миллисекундах.
const ANIMATION = {
  sexHover: 260, // Плавность цвета и свечения при наведении.
  parentNameSlide: 280,
  parentNameDelay: 70, // Новое имя начинает входить чуть позже старого.
  paletteSlide: 180,
  paletteIndicator: 240, // Плавный переход полоски только при клике через 2+ цвета.
  createEnter: 260,
  createExit: 220,
  createStartFraction: 0.5, // Доля времени появления панели одежды.
  panelExit: 220,
  panelEnter: 280,
  parentExit: 230,
  parentEnter: 300,
  sliderDuration: 320,
  sliderDragThreshold: 5, // Порог движения мыши в экранных пикселях.
};

// CSS получает длительности из единого объекта настроек.
document.documentElement.style.setProperty(
  "--sex-hover-duration",
  `${ANIMATION.sexHover}ms`,
);
document.documentElement.style.setProperty(
  "--palette-slide-duration",
  `${ANIMATION.paletteSlide}ms`,
);

document.documentElement.style.setProperty(
  "--palette-indicator-duration",
  `${ANIMATION.paletteIndicator}ms`,
);

// 2. Данные и шаблоны интерфейса.
const titles = ["Генетика", "Лицо", "Внешность", "Причёска", "Одежда"];
const classes = ["genetics", "face", "appearance", "hair", "clothes"];
const headers = [
  "gen-imgFrame5",
  "39-141-imgFrame",
  "39-295-imgFrame",
  "39-398-imgFrame5",
  "39-517-imgFrame5",
];
const asset = (name) => `assets/${name}.svg`;
const tabs = document.querySelector("#tabs"),
  panels = document.querySelector("#panels");
const range = (name, wide = false, ends = null, value = 50) => /* HTML */ `
  <label class="control ${wide ? "wide" : ""}">
    <span class="control-title">${name}</span>
    <span class="range-row">
      ${ends
        ? /* HTML */ `
            <span>${ends[0]}</span>
          `
        : ""}
      <input
        class="range"
        aria-label="${name}"
        type="range"
        min="0"
        max="100"
        value="${value}"
        style="--fill:${value}%"
      />
      ${ends
        ? /* HTML */ `
            <span>${ends[1]}</span>
          `
        : ""}
    </span>
  </label>
`;
const colors = [
  "#9f9f9f",
  "#569e4c",
  "#aefff0",
  "#a236b1",
  "#3957d0",
  "#ff87f1",
  "#ffb355",
  "#64dfae",
  "#925f22",
  "#8c3a3a",
  "#856b97",
  "#7e6868",
  "#3f2020",
  "#272727",
  "#141313",
  "#402d26",
  "#6b4431",
  "#a26c43",
  "#c7945e",
  "#e2bc80",
  "#f0dca6",
  "#e9e5d7",
  "#6e8790",
  "#466e7a",
  "#2b474c",
  "#6f7444",
  "#a59b68",
  "#aa443b",
  "#6c294f",
  "#ddd6ef",
];
const PALETTE_VISIBLE = 14;
const palette = (label = "Цвет глаз", key = "eyeColor") => /* HTML */ `
  <div class="palette">
    <div class="palette-label">${label}</div>
    <div
      class="palette-viewport"
      data-palette="${key}"
      aria-label="${label}"
      role="group"
    >
      <div class="swatches">
        ${Array.from({ length: colors.length * 3 }, (_, position) => {
          const index = position % colors.length;
          return /* HTML */ `
            <button
              class="swatch"
              data-color="${colors[index]}"
              data-index="${index}"
              data-position="${position}"
              style="background:${colors[index]}"
              aria-label="${label} ${index + 1}"
              aria-pressed="${position === colors.length}"
              tabindex="${position === colors.length ? 0 : -1}"
            ></button>
          `;
        }).join("")}
      </div>
      <span class="palette-indicator" aria-hidden="true"></span>
    </div>
  </div>
`;
const styles = (name) => /* HTML */ `
  <div class="styles-group">
    <div class="styles-title">${name}</div>
    <div class="style-options" role="group" aria-label="${name}">
      ${Array.from(
        { length: 7 },
        (_, i) => /* HTML */ `
          <button
            class="style-option"
            aria-label="${name}: вариант ${i + 1}"
            aria-pressed="${i === 1}"
            data-value="${i + 1}"
          >
            #${i + 1}
          </button>
        `,
      ).join("")}
    </div>
  </div>
`;
const selector = (name, key) => /* HTML */ `
  <div class="control">
    <span class="control-title">${name}</span>
    <div class="selector">
      <button
        class="arrow"
        data-parent="${key}"
        data-step="-1"
        aria-label="${name}: предыдущий вариант"
      >
        <img src="${asset("gen-imgFrame7")}" alt="" />
      </button>
      <span class="parent-name-viewport">
        <span id="${key}-name" class="parent-name">
          ${key === "mother" ? "Мисти" : "Нико"}
        </span>
      </span>
      <button
        class="arrow next"
        data-parent="${key}"
        data-step="1"
        aria-label="${name}: следующий вариант"
      >
        <img src="${asset("gen-imgFrame7")}" alt="" />
      </button>
    </div>
  </div>
`;
const content = [
  /* HTML */ `
    <input
      class="field"
      name="age"
      aria-label="Возраст"
      type="number"
      min="18"
      max="60"
      placeholder="Придумайте возраст (от 18 до 60)"
    />
    <div class="fields">
      <input
        class="field"
        name="firstName"
        aria-label="Имя"
        placeholder="Придумайте имя"
      />
      <input
        class="field"
        name="lastName"
        aria-label="Фамилия"
        placeholder="Придумайте фамилию"
      />
    </div>
    <div class="sexes" role="group" aria-label="Пол персонажа">
      <button class="sex" data-sex="male" aria-pressed="true">
        <span class="sex-symbol">
          <img src="${asset("gen-imgGroup13")}" alt="" />
        </span>
        <span>Мужской</span>
      </button>
      <button class="sex sex-female" data-sex="female" aria-pressed="false">
        <span class="sex-symbol female-symbol">
          <img src="${asset("gen-imgEllipse2")}" alt="" />
        </span>
        <span>Женский</span>
      </button>
    </div>
    <div class="parents">
      <img
        class="portrait mother"
        src="assets/gen-img221.png"
        alt="Мать — Мисти"
      />
      <img
        class="portrait father"
        src="assets/gen-img222.png"
        alt="Отец — Нико"
      />
    </div>
    <div class="parent-selectors">
      ${selector("Мать", "mother")}${selector("Отец", "father")}
    </div>
    ${range("Сходство", false, ["Мать", "Отец"], 50)}${range(
      "Тон кожи",
      false,
      ["Темнее", "Светлее"],
      50,
    )}
  `,
  /* HTML */ `
    <div class="slider-grid">
      ${[
        "Высота бровей",
        "Глубина бровей",
        "Высота скул",
        "Ширина скул",
        "Глубина щеки",
        "Глубина носа",
        "Поломанность носа",
        "Размер глаз",
        "Ширина носа",
        "Высота носа",
        "Длина кончика носа",
        "Высота кончика носа",
      ]
        .map((n) => range(n, ["Глубина щеки", "Размер глаз"].includes(n)))
        .join("")}
    </div>
    ${palette()}
  `,
  /* HTML */ `
    <div class="slider-grid">
      ${[
        "Ямочка подбородка",
        "Обхват шеи",
        "Ширина челюсти",
        "Форма челюсти",
        "Высота подбородка",
        "Ширина подбородка",
        "Глубина подбородка",
        "Толщина губ",
      ]
        .map((n) => range(n))
        .join("")}
    </div>
  `,
  palette("Цвет волос", "hairColor") +
    ["Стиль волос", "Стиль бровей", "Стиль бороды"].map(styles).join(""),
  ["Верхняя одежда", "Штаны", "Обувь"].map(styles).join(""),
];
titles.forEach((title, i) => {
  tabs.insertAdjacentHTML(
    "beforeend",
    /* HTML */ `
      <button
        class="tab"
        id="tab-${i}"
        role="tab"
        aria-label="${title}"
        title="${title}"
        aria-selected="${i === 0}"
        aria-controls="panel-${i}"
        tabindex="${i === 0 ? 0 : -1}"
        data-tab="${i}"
        style="left:${i % 2 ? 43 : 103}px;top:${390.426 + i * 60}px"
      >
        <img src="${asset("gen-imgFrame" + (i || ""))}" alt="" />
      </button>
    `,
  );
  panels.insertAdjacentHTML(
    "beforeend",
    /* HTML */ `
      <section
        id="panel-${i}"
        class="panel ${classes[i]}"
        role="tabpanel"
        aria-labelledby="tab-${i}"
        ${i ? "hidden inert" : ""}
      >
        <header>
          <span class="heading-icon">
            <img src="${asset(headers[i])}" alt="" />
          </span>
          <h1>${title}</h1>
        </header>
        ${content[i]}
      </section>
    `,
  );
});
// 3. Адаптивная сцена.
function resize() {
  // Scale controls uniformly, but let the scene fill any viewport ratio.
  const scale = Math.min(1, innerHeight / 900, innerWidth / 720);
  const stage = document.querySelector("#stage");
  stage.style.width = `${innerWidth / scale}px`;
  stage.style.height = `${innerHeight / scale}px`;
  stage.style.setProperty("--scene-height", `${innerHeight / scale}px`);
  stage.style.transform = `scale(${scale})`;
  stage.style.left = "0";
  stage.style.top = "0";
}
addEventListener("resize", resize);
resize();
// 4. Последовательное переключение панелей.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
async function animate(el, frames, duration = ANIMATION.panelExit) {
  if (reduced.matches) return;
  const a = el.animate(frames, {
    duration,
    easing: "cubic-bezier(.22,.61,.36,1)",
    fill: "none",
  });
  await a.finished;
}
let current = 0,
  requested = 0,
  switching = false;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function showCreateAction() {
  await delay(
    reduced.matches ? 0 : ANIMATION.panelEnter * ANIMATION.createStartFraction,
  );
  createAction.hidden = false;
  await animate(
    createAction,
    [
      { opacity: 0, transform: "translateY(35px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    ANIMATION.createEnter,
  );
  createAction.inert = false;
}

async function hideCreateAction() {
  createAction.inert = true;
  await animate(
    createAction,
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(35px)" },
    ],
    ANIMATION.createExit,
  );
  createAction.hidden = true;
}

async function selectTab(index) {
  requested = index;
  document.querySelectorAll(".tab").forEach((button, i) => {
    button.setAttribute("aria-selected", String(i === index));
    button.tabIndex = i === index ? 0 : -1;
  });
  if (switching) return;
  switching = true;
  try {
    while (current !== requested) {
      const old = document.querySelector(`#panel-${current}`);
      old.inert = true;
      await Promise.all([
        animate(
          old,
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: "translateX(40px)" },
          ],
          ANIMATION.panelExit,
        ),
        current === 4 ? hideCreateAction() : Promise.resolve(),
      ]);
      old.hidden = true;
      current = requested;
      const next = document.querySelector(`#panel-${current}`);
      next.hidden = false;
      await Promise.all([
        animate(
          next,
          [
            { opacity: 0, transform: "translateX(40px)" },
            { opacity: 1, transform: "translateX(0)" },
          ],
          ANIMATION.panelEnter,
        ),
        current === 4 ? showCreateAction() : Promise.resolve(),
      ]);
      next.inert = false;
    }
  } finally {
    switching = false;
  }
}

tabs.addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (b) selectTab(+b.dataset.tab);
});
tabs.addEventListener("keydown", (e) => {
  const b = e.target.closest("[data-tab]");
  if (!b) return;
  let i = +b.dataset.tab;
  if (["ArrowDown", "ArrowRight"].includes(e.key)) i = (i + 1) % 5;
  else if (["ArrowUp", "ArrowLeft"].includes(e.key)) i = (i + 4) % 5;
  else if (e.key === "Home") i = 0;
  else if (e.key === "End") i = 4;
  else return;
  e.preventDefault();
  document.querySelector(`#tab-${i}`).focus();
  selectTab(i);
});
// 5. Общие обработчики выбора.
document.querySelectorAll(".range").forEach((r) =>
  r.addEventListener("input", () => {
    r.style.setProperty("--fill", `${r.value}%`);
    emitChange();
  }),
);
document.querySelectorAll(".sex,.style-option").forEach((b) =>
  b.addEventListener("click", () => {
    b.parentElement
      .querySelectorAll("[aria-pressed]")
      .forEach((s) => s.setAttribute("aria-pressed", String(s === b)));
    emitChange();
  }),
);
// 6. Родители и синхронная анимация имени и фото.
const parentState = {
  mother: { index: 22, wanted: 22, count: 22, folder: "female", busy: false },
  father: { index: 22, wanted: 22, count: 24, folder: "male", busy: false },
};
async function slideParentName(key, name, direction) {
  const old = document.querySelector(`#${key}-name`);
  const next = old.cloneNode(false);
  next.removeAttribute("id");
  next.textContent = name;
  next.style.transform = `translateX(${-direction * 100}%)`;
  old.parentElement.append(next);
  await Promise.all([
    animate(
      old,
      [
        { transform: "translateX(0)" },
        { transform: `translateX(${direction * 100}%)` },
      ],
      ANIMATION.parentNameSlide,
    ).then(() => {
      old.style.visibility = "hidden";
    }),
    (async () => {
      await delay(reduced.matches ? 0 : ANIMATION.parentNameDelay);
      await animate(
        next,
        [
          { transform: `translateX(${-direction * 100}%)` },
          { transform: "translateX(0)" },
        ],
        ANIMATION.parentNameSlide,
      );
      next.style.transform = "translateX(0)";
    })(),
  ]);
  old.remove();
  next.id = `${key}-name`;
}

async function changeParent(key, step) {
  const parent = parentState[key];
  parent.direction = step;
  parent.wanted =
    ((parent.wanted - 1 + step + parent.count) % parent.count) + 1;
  if (parent.busy) return;
  parent.busy = true;
  const image = document.querySelector(`.portrait.${key}`);
  try {
    while (parent.index !== parent.wanted) {
      const target = parent.wanted;
      const direction = parent.direction;
      const source = `assets/faces/${parent.folder}/${target}.png`;
      const preload = new Image();
      preload.src = source;
      await preload.decode();
      const name =
        target === 22
          ? key === "mother"
            ? "Мисти"
            : "Нико"
          : `Вариант ${target}`;
      await Promise.all([
        slideParentName(key, name, direction),
        (async () => {
          await animate(
            image,
            [
              { opacity: 1, transform: "translateX(0)" },
              { opacity: 0, transform: `translateX(${direction * 35}px)` },
            ],
            ANIMATION.parentExit,
          );
          image.src = source;
          image.alt = `${key === "mother" ? "Мать" : "Отец"} — ${name}`;
          await animate(
            image,
            [
              { opacity: 0, transform: `translateX(${-direction * 20}px)` },
              { opacity: 1, transform: "translateX(0)" },
            ],
            ANIMATION.parentEnter,
          );
        })(),
      ]);
      parent.index = target;
      emitChange();
    }
  } finally {
    parent.busy = false;
  }
}

document
  .querySelectorAll("[data-parent]")
  .forEach((b) =>
    b.addEventListener("click", () =>
      changeParent(b.dataset.parent, +b.dataset.step),
    ),
  );
document.querySelector("[name=age]").addEventListener("change", (e) => {
  if (e.target.value)
    e.target.value = Math.max(18, Math.min(60, +e.target.value));
  emitChange();
});
document
  .querySelectorAll(".field")
  .forEach((f) => f.addEventListener("input", emitChange));
// 7. Состояние и API интеграции.
function readPalette(key) {
  return (
    document.querySelector(`[data-palette=${key}] .swatch[aria-pressed=true]`)
      ?.dataset.color ?? colors[0]
  );
}
function getState() {
  return {
    tab: titles[current],
    sex: document.querySelector("[data-sex][aria-pressed=true]").dataset.sex,
    age: document.querySelector("[name=age]").value,
    firstName: document.querySelector("[name=firstName]").value,
    lastName: document.querySelector("[name=lastName]").value,
    mother: parentState.mother.index,
    father: parentState.father.index,
    sliders: Object.fromEntries(
      [...document.querySelectorAll(".range")].map((r) => [
        r.ariaLabel,
        +r.value,
      ]),
    ),
    eyeColor: readPalette("eyeColor"),
    hairColor: readPalette("hairColor"),
    styles: Object.fromEntries(
      [...document.querySelectorAll(".style-options")].map((g) => [
        g.ariaLabel,
        +g.querySelector("[aria-pressed=true]").dataset.value,
      ]),
    ),
  };
}
function emitChange() {
  window.dispatchEvent(
    new CustomEvent("characterchange", { detail: getState() }),
  );
}
window.characterCreator = { getState };

// A separate placeholder layer can animate independently of the typed value.
document.querySelectorAll(".field").forEach((input) => {
  const wrap = document.createElement("label");
  wrap.className = "input-wrap";
  input.before(wrap);
  wrap.append(input);
  const caption = document.createElement("span");
  caption.className = "input-placeholder";
  caption.textContent = input.placeholder;
  caption.setAttribute("aria-hidden", "true");
  input.placeholder = "";
  wrap.append(caption);
  const sync = () => wrap.classList.toggle("has-value", input.value.length > 0);
  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  sync();
});
document.querySelectorAll(".sex").forEach((button) => {
  const backdrop = button.querySelector(".sex-symbol").cloneNode(true);
  backdrop.classList.add("sex-backdrop");
  backdrop.setAttribute("aria-hidden", "true");
  button.prepend(backdrop);
});

// 8. Ползунки: клик плавный, перетаскивание прямое.
document.querySelectorAll(".range").forEach(setupSlider);

function setupSlider(input) {
  let animationFrame = 0;
  let pointerId = null;
  let downX = 0;
  let dragging = false;
  let lastPointer = null;

  function updateThumbHover() {
    if (!lastPointer) {
      input.classList.remove("thumb-hover");
      return;
    }
    const rect = input.getBoundingClientRect();
    const scale = rect.width / input.offsetWidth;
    const center =
      rect.left +
      7.5 * scale +
      (rect.width - 15 * scale) * (+input.value / 100);
    const hit =
      Math.abs(lastPointer.x - center) <= 7.5 * scale &&
      Math.abs(lastPointer.y - (rect.top + rect.height / 2)) <= 5 * scale;
    input.classList.toggle("thumb-hover", hit);
  }
  input.parentElement.addEventListener("pointermove", (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    updateThumbHover();
  });
  input.parentElement.addEventListener("pointerleave", () => {
    lastPointer = null;
    updateThumbHover();
  });
  input.addEventListener("input", updateThumbHover);

  function cancelAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function updateValue(value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function commitValue() {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function valueAt(clientX) {
    const rect = input.getBoundingClientRect();
    const scale = rect.width / input.offsetWidth;
    const halfThumb = 7.5 * scale;
    const fraction =
      (clientX - rect.left - halfThumb) / (rect.width - 2 * halfThumb);
    return Math.max(0, Math.min(100, fraction * 100));
  }

  function glideTo(target) {
    cancelAnimation();
    if (reduced.matches) {
      updateValue(target);
      commitValue();
      return;
    }
    const startValue = +input.value;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min(
        1,
        (now - startTime) / ANIMATION.sliderDuration,
      );
      // Ease-out cubic: быстрый старт, плавное торможение к цели.
      const eased = 1 - Math.pow(1 - progress, 3);
      updateValue(startValue + (target - startValue) * eased);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        animationFrame = 0;
        commitValue();
      }
    }
    animationFrame = requestAnimationFrame(tick);
  }

  input.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || pointerId !== null) return;
    event.preventDefault();
    cancelAnimation();
    input.focus({ preventScroll: true });
    pointerId = event.pointerId;
    downX = event.clientX;
    dragging = false;
    input.setPointerCapture(pointerId);

    const rect = input.getBoundingClientRect();
    const scale = rect.width / input.offsetWidth;
    const thumbX =
      rect.left +
      7.5 * scale +
      (rect.width - 15 * scale) * (+input.value / 100);
    if (Math.abs(downX - thumbX) > 10 * scale) glideTo(valueAt(downX));
  });

  input.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    if (
      !dragging &&
      Math.abs(event.clientX - downX) < ANIMATION.sliderDragThreshold
    )
      return;
    dragging = true;
    cancelAnimation();
    updateValue(valueAt(event.clientX));
  });

  input.addEventListener("pointerup", (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    input.releasePointerCapture(event.pointerId);
    if (!animationFrame) commitValue();
    dragging = false;
  });

  input.addEventListener("pointercancel", () => {
    pointerId = null;
    dragging = false;
    cancelAnimation();
  });
  input.addEventListener("keydown", cancelAnimation);
}

// 9. Символы пола и кнопка создания.
document
  .querySelector(".sex-female .sex-symbol:not(.sex-backdrop)")
  .insertAdjacentHTML("beforeend", '<span class="sex-ring"></span>');
const createButton = document.createElement("button");
createButton.className = "create-character";
createButton.type = "button";
createButton.textContent = "Создать персонажа";
const createAction = document.createElement("div");
createAction.className = "create-action";
createAction.hidden = true;
createAction.inert = true;
createAction.append(createButton);
document.querySelector("#stage").append(createAction);
createButton.addEventListener("click", () => {
  window.dispatchEvent(
    new CustomEvent("charactercreate", { detail: getState() }),
  );
});

// Keep the glow outside the masked glyph, so its blur is not clipped.
document
  .querySelectorAll(".sex-symbol:not(.sex-backdrop)")
  .forEach((symbol) => {
    const glow = document.createElement("span");
    glow.className = "sex-glow";
    symbol.before(glow);
    glow.append(symbol);
  });

// 10. Кольцевая палитра. Три копии позволяют бесшовно пройти стык.
document.querySelectorAll(".palette-viewport").forEach((viewport) => {
  const track = viewport.querySelector(".swatches");
  const indicator = viewport.querySelector(".palette-indicator");
  const buttons = [...track.querySelectorAll(".swatch")];
  const count = colors.length;
  const pitch = 29;
  let selected = count;
  let firstVisible = count;
  let wheelTotal = 0;
  let wheelTime = 0;
  let queue = Promise.resolve();

  function render(focus = false) {
    viewport.dataset.firstVisible = String(
      ((firstVisible % count) + count) % count,
    );
    track.style.transform = `translateX(${-firstVisible * pitch}px)`;
    indicator.style.transform = `translateX(${(selected - firstVisible) * pitch}px)`;
    buttons.forEach((button, position) => {
      const visible =
        position >= firstVisible && position < firstVisible + PALETTE_VISIBLE;
      button.setAttribute("aria-pressed", String(position === selected));
      button.setAttribute("aria-hidden", String(!visible));
      button.tabIndex = position === selected ? 0 : -1;
    });
    if (focus) buttons[selected].focus({ preventScroll: true });
    viewport.scrollLeft = 0;
  }

  async function choose(action) {
    let next = selected;
    if (action.step !== undefined) next += action.step;
    else {
      // Click/Home/End select a real color in the currently used copy.
      if (action.nearest) {
        const delta =
          ((action.index - (selected % count) + count * 1.5) % count) -
          count / 2;
        next = selected + delta;
      } else {
        next = Math.floor(selected / count) * count + action.index;
      }
    }
    if (next === selected) return;
    const smoothIndicator = action.pointer && Math.abs(next - selected) >= 2;
    const previousFirstVisible = firstVisible;
    indicator.style.transition = smoothIndicator ? "" : "none";
    selected = next;
    if (selected < firstVisible) firstVisible = selected;
    if (selected >= firstVisible + PALETTE_VISIBLE)
      firstVisible = selected - PALETTE_VISIBLE + 1;
    render(action.focus);
    emitChange();
    const motionDuration = Math.max(
      firstVisible !== previousFirstVisible ? ANIMATION.paletteSlide : 0,
      smoothIndicator ? ANIMATION.paletteIndicator : 0,
    );
    if (!reduced.matches && motionDuration) await delay(motionDuration);

    // Rebase onto the identical middle copy after motion has finished.
    // The viewport pixels stay identical; no rewind animation is visible.
    const shift = (Math.floor(selected / count) - 1) * count;
    if (shift) {
      const hadFocus = viewport.contains(document.activeElement);
      track.style.transition = "none";
      selected -= shift;
      firstVisible -= shift;
      render(hadFocus);
      track.getBoundingClientRect();
      track.style.transition = "";
    }
  }

  function enqueue(action) {
    queue = queue.then(() => choose(action));
  }
  viewport.addEventListener("click", (event) => {
    const button = event.target.closest(".swatch");
    if (button)
      enqueue({
        index: +button.dataset.index,
        focus: true,
        nearest: true,
        pointer: event.detail > 0,
      });
  });
  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      const now = performance.now();
      if (now - wheelTime > 180 || Math.sign(delta) !== Math.sign(wheelTotal))
        wheelTotal = 0;
      wheelTime = now;
      wheelTotal += event.deltaMode ? delta * 30 : delta;
      if (Math.abs(wheelTotal) >= 30) {
        enqueue({ step: Math.sign(wheelTotal) });
        wheelTotal = 0;
      }
    },
    { passive: false },
  );
  viewport.addEventListener("keydown", (event) => {
    let action;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) action = { step: 1 };
    else if (["ArrowLeft", "ArrowUp"].includes(event.key))
      action = { step: -1 };
    else if (event.key === "Home") action = { index: 0 };
    else if (event.key === "End") action = { index: count - 1 };
    else return;
    event.preventDefault();
    enqueue({ ...action, focus: true });
  });
  track.style.transition = "none";
  indicator.style.transition = "none";
  render();
  track.getBoundingClientRect();
  track.style.transition = "";
});
