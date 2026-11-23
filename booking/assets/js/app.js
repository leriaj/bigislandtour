"use strict";

const bookingForm = document.querySelector("#booking-form");
const bookingResult = document.querySelector("#booking-result");
const bookingSteps = Array.from(document.querySelectorAll("[data-booking-step]"));
const progressSteps = Array.from(document.querySelectorAll("[data-progress-step]"));
const stepIndicator = document.querySelector("#step-indicator");
const stepBackButton = document.querySelector("#step-back");
const stepNextButton = document.querySelector("#step-next");
const bookingSubmitButton = document.querySelector("#booking-submit");
const wizardError = document.querySelector("#wizard-error");
const startDateInput = document.querySelector("#start-date");
const endDateInput = document.querySelector("#end-date");
const timeFields = {
  start: {
    hour: document.querySelector("#start-hour"),
    minute: document.querySelector("#start-minute"),
    period: document.querySelector("#start-period")
  },
  end: {
    hour: document.querySelector("#end-hour"),
    minute: document.querySelector("#end-minute"),
    period: document.querySelector("#end-period")
  }
};
const guestSelect = document.querySelector("#guests");
const accessibilityCheckbox = document.querySelector("#wheelchair-accessible");
const clockElement = document.querySelector("#header-clock");
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleLabel = document.querySelector("#theme-toggle-label");
const navToggle = document.querySelector("#nav-toggle");
const siteNavigation = document.querySelector("#site-navigation");
const mobileNavTools = document.querySelector("#mobile-nav-tools");
const headerCta = document.querySelector(".header-cta");
const phoneInput = document.querySelector("#customer-phone");
const serviceSelect = document.querySelector("#service");
const offeringSelect = document.querySelector("#offering-select");
const offeringLabel = document.querySelector("#offering-label");
const locationNeeds = {
  pickup: document.querySelector("#needs-pickup"),
  destination: document.querySelector("#needs-dropoff")
};
const locationFields = {
  pickup: document.querySelector("#pickup-field"),
  destination: document.querySelector("#dropoff-field")
};
const locationFieldsPanel = document.querySelector("#location-fields");
const tripMapPanel = document.querySelector("#trip-map-panel");
const pickupInput = document.querySelector("#pickup-location");
const destinationInput = document.querySelector("#destination-location");
const mapElement = document.querySelector("#trip-map");
const mapRouteLabel = document.querySelector("#map-route-label");
const openDirectionsLink = document.querySelector("#open-directions");
const mapStatus = document.querySelector("#map-status");
const routeDistance = document.querySelector("#route-distance");
const locationHelp = document.querySelector("#location-help");
const routeSelections = { pickup: null, destination: null };
const locationInputs = { pickup: pickupInput, destination: destinationInput };
const suggestionLists = {
  pickup: document.querySelector("#pickup-suggestions"),
  destination: document.querySelector("#destination-suggestions")
};
const BIG_ISLAND_BOUNDS = {
  west: -156.15,
  south: 18.75,
  east: -154.65,
  north: 20.35
};

function isOnBigIsland(point) {
  return point.lat >= BIG_ISLAND_BOUNDS.south
    && point.lat <= BIG_ISLAND_BOUNDS.north
    && point.lng >= BIG_ISLAND_BOUNDS.west
    && point.lng <= BIG_ISLAND_BOUNDS.east;
}

function filterIslandPlaces(places) {
  const seen = new Set();
  return places.filter((place) => {
    const [lng, lat] = place.geometry?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isOnBigIsland({ lat, lng })) {
      return false;
    }

    const key = formatPlaceName(place.properties).toLocaleLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function placeNavigationTools() {
  if (window.innerWidth <= 620) {
    mobileNavTools.append(clockElement, themeToggle);
  } else {
    headerCta.before(clockElement, themeToggle);
  }
}

placeNavigationTools();

function closeNavigation() {
  siteNavigation.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
}

navToggle.addEventListener("click", () => {
  const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
  siteNavigation.classList.toggle("is-open", !isExpanded);
  navToggle.setAttribute("aria-expanded", String(!isExpanded));
  navToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
});

siteNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header") && navToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
    navToggle.focus();
  }
});

