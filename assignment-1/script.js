/* ============================================================
   WebLab — Web Engineering Assignment 01
   script.js — dynamic content generation + student profile card
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   SECTION 1 — TASK 01: DYNAMIC CONTENT GENERATOR
   ------------------------------------------------------------ */

// Predefined content sets that the "Regenerate Content" button cycles through.
// [0] is the default shown on page load.
const CONTENT_SETS = [
  {
    heading: "Ideas become interfaces.",
    paragraph:
      "JavaScript connects HTML structure with CSS presentation, letting a page respond to every click and keystroke. Through the DOM, script can build, change, and remove elements as the user interacts — turning a static document into a living, breathing experience.",
    topics: [
      "HTML — Structure",
      "CSS — Styling",
      "JavaScript — Interactivity",
      "DOM — Dynamic Updates",
      "UX — User Experience",
    ],
  },
  {
    heading: "Every click tells a story.",
    paragraph:
      "The browser constantly models the page as a tree of objects. JavaScript reaches into that tree, listens for events, and rewrites what the user sees — all in real time, with zero server requests and no framework required.",
    topics: [
      "Events — Reactions",
      "Functions — Reusable Logic",
      "Validation — Trusted Input",
      "Loops — Repetition",
      "State — Memory",
    ],
  },
  {
    heading: "Fundamentals first, frameworks later.",
    paragraph:
      "Understanding how createElement, appendChild, and textContent work reveals what every modern UI library does under the hood. Mastering these primitives builds the intuition that makes advanced tools feel obvious rather than magical.",
    topics: [
      "Console — Debugging",
      "Semantics — Meaningful HTML",
      "Accessibility — Inclusive UI",
      "Responsive — Every Screen",
      "Practice — Mastery",
    ],
  },
];

// Index of the currently displayed content set.
let currentSetIndex = 0;

/** Shortcuts used by both tasks */
const $ = (selector) => document.querySelector(selector);

/**
 * Creates an element with an optional class name and safe text content.
 * Kept small and explicit so it is easy to explain in a demonstration.
 */
function makeElement(tagName, className, text) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text; // safe — no HTML parsing
  return el;
}

/**
 * TASK 01 — Renders one full content set into the three studio panels.
 * Uses document.createElement + textContent only (no innerHTML).
 */
function renderDynamicContent() {
  const set = CONTENT_SETS[currentSetIndex];

  // --- Panel A: heading ---
  const headingBox = $("#dynamic-heading");
  headingBox.textContent = ""; // clear previous content — never any stale output
  const heading = makeElement("h3", "content-in", set.heading); // .content-in = quick fade-rise
  headingBox.appendChild(heading);

  // --- Panel B: paragraph ---
  const paragraphBox = $("#dynamic-paragraph");
  paragraphBox.textContent = "";
  const paragraph = makeElement("p", "content-in", set.paragraph);
  paragraphBox.appendChild(paragraph);

  // --- Panel C: list of exactly five items ---
  const listBox = $("#dynamic-list");
  listBox.textContent = "";
  const list = document.createElement("ul");
  set.topics.forEach((topic, index) => {
    const item = document.createElement("li");
    item.style.animationDelay = `${index * 0.05}s`; // small stagger between items

    const marker = makeElement("span", "list-marker", String(index + 1).padStart(2, "0"));

    // Split "JavaScript — Interactivity" into a bold topic and a muted label.
    const separator = topic.indexOf("—");
    const topicName = separator > -1 ? topic.slice(0, separator).trim() : topic;
    const topicLabel = separator > -1 ? topic.slice(separator + 2).trim() : "";
    item.appendChild(marker);
    item.appendChild(makeElement("span", "list-topic", topicName));
    if (topicLabel) item.appendChild(makeElement("span", "list-label", topicLabel));

    list.appendChild(item);
  });
  listBox.appendChild(list);
}

/** TASK 01 — Cycles to the next predefined content set and re-renders. */
let regenerationCount = 0; // how many times the Regenerate button has been used

