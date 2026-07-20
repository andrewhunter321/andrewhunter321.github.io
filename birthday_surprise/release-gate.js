(() => {
  "use strict";

  // 29 August 2026 at 00:00 in Europe/London.
  // The UK is on BST then, so this is 28 August at 23:00 UTC.
  const RELEASE_AT = Date.parse("2026-08-28T23:00:00Z");

  const gate = document.getElementById("releaseGate");
  const lockButton = document.getElementById("releaseLockButton");
  const tryButton = document.getElementById("tryReleaseLock");
  const status = document.getElementById("releaseGateStatus");
  const starLayer = document.getElementById("releaseGateStars");

  const fields = {
    days: document.getElementById("releaseDays"),
    hours: document.getElementById("releaseHours"),
    minutes: document.getElementById("releaseMinutes"),
    seconds: document.getElementById("releaseSeconds")
  };

  let serverOffset = 0;
  let unlocked = false;
  let timer;
  let messageIndex = 0;

  const lockedMessages = [
    "Nice try. The lock is taking its job very seriously.",
    "Nope — future you has the key.",
    "Patience. The best surprises need a dramatic entrance.",
    "Still sealed. Andrew clearly planned ahead.",
    "The lock says: come back on 29 August ♥"
  ];

  function createStars() {
    const amount = window.innerWidth < 600 ? 62 : 105;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < amount; index += 1) {
      const star = document.createElement("i");
      star.className = "release-gate__star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--star-size", `${0.7 + Math.random() * 2.4}px`);
      star.style.setProperty("--star-opacity", `${0.24 + Math.random() * 0.72}`);
      star.style.setProperty("--star-speed", `${1.4 + Math.random() * 3.4}s`);
      star.style.setProperty("--star-delay", `${-Math.random() * 5}s`);
      fragment.appendChild(star);
    }

    starLayer.appendChild(fragment);
  }

  function now() {
    return Date.now() + serverOffset;
  }

  async function synchroniseClock() {
    // On GitHub Pages this normally uses GitHub's HTTP Date header, rather
    // than trusting only the visitor's device clock.
    if (location.protocol !== "http:" && location.protocol !== "https:") return;

    try {
      const url = new URL(location.href);
      url.searchParams.set("__birthday_clock", String(Date.now()));

      const response = await fetch(url.toString(), {
        method: "HEAD",
        cache: "no-store",
        credentials: "same-origin"
      });

      const serverDate = response.headers.get("date");
      if (serverDate) {
        const parsed = Date.parse(serverDate);
        if (Number.isFinite(parsed)) {
          serverOffset = parsed - Date.now();
        }
      }
    } catch (error) {
      // If the server clock cannot be read, the local device clock is used.
      console.info("Birthday clock is using local time.");
    }
  }

  function setNumber(element, value) {
    const next = String(value).padStart(2, "0");
    if (element.textContent === next) return;

    element.animate(
      [
        { opacity: 0.35, transform: "translateY(-5px) scale(.96)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ],
      { duration: 240, easing: "ease-out" }
    );
    element.textContent = next;
  }

  function updateCountdown() {
    const remaining = RELEASE_AT - now();

    if (remaining <= 0) {
      unlockExperience();
      return;
    }

    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1_000);

    setNumber(fields.days, days);
    setNumber(fields.hours, hours);
    setNumber(fields.minutes, minutes);
    setNumber(fields.seconds, seconds);
  }

  function burstHearts(amount = 18) {
    const rect = lockButton.getBoundingClientRect();

    for (let index = 0; index < amount; index += 1) {
      const heart = document.createElement("span");
      heart.className = "release-gate__burst-heart";
      heart.textContent = Math.random() > 0.28 ? "♥" : "✦";
      heart.style.left = `${rect.left + rect.width / 2}px`;
      heart.style.top = `${rect.top + rect.height / 2}px`;
      heart.style.setProperty("--burst-x", `${(Math.random() - 0.5) * 320}px`);
      heart.style.setProperty("--burst-y", `${-60 - Math.random() * 240}px`);
      heart.style.setProperty("--burst-r", `${(Math.random() - 0.5) * 180}deg`);
      heart.style.fontSize = `${12 + Math.random() * 20}px`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    }
  }

  function denyUnlock() {
    gate.classList.remove("denied");
    void gate.offsetWidth;
    gate.classList.add("denied");
    status.textContent = lockedMessages[messageIndex % lockedMessages.length];
    messageIndex += 1;
    burstHearts(6);
    setTimeout(() => gate.classList.remove("denied"), 600);
  }

  function unlockExperience() {
    if (unlocked) return;
    unlocked = true;
    clearInterval(timer);

    fields.days.textContent = "00";
    fields.hours.textContent = "00";
    fields.minutes.textContent = "00";
    fields.seconds.textContent = "00";
    status.textContent = "It is time. Opening your surprise…";
    tryButton.disabled = true;
    tryButton.innerHTML = 'Unlocking <span aria-hidden="true">♥</span>';

    gate.classList.add("unlocking");
    burstHearts(34);

    setTimeout(() => {
      gate.classList.add("opening");
      document.body.classList.remove("release-gated");

      if (typeof window.burstConfetti === "function") {
        window.burstConfetti(180);
      }
    }, 900);

    setTimeout(() => {
      gate.classList.add("is-hidden");
      gate.setAttribute("aria-hidden", "true");
    }, 1900);
  }

  tryButton.addEventListener("click", denyUnlock);
  lockButton.addEventListener("click", denyUnlock);

  createStars();

  synchroniseClock().finally(() => {
    updateCountdown();
    timer = window.setInterval(updateCountdown, 1000);
  });

  // Re-check GitHub's server clock periodically if the page stays open.
  window.setInterval(async () => {
    await synchroniseClock();
    updateCountdown();
  }, 300_000);
})();