window.addEventListener("resize", () => {
  placeNavigationTools();
  if (window.innerWidth > 620 && navToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
  }
});

const HAWAII_TIME_ZONE = "Pacific/Honolulu";
const today = new Date();
const currentHawaiiTime = getHawaiiDateTimeParts(today);
let localToday = formatDateValue(currentHawaiiTime);
let startDateEdited = false;
let endDateEdited = false;
let startTimeEdited = false;
let endTimeEdited = false;
startDateInput.min = localToday;
endDateInput.min = localToday;
startDateInput.value = localToday;
const defaultEndTime = addMinutesToDateTimeParts(currentHawaiiTime, 60);
endDateInput.value = formatDateValue(defaultEndTime);
document.querySelector("#year").textContent = currentHawaiiTime.year;

function getHawaiiDateTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HAWAII_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type) => Number(parts.find((part) => part.type === type).value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute")
  };
}

function formatDateValue(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function addMinutesToDateTimeParts(parts, minutes) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute + minutes));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes()
  };
}

function addSelectOptions(select, values, selectedValue) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === selectedValue;
    select.append(option);
  });
}

function initializeTimeFields(parts, prefix) {
  const hour24 = parts.hour;
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  const minute = String(parts.minute).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";

  const { hour, minute: minuteSelect, period: periodSelect } = timeFields[prefix];
  addSelectOptions(hour, Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")), hour12);
  addSelectOptions(minuteSelect, Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")), minute);
  addSelectOptions(periodSelect, ["AM", "PM"], period);
}

initializeTimeFields(currentHawaiiTime, "start");
initializeTimeFields(defaultEndTime, "end");

function updateHeaderClock() {
  const now = new Date();
  const hawaiiNow = getHawaiiDateTimeParts(now);
  const hawaiiDate = formatDateValue(hawaiiNow);
  clockElement.dateTime = now.toISOString();
  clockElement.textContent = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: HAWAII_TIME_ZONE,
    timeZoneName: "short"
  }).format(now);

  if (hawaiiDate !== localToday) {
    localToday = hawaiiDate;
    startDateInput.min = localToday;
    endDateInput.min = startDateInput.value || localToday;
    if (!startDateEdited) {
      startDateInput.value = localToday;
    }
    if (!endDateEdited && !startDateEdited) {
      const endTime = addMinutesToDateTimeParts(hawaiiNow, 60);
      endDateInput.value = formatDateValue(endTime);
      initializeTimeFields(endTime, "end");
    }
    if (!startTimeEdited) {
      initializeTimeFields(hawaiiNow, "start");
    }
    updateDateRules();
  }
}

updateHeaderClock();
window.setInterval(updateHeaderClock, 1000);

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeToggleLabel.textContent = isDark ? "Light mode" : "Dark mode";
}

const savedTheme = localStorage.getItem("booking-theme");
applyTheme(savedTheme === "dark" ? "dark" : "light");
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("booking-theme", nextTheme);
});

phoneInput.addEventListener("input", () => {
  let digits = phoneInput.value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1808")) {
    digits = digits.slice(4);
  } else if (digits.length === 10 && digits.startsWith("808")) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 7);
  phoneInput.value = digits.length > 3
    ? `${digits.slice(0, 3)}-${digits.slice(3)}`
    : digits;
});

const serviceLabels = {
  "island-tour": "Island tour",
  "hotel-transfer": "Hotel"
};
const demoNotice = "Demo notice: This is a demo website and is not owned or operated by anyone. All places listed are examples only. Preparing trip details does not send a request or confirm a service.";

