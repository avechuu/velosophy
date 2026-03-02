function initLastFM() {
    const URL = "latest.json";

    const art = document.querySelector("#cover-art");
    const background = document.querySelector("#background");
    const artist = document.querySelector("#artist");
    const song = document.querySelector("#song");
    const timestamp = document.querySelector("#timestamp");

    if (!art || !artist || !song || !timestamp) return;

    async function getTrack() {
        try {
            const res = await fetch(URL + "?t=" + Date.now());
            const data = await res.json();

            if (!data.tracks || !data.tracks.length) return;

            const current = data.tracks[0];

            // Update text
            song.textContent = current.name || "Unknown Track";
            artist.textContent = current.artist || "Unknown Artist";

            // Update images
            if (current.image) {
                art.src = current.image;
                art.alt = current.name || "Album Cover";

                if (background) {
                    background.src = current.image;
                }
            }

            // Timestamp logic
            if (current.nowPlaying) {
                timestamp.textContent = "Listening right now…";
                art.classList.add("spinning");
            } else {
                art.classList.remove("spinning");

                if (current.timestamp) {
                    const time = new Date(current.timestamp * 1000);

                    timestamp.textContent =
                        "Last played: " +
                        time.toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                } else {
                    timestamp.textContent = "";
                }
            }

        } catch (err) {
            console.error("Last.fm widget error:", err);
        }
    }

    getTrack();
    setInterval(getTrack, 10000);
}