/** Syncs the three set chips + the counter chip with the current state. */
function syncTask1Indicator() {
  document.querySelectorAll(".set-chip").forEach((chip) => {
    const isActive = Number(chip.dataset.setIndex) === currentSetIndex;
    chip.classList.toggle("is-current", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });
  $("#regen-counter").textContent = "↻ " + regenerationCount + "×";
}

/** TASK 01 — Shows one specific content set (used by chips and the button). */
function showContentSet(index) {
  currentSetIndex = index;
  renderDynamicContent();
  syncTask1Indicator();
}

/** TASK 01 — Cycles to the next predefined content set and re-renders. */
function handleRegenerate() {
  regenerationCount = regenerationCount + 1;
  showContentSet((currentSetIndex + 1) % CONTENT_SETS.length); // wraps 3 → 1
  $("#task1-status").textContent =
    "Content regenerated — set " + (currentSetIndex + 1) + " of 3";
}

/** TASK 01 — Jump button: sets chips choose a specific content set. */
function handleSetChipClick(event) {
  const chip = event.currentTarget;
  showContentSet(Number(chip.dataset.setIndex));
  $("#task1-status").textContent =
    "Content set " + (currentSetIndex + 1) + " selected";
}

/* ------------------------------------------------------------
   SECTION 2 — TASK 02: STUDENT PROFILE GENERATOR
   ------------------------------------------------------------ */

/**
 * Calculates an exact age in whole years from a date of birth.
 * Uses calendar math (year/month/day differences), never a millisecond
 * division — so month lengths and leap years are handled correctly.
 *
 * @param {Date} dateOfBirth - validated date object
 * @returns {number} completed years
 */
function calculateAge(dateOfBirth) {
  const today = new Date(); // browser's current local date

  const birthYear = dateOfBirth.getFullYear();
  const birthMonth = dateOfBirth.getMonth();
  const birthDay = dateOfBirth.getDate();

  let age = today.getFullYear() - birthYear;

  // If this year's birthday has not happened yet, subtract one year.
  const birthdayHappened =
    today.getMonth() > birthMonth ||
    (today.getMonth() === birthMonth && today.getDate() >= birthDay);

  if (!birthdayHappened) {
    age = age - 1;
  }

  return Math.max(age, 0); // guard: same-day birth can never be negative
}

/**
 * Extracts up to two initials from a name (first word + first later word).
 * Handles extra spaces safely because of the regex split.
 *
 * @param {string} name - trimmed full name
 * @returns {string} uppercase initials, e.g. "AR"
 */
function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Formats a Date as "18 October 2026" — readable, locale-independent.
 */
function formatReadableDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Shows or clears one field's inline error message under the input.
 * An empty message clears the error and restores normal styling.
 * Also keeps aria-invalid in sync for screen readers.
 *
 * @param {string} inputId - id of the input element
 * @param {string} message - error text, or "" to clear
 */
function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const messageBox = document.getElementById(inputId + "-error");
  const hasError = message.length > 0;

  if (input) {
    input.classList.toggle("field--error", hasError);
    input.setAttribute("aria-invalid", String(hasError));
  }
  if (messageBox) {
    messageBox.textContent = message; // textContent — always safe
    messageBox.hidden = !hasError;
  }
  return hasError;
}

/** Validates the four form inputs; returns an array of error strings. */
function validateStudentForm(name, roll, section, dobValue) {
  const errors = [];

  // Trim defensively here as well — even if a future caller forgets to trim,
  // whitespace-only values are caught ("" after trimming fails every check).
  name = name.trim();
  roll = roll.trim();
  section = section.trim();

  // Text fields arrive trimmed, so "" also catches whitespace-only input.
  if (name.length < 2) {
    const message =
      name.length === 0
        ? "Full name is required."
        : "Name must contain at least 2 characters.";
    errors.push(message);
    setFieldError("student-name", message);
  } else {
    setFieldError("student-name", "");
  }

  if (roll.length === 0) {
    errors.push("Roll number is required.");
    setFieldError("student-roll", "Roll number is required.");
  } else {
    setFieldError("student-roll", "");
  }

  if (section.length === 0) {
    errors.push("Section is required.");
    setFieldError("student-section", "Section is required.");
  } else {
    setFieldError("student-section", "");
  }

  if (!dobValue) {
    errors.push("Date of birth is required.");
    setFieldError("student-dob", "Date of birth is required.");
  } else {
    setFieldError("student-dob", "");
  }

  return errors;
}

/**
 * TASK 02 — Reads + validates the form, then renders the student card.
 * Wired to the form's submit event.
 *
 * @param {SubmitEvent} event
 */