let currentStep = 1;
let islandMap;
let routeLayer;
let routeRequestId = 0;
const geocodeRequestIds = { pickup: 0, destination: 0 };
let distanceKilometers = null;
let pickupMarker;
let destinationMarker;
let searchTimers = {};
let routeAbortController;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const main = document.querySelector("main");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("section-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.12 }
  );
  main.classList.add("section-reveal-ready");
  main.querySelectorAll(":scope > section").forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll(".experience-gallery").forEach((gallery) => {
  const track = gallery.querySelector(".experience-gallery__track");
  const images = Array.from(track.querySelectorAll("img"));
  const controls = gallery.querySelector(".experience-gallery__controls");
  let activeIndex = 0;
  let timer;
  let paused = false;
  let inView = true;
  let hovered = false;
  let focused = false;

  function showImage(index) {
    activeIndex = (index + images.length) % images.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    controls.querySelectorAll(".experience-gallery__dot").forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  images.forEach((image, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "experience-gallery__dot";
    dot.setAttribute("aria-label", `Show photo ${index + 1} of ${images.length}`);
    dot.addEventListener("click", () => {
      showImage(index);
      restartTimer();
    });
    controls.append(dot);
  });

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "experience-gallery__play";
  playButton.setAttribute("aria-label", "Pause automatic photo rotation");
  playButton.textContent = "Ⅱ";
  playButton.addEventListener("click", () => {
    paused = !paused;
    playButton.textContent = paused ? "▶" : "Ⅱ";
    playButton.setAttribute("aria-label", paused ? "Resume automatic photo rotation" : "Pause automatic photo rotation");
    restartTimer();
  });
  gallery.append(playButton);

  function restartTimer() {
    window.clearInterval(timer);
    if (!paused && inView && !document.hidden && !hovered && !focused) {
      timer = window.setInterval(() => showImage(activeIndex + 1), 5000);
    }
  }

  gallery.addEventListener("pointerenter", () => {
    hovered = true;
    window.clearInterval(timer);
  });
  gallery.addEventListener("pointerleave", () => {
    hovered = false;
    restartTimer();
  });
  gallery.addEventListener("focusin", () => {
    focused = true;
    window.clearInterval(timer);
  });
  gallery.addEventListener("focusout", (event) => {
    if (!gallery.contains(event.relatedTarget)) {
      focused = false;
      restartTimer();
    }
  });
  document.addEventListener("visibilitychange", restartTimer);
  if ("IntersectionObserver" in window) {
    const galleryObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      restartTimer();
    });
    galleryObserver.observe(gallery);
  }

  showImage(0);
  restartTimer();
});

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const requestedService = link.dataset.service;
    if (serviceLabels[requestedService]) {
      bookingForm.elements.namedItem("service").value = requestedService;
      updateOfferingOptions();
    }
  });
});

function showStep(stepNumber) {
  currentStep = stepNumber;
  bookingSteps.forEach((step) => {
    step.hidden = Number(step.dataset.bookingStep) !== stepNumber;
  });
  progressSteps.forEach((step) => {
    const number = Number(step.dataset.progressStep);
    step.classList.toggle("is-current", number === stepNumber);
    step.classList.toggle("is-complete", number < stepNumber);
    if (number === stepNumber) {
      step.setAttribute("aria-current", "step");
    } else {
      step.removeAttribute("aria-current");
    }
  });
  stepIndicator.firstChild.textContent = `0${stepNumber} `;
  stepBackButton.hidden = stepNumber === 1;
  stepNextButton.hidden = stepNumber === bookingSteps.length;
  bookingSubmitButton.hidden = stepNumber !== bookingSteps.length;
  wizardError.hidden = true;

  if (stepNumber === 3) {
    updateLocationRequirements();
    serviceSelect.focus({ preventScroll: true });
  } else {
    bookingSteps[stepNumber - 1].querySelector("input, select, button")?.focus({ preventScroll: true });
  }
}

function showWizardError(message, field) {
  wizardError.textContent = message;
  wizardError.hidden = false;
  field?.focus();
}

