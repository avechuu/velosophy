fetch("data/updates.json")
    .then((response) => response.json())
    .then((data) => {
        const container = document.getElementById("updates-container");

        data.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((entry) => {
            const log = document.createElement("article");
            log.classList.add("log-entry");

            log.innerHTML = `
        <div class="log-meta">
          <span class="log-date">${entry.date}</span>
          <span class="log-type">${entry.type}</span>
        </div>
        <h2 class="log-title">${entry.title}</h2>
        <p class="log-notes">${entry.notes}</p>
      `;

            container.appendChild(log);
        });
    })
    .catch((error) => {
        console.error("Error loading updates:", error);
    });
