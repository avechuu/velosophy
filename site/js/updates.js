fetch("data/updates.json")
    .then((response) => response.json())
    .then((data) => {
        const container = document.getElementById("updates-container");

        data.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((entry) => {
            const log = document.createElement("article");
            log.classList.add("log-entry");

            const notesContent = Array.isArray(entry.notes)
                ? `<ul>${entry.notes.map((note) => `<li>${note}</li>`).join("")}</ul>`
                : `<p>${entry.notes}</p>`;

            log.innerHTML = `
        <div class="log-meta">
          <span class="log-date">${entry.date}</span>
          <span class="log-type">${entry.type}</span>
        </div>
        <h3 class="log-title">${entry.title}</h2>
        <div class="log-notes">
            ${notesContent}
        </div>
      `;

            container.appendChild(log);
        });
    })
    .catch((error) => {
        console.error("Error loading updates:", error);
    });