function validateCurrentStep() {
  const step = bookingSteps[currentStep - 1];
  const fields = Array.from(step.querySelectorAll("input, select, textarea"))
    .filter((field) => field.willValidate);

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  if (currentStep === 2) {
    endDateInput.setCustomValidity("");
    timeFields.end.period.setCustomValidity("");

    if (endDateInput.value < startDateInput.value) {
      endDateInput.setCustomValidity("End date must be on or after the start date.");
      endDateInput.reportValidity();
      return false;
    }

    if (getTripDateTime("end") <= getTripDateTime("start")) {
      timeFields.end.period.setCustomValidity("End date and time must be after the start date and time.");
      timeFields.end.period.reportValidity();
      return false;
    }
  }

  if (currentStep === 3) {
    for (const type of ["pickup", "destination"]) {
      if (locationNeeds[type].checked && !routeSelections[type]) {
        const label = type === "pickup" ? "pickup" : "drop-off";
        showWizardError(`Select a ${label} location from the suggestions or use your current location.`, locationInputs[type]);
        return false;
      }
    }
  }

  return true;
}

function formatTripDate(dateValue) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(new Date(`${dateValue}T12:00:00Z`));
}

function getTripDateTime(prefix) {
  const dateValue = prefix === "start" ? startDateInput.value : endDateInput.value;
  const { hour, minute, period } = timeFields[prefix];
  let hour24 = Number(hour.value) % 12;
  if (period.value === "PM") {
    hour24 += 12;
  }
  const [year, month, day] = dateValue.split("-").map(Number);
  return Date.UTC(year, month - 1, day, hour24, Number(minute.value));
}

function formatTripTime(formData, prefix) {
  return `${Number(formData.get(`${prefix}Hour`))}:${formData.get(`${prefix}Minute`)} ${formData.get(`${prefix}Period`)}`;
}

const offerings = {
  "hotel-transfer": [
    { value: "four-seasons-maui", label: "Four Seasons Resort Maui at Wailea" },
    { value: "four-seasons-lanai", label: "Four Seasons Resort Lanai" }
  ],
  "island-tour": [
    { value: "hana-beyond-tour", label: "HĀNA & BEYOND TOUR" }
  ]
};

function updateOfferingOptions() {
  const isHotel = serviceSelect.value === "hotel-transfer";
  offeringLabel.textContent = isHotel ? "Select a hotel" : "Select an island tour";
  offeringSelect.replaceChildren();
  offerings[serviceSelect.value].forEach((offering) => {
    const option = document.createElement("option");
    option.value = offering.value;
    option.textContent = offering.label;
    offeringSelect.append(option);
  });
}

function updateLocationRequirements() {
  const needsAnyLocation = Object.values(locationNeeds).some((checkbox) => checkbox.checked);
  locationFieldsPanel.hidden = !needsAnyLocation;
  locationHelp.hidden = !needsAnyLocation;
  tripMapPanel.hidden = !needsAnyLocation;

  Object.entries(locationNeeds).forEach(([type, checkbox]) => {
    const field = locationFields[type];
    const input = locationInputs[type];
    field.hidden = !checkbox.checked;
    input.required = checkbox.checked;
    if (!checkbox.checked) {
      geocodeRequestIds[type] += 1;
      window.clearTimeout(searchTimers[type]);
      hideSuggestions(type);
    }
    if (!checkbox.checked && (routeSelections[type] || input.value)) {
      clearLocation(type);
    }
  });

  if (needsAnyLocation) {
    initializeMap();
    window.setTimeout(() => islandMap?.invalidateSize(), 100);
    if (!routeSelections.pickup && !routeSelections.destination) {
      mapStatus.textContent = "Select a requested pickup or drop-off location to show it on the map.";
    }
  } else {
    routeDistance.hidden = true;
    routeDistance.textContent = "";
  }
  updateRoutePreview();
}

serviceSelect.addEventListener("change", updateOfferingOptions);
Object.values(locationNeeds).forEach((checkbox) => {
  checkbox.addEventListener("change", updateLocationRequirements);
});
updateOfferingOptions();

stepNextButton.addEventListener("click", () => {
  if (validateCurrentStep()) {
    showStep(currentStep + 1);
  }
});

stepBackButton.addEventListener("click", () => {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
});