function generateStudentProfile(event) {
  event.preventDefault(); // never reload the page

  const errorBox = $("#form-error");
  const successBox = $("#profile-status");
  errorBox.hidden = true;
  successBox.hidden = true;

  // Read values, trimming text fields (roll number keeps every character,
  // including leading zeros, because it is read as plain text).
  const nameInput = $("#student-name");
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const roll = $("#student-roll").value.trim();
  const section = $("#student-section").value.trim().toUpperCase();
  const dobValue = $("#student-dob").value;

  // --- Validation ---
  const errors = validateStudentForm(name, roll, section, dobValue);

  // Parse the date and reject invalid / future dates.
  let birthDate = null;
  if (dobValue) {
    birthDate = new Date(dobValue + "T00:00:00"); // force local midnight, not UTC
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    if (isNaN(birthDate.getTime())) {
      const message = "That date could not be understood. Please pick it from the calendar.";
      errors.push(message);
      setFieldError("student-dob", message);
    } else if (birthDate > todayMidnight) {
      const message = "Date of birth cannot be in the future.";
      errors.push(message);
      setFieldError("student-dob", message);
    } else if (birthDate.getFullYear() < 1900) {
      const message = "Please enter a realistic birth year (after 1900).";
      errors.push(message);
      setFieldError("student-dob", message);
    }
  }

  // If validation failed: show messages near the form, do NOT build the card.
  if (errors.length > 0) {
    errorBox.innerHTML = ""; // safe: building DOM nodes, then textContent
    errorBox.appendChild(makeElement("strong", null, "Please fix the following:"));
    const list = document.createElement("ul");
    errors.forEach((message) => list.appendChild(makeElement("li", null, message)));
    errorBox.appendChild(list);
    errorBox.hidden = false;
    return;
  }

  // --- Generate the card ---
  const age = calculateAge(birthDate);
  const initials = getInitials(name);
  const readableDate = formatReadableDate(birthDate);

  // Populate with textContent only — user input is never parsed as HTML.
  $("#profile-initials").textContent = initials;
  $("#profile-name").textContent = name;
  $("#profile-rollnum").textContent = roll;
  $("#profile-roll").textContent = roll;
  $("#profile-section").textContent = section;
  $("#profile-dob").textContent = readableDate;
  $("#profile-age").textContent = age + (age === 1 ? " year old" : " years old");
  $("#profile-issue").textContent = "Issued " + formatReadableDate(new Date());

  // Swap empty state for the card with a subtle entrance animation.
  $("#profile-empty").hidden = true;
  const card = $("#profile-card");
  card.hidden = false;

  // Reveal the print action — it only exists while a valid card does.
  $("#print-row").hidden = false;

  successBox.textContent = "Profile card generated successfully!";
  successBox.hidden = false;

  // Restart the card entrance animation even when regenerating twice in a row.
  card.style.animation = "none";
  void card.offsetWidth; // force reflow trick — single, explained line
  card.style.animation = "";
}

/**
 * TASK 02 — Prints the generated student card.
 * A print stylesheet (style.css, @media print) restricts the printed
 * page to the card only and switches it to an ink-friendly light theme.
 */
function printStudentCard() {
  window.print();
}

/**
 * TASK 02 — Clears the form, messages, field styling and restores the
 * empty-state placeholder.
 */
function resetStudentForm() {
  const form = $("#student-form");
  form.reset();

  // Explicit clear (belt and braces) + clear every inline error message.
  ["student-name", "student-roll", "student-section", "student-dob"].forEach((id) => {
    setFieldError(id, "");
    document.getElementById(id).value = "";
  });

  // Hide error + success messages.
  $("#form-error").hidden = true;
  $("#profile-status").hidden = true;

  // Restore the empty state placeholder and hide the print action.
  $("#profile-card").hidden = true;
  $("#profile-empty").hidden = false;
  $("#print-row").hidden = true;

  // Return focus to the first field for fast re-entry.
  $("#student-name").focus();
}

/* ------------------------------------------------------------
   SECTION 3 — NAVIGATION + SCROLL EXPERIENCE
   ------------------------------------------------------------ */

/** Opens/closes the mobile hamburger menu. */
function toggleMobileMenu() {
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");
  const isOpen = toggle.getAttribute("aria-expanded") === "true";

  toggle.setAttribute("aria-expanded", String(!isOpen));
  menu.classList.toggle("is-open", !isOpen);
}

/** Closes the mobile menu (used after a link is tapped). */
function closeMobileMenu() {
  $("#nav-toggle").setAttribute("aria-expanded", "false");
  $("#nav-menu").classList.remove("is-open");
}

/** Highlights the nav link of the section currently in view. */
function initActiveLinkHighlight() {
  const links = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("main section[id]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => {
          const target = link.getAttribute("href").slice(1); // "#task-01" → "task-01"
          link.classList.toggle("is-active", target === id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/** Adds .is-visible to .reveal elements as they scroll into view. */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // reveal once only
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ------------------------------------------------------------
   SECTION 4 — WIRING (event listeners + initial render)
   ------------------------------------------------------------ */

function initApp() {
  // Task 01 — render immediately on load (required behaviour).
  renderDynamicContent();
  syncTask1Indicator();
  $("#regenerate-btn").addEventListener("click", handleRegenerate);
  document.querySelectorAll(".set-chip").forEach((chip) => {
    chip.addEventListener("click", handleSetChipClick);
  });

  // Task 02 — form submit + reset + print.
  $("#student-form").addEventListener("submit", generateStudentProfile);
  $("#reset-btn").addEventListener("click", resetStudentForm);
  $("#print-btn").addEventListener("click", printStudentCard);

  // Friendly polish: once the user starts typing, clear that field's error.
  ["student-name", "student-roll", "student-section", "student-dob"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => setFieldError(id, ""));
  });

  // Navigation.
  $("#nav-toggle").addEventListener("click", toggleMobileMenu);
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Scroll experience (both are no-ops on browsers without IO support).
  if ("IntersectionObserver" in window) {
    initScrollReveal();
    initActiveLinkHighlight();
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
}

// Run once the DOM is fully available (script is loaded without `defer`,
// so this is the safest entry point).
document.addEventListener("DOMContentLoaded", initApp);