startDateInput.addEventListener("change", () => {
  startDateEdited = true;
  endDateInput.min = startDateInput.value || localToday;
  if (endDateInput.value && endDateInput.value < endDateInput.min) {
    endDateInput.value = endDateInput.min;
  }
  endDateInput.setCustomValidity("");
  timeFields.end.period.setCustomValidity("");
});

endDateInput.addEventListener("change", () => {
  endDateEdited = true;
  endDateInput.setCustomValidity("");
  timeFields.end.period.setCustomValidity("");
});

Object.values(timeFields.start).forEach((field) => {
  field.addEventListener("change", () => {
    startTimeEdited = true;
    timeFields.end.period.setCustomValidity("");
  });
});

Object.values(timeFields.end).forEach((field) => {
  field.addEventListener("change", () => {
    endTimeEdited = true;
    timeFields.end.period.setCustomValidity("");
  });
});

function formatCoordinates(point) {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

function setLocation(type, point, label) {
  const location = {
    lat: Number(point.lat),
    lng: Number(point.lng),
    label: label || formatCoordinates(point)
  };
  routeSelections[type] = location;
  locationInputs[type].value = location.label;
  updateLocationButton(type);
  updateMarker(type, location);
  updateRoutePreview();

  const otherType = type === "pickup" ? "destination" : "pickup";
  mapStatus.textContent = locationNeeds[otherType].checked && !routeSelections[otherType]
    ? `${type === "pickup" ? "Pickup" : "Drop-off"} selected. Choose the other requested location to calculate driving distance.`
    : locationNeeds[otherType].checked
      ? "Pickup and drop-off are selected; the driving distance is being calculated."
      : "Location selected. Driving distance is available when both pickup and drop-off are selected.";
}

function clearLocation(type, preserveInput = false) {
  routeSelections[type] = null;
  if (!preserveInput) {
    locationInputs[type].value = "";
  }
  updateLocationButton(type);
  const marker = type === "pickup" ? pickupMarker : destinationMarker;
  if (marker && islandMap) {
    islandMap.removeLayer(marker);
    if (type === "pickup") {
      pickupMarker = null;
    } else {
      destinationMarker = null;
    }
  }
  updateRoutePreview();
}

function createMap() {
  if (!window.L) {
    mapStatus.textContent = "The map could not be loaded. Check your internet connection and reload the page.";
    return;
  }

  islandMap = L.map(mapElement).setView([19.58, -155.55], 8);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(islandMap);
  mapStatus.textContent = "Search and select a place, or use your current location. The map displays your route and cannot be used to set locations.";
}

function initializeMap() {
  if (!islandMap) {
    createMap();
  }
}

function makeMarkerIcon(type) {
  return L.divIcon({
    className: "map-pin-icon",
    html: `<span class="map-pin map-pin--${type}"></span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 30]
  });
}

function updateMarker(type, location) {
  if (!islandMap || !window.L) {
    return;
  }
  let marker = type === "pickup" ? pickupMarker : destinationMarker;
  const latLng = [location.lat, location.lng];

  if (marker) {
    marker.setLatLng(latLng);
  } else {
    marker = L.marker(latLng, {
      draggable: false,
      icon: makeMarkerIcon(type),
      title: type === "pickup" ? "Selected pickup location" : "Selected drop-off location"
    }).addTo(islandMap);
    if (type === "pickup") {
      pickupMarker = marker;
    } else {
      destinationMarker = marker;
    }
  }

  marker.bindPopup(`<strong>${type === "pickup" ? "Pickup" : "Drop-off"}</strong><br>${location.label}`);
}

function updateLocationButton(type) {
  const input = locationInputs[type];
  const list = suggestionLists[type];
  const isSelected = Boolean(routeSelections[type]);
  input.setAttribute("aria-expanded", String(!list.hidden));
  if (!isSelected) {
    input.removeAttribute("aria-description");
  } else {
    input.setAttribute(
      "aria-description",
      `${type === "pickup" ? "Pickup" : "Drop-off"} selected: ${routeSelections[type].label}`
    );
  }
}

function updateDirectionsLink() {
  const pickup = routeSelections.pickup;
  const destination = routeSelections.destination;
  if (pickup && destination) {
    openDirectionsLink.href = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(`${pickup.lat},${pickup.lng};${destination.lat},${destination.lng}`)}`;
  } else {
    openDirectionsLink.href = "https://www.openstreetmap.org/#map=8/19.6/-155.5";
  }
}

async function updateRoutePreview() {
  const pickup = routeSelections.pickup;
  const destination = routeSelections.destination;
  routeRequestId += 1;
  const currentRequestId = routeRequestId;
  distanceKilometers = null;

  if (routeAbortController) {
    routeAbortController.abort();
    routeAbortController = null;
  }
  if (routeLayer && islandMap) {
    islandMap.removeLayer(routeLayer);
    routeLayer = null;
  }

  updateDirectionsLink();
  if (!pickup && !destination) {
    routeDistance.hidden = true;
    routeDistance.textContent = "";
    if (locationNeeds.pickup.checked && locationNeeds.destination.checked) {
      mapRouteLabel.textContent = "Choose pickup and drop-off locations";
    } else if (locationNeeds.pickup.checked) {
      mapRouteLabel.textContent = "Choose a pickup location";
    } else if (locationNeeds.destination.checked) {
      mapRouteLabel.textContent = "Choose a drop-off location";
    } else {
      mapRouteLabel.textContent = "No pickup or drop-off requested";
    }
    return;
  }

  if (!pickup || !destination) {
    routeDistance.hidden = true;
    routeDistance.textContent = "";
    const selected = pickup ?? destination;
    if (pickup && !locationNeeds.destination.checked) {
      mapRouteLabel.textContent = `Pickup · ${selected.label}`;
    } else if (destination && !locationNeeds.pickup.checked) {
      mapRouteLabel.textContent = `Drop-off · ${selected.label}`;
    } else {
      mapRouteLabel.textContent = `${pickup ? "Pickup" : "Choose pickup"} → ${destination ? "Drop-off" : "Choose drop-off"} · ${selected.label}`;
    }
    islandMap?.setView([selected.lat, selected.lng], Math.max(islandMap.getZoom(), 11));
    return;
  }

  mapRouteLabel.textContent = `${pickup.label} → ${destination.label}`;
  routeDistance.hidden = false;
  routeDistance.textContent = "Calculating driving distance…";
  routeAbortController = new AbortController();
  const coordinates = `${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}`;
  const routeUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(routeUrl, { signal: routeAbortController.signal });
    if (!response.ok) {
      throw new Error(`The routing service returned status ${response.status}.`);
    }
    const result = await response.json();
    if (currentRequestId !== routeRequestId) {
      return;
    }
    if (result.code !== "Ok" || !result.routes?.length) {
      throw new Error("No drivable route was found between the selected locations.");
    }

    const route = result.routes[0];
    distanceKilometers = route.distance / 1000;
    routeDistance.textContent = `Driving distance: ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(distanceKilometers)} km`;
    routeLayer = L.polyline(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), {
      color: "#236448",
      weight: 5,
      opacity: 0.82,
      lineJoin: "round"
    }).addTo(islandMap);
    islandMap.fitBounds(routeLayer.getBounds(), { padding: [36, 36], maxZoom: 13 });
    mapStatus.textContent = "Driving route calculated. Search and select a different location to update the route.";
  } catch (error) {
    if (error.name === "AbortError" || currentRequestId !== routeRequestId) {
      return;
    }
    routeDistance.textContent = "Driving distance is unavailable for this route.";
    mapStatus.textContent = error instanceof Error
      ? `${error.message} Check the selected locations and try again.`
      : "Could not calculate the driving distance. Check the selected locations and try again.";
  }
}

function hideSuggestions(type) {
  const list = suggestionLists[type];
  list.replaceChildren();
  list.hidden = true;
  updateLocationButton(type);
}

function selectSuggestion(type, place) {
  setLocation(type, {
    lat: Number(place.geometry.coordinates[1]),
    lng: Number(place.geometry.coordinates[0])
  }, formatPlaceName(place.properties));
  hideSuggestions(type);
  islandMap?.setView([Number(place.geometry.coordinates[1]), Number(place.geometry.coordinates[0])], 14);
}

async function searchPlaces(type, query) {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 3) {
    hideSuggestions(type);
    return;
  }

  const requestId = ++geocodeRequestIds[type];
  try {
    const params = new URLSearchParams({
      q: trimmedQuery,
      lat: "19.58",
      lon: "-155.55",
      limit: "10",
      bbox: `${BIG_ISLAND_BOUNDS.west},${BIG_ISLAND_BOUNDS.south},${BIG_ISLAND_BOUNDS.east},${BIG_ISLAND_BOUNDS.north}`
    });
    let response = await fetch(`https://photon.komoot.io/api/?${params}`);
    if (!response.ok) {
      throw new Error(`Place search returned status ${response.status}.`);
    }
    let result = await response.json();
    if (requestId !== geocodeRequestIds[type] || locationInputs[type].value.trim() !== trimmedQuery) {
      return;
    }
    let places = filterIslandPlaces(result.features ?? []);

    if (!places.length) {
      params.delete("bbox");
      params.set("limit", "50");
      response = await fetch(`https://photon.komoot.io/api/?${params}`);
      if (!response.ok) {
        throw new Error(`Place search returned status ${response.status}.`);
      }
      result = await response.json();
      if (requestId !== geocodeRequestIds[type] || locationInputs[type].value.trim() !== trimmedQuery) {
        return;
      }
      places = filterIslandPlaces(result.features ?? []);
    }

    renderSuggestions(type, places);
  } catch (error) {
    if (requestId === geocodeRequestIds[type]) {
      mapStatus.textContent = error instanceof Error
        ? `${error.message} Try another search or use your current location.`
        : "Place search is unavailable. Try again or use your current location.";
    }
  }
}

function renderSuggestions(type, places) {
  const list = suggestionLists[type];
  list.replaceChildren();

  places.forEach((place) => {
    const [lng, lat] = place.geometry?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isOnBigIsland({ lat, lng })) {
      return;
    }
    const option = document.createElement("button");
    option.type = "button";
    option.className = "location-suggestion";
    option.setAttribute("role", "option");
    option.textContent = formatPlaceName(place.properties) || formatCoordinates({
      lat: Number(place.geometry.coordinates[1]),
      lng: Number(place.geometry.coordinates[0])
    });
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => selectSuggestion(type, place));
    list.append(option);
  });

  if (!places.length) {
    const empty = document.createElement("p");
    empty.className = "location-suggestions__empty";
    empty.textContent = "No matching Big Island places. Try another search or use your current location.";
    list.append(empty);
    mapStatus.textContent = "No matching places found. Any pin on the map marks a previously selected location.";
  } else {
    mapStatus.textContent = "Select a search result to place its pin on the map.";
  }

  list.hidden = false;
  updateLocationButton(type);
}

function formatPlaceName(properties) {
  const place = properties ?? {};
  const street = [place.housenumber, place.street].filter(Boolean).join(" ");
  const locality = place.city ?? place.town ?? place.village ?? place.county;
  return [...new Set([place.name, street, locality, place.state])]
    .filter(Boolean)
    .join(", ");
}

Object.entries(locationInputs).forEach(([type, input]) => {
  input.addEventListener("input", () => {
    geocodeRequestIds[type] += 1;
    hideSuggestions(type);
    if (routeSelections[type]) {
      clearLocation(type, true);
    }
    window.clearTimeout(searchTimers[type]);
    const query = input.value;
    if (query.trim().length >= 3) {
      mapStatus.textContent = "Searching Big Island places…";
      searchTimers[type] = window.setTimeout(() => searchPlaces(type, query), 450);
    }
  });

  input.addEventListener("focus", () => {
    if (!routeSelections[type]) {
      mapStatus.textContent = `Search for a ${type} on the Big Island, then select a suggestion.`;
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSuggestions(type);
    } else if (event.key === "Enter" && !suggestionLists[type].hidden) {
      const firstSuggestion = suggestionLists[type].querySelector(".location-suggestion");
      if (firstSuggestion) {
        event.preventDefault();
        firstSuggestion.click();
      }
    }
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => hideSuggestions(type), 150);
  });
});

document.querySelectorAll("[data-current-location]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.currentLocation;
    const requestId = ++geocodeRequestIds[type];
    window.clearTimeout(searchTimers[type]);
    hideSuggestions(type);
    if (!navigator.geolocation) {
      mapStatus.textContent = "This browser does not support location access. Search for and select a place instead.";
      return;
    }

    mapStatus.textContent = "Finding your current location…";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== geocodeRequestIds[type] || !locationNeeds[type].checked) {
          return;
        }
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (!isOnBigIsland(point)) {
          mapStatus.textContent = "Your current location appears to be outside the Big Island. Search for and select a Big Island place instead.";
          return;
        }

        const label = `Current location · ${formatCoordinates(point)}`;
        setLocation(type, point, label);
        islandMap?.setView([point.lat, point.lng], 14);
      },
      (error) => {
        if (requestId !== geocodeRequestIds[type] || !locationNeeds[type].checked) {
          return;
        }
        mapStatus.textContent = error.code === error.PERMISSION_DENIED
          ? "Location access was denied. Allow browser location access or search for and select a place."
          : "Could not get your current location. Check your device location settings or search for a place.";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
});

function updateDateRules() {
  startDateInput.min = localToday;
  endDateInput.min = startDateInput.value || localToday;
  if (endDateInput.value && endDateInput.value < endDateInput.min) {
    endDateInput.value = endDateInput.min;
  }
}

startDateInput.addEventListener("change", updateDateRules);

function clearPreviousResult() {
  bookingResult.hidden = true;
  wizardError.hidden = true;
}

bookingForm.addEventListener("input", clearPreviousResult);
bookingForm.addEventListener("change", clearPreviousResult);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  wizardError.hidden = true;

  if (currentStep !== bookingSteps.length) {
    if (validateCurrentStep()) {
      showStep(currentStep + 1);
    }
    return;
  }

  if (!validateCurrentStep()) {
    return;
  }
  if (endDateInput.value < startDateInput.value) {
    showWizardError("End date must be on or after the start date.", endDateInput);
    return;
  }

  const formData = new FormData(bookingForm);
  const summary = [
    `Customer: ${formData.get("customerName")} · ${formData.get("email")} · +1 (808) ${formData.get("phone")}.`,
    `Start: ${formatTripDate(formData.get("startDate"))} at ${formatTripTime(formData, "start")}.`,
    `End: ${formatTripDate(formData.get("endDate"))} at ${formatTripTime(formData, "end")}.`,
    `${formData.get("guests")} guest${formData.get("guests") === "1" ? "" : "s"}.`,
    `Wheelchair-accessible transportation ${accessibilityCheckbox.checked ? "requested" : "not requested"}; vehicle fit and accessibility are not confirmed.`,
    `${serviceLabels[formData.get("service")]}: ${offeringSelect.selectedOptions[0].textContent}.`
  ];

  if (locationNeeds.pickup.checked) {
    summary.push(`Pickup: ${routeSelections.pickup.label}.`);
  }
  if (locationNeeds.destination.checked) {
    summary.push(`Drop-off: ${routeSelections.destination.label}.`);
  }
  if (!locationNeeds.pickup.checked && !locationNeeds.destination.checked) {
    summary.push("Pickup and drop-off not requested.");
  }
  if (distanceKilometers !== null) {
    summary.push(`Estimated driving distance: ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(distanceKilometers)} km.`);
  }
  const notes = String(formData.get("notes")).trim();
  if (notes) {
    summary.push(`Notes: ${notes}`);
  }

  bookingResult.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = "Your trip details are ready to share.";
  bookingResult.append(
    heading,
    document.createTextNode(`${summary.join(" ")} ${demoNotice}`)
  );
  bookingResult.hidden = false;
  bookingResult.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
});

showStep(1);
