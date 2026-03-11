function loadSidebar() {
    fetch("partials/sidebar.html")
        .then((res) => res.text())
        .then((data) => {
            document.getElementById("sidebar").innerHTML = data;

            if (typeof initLastFM === "function") {
                initLastFM();
            }
        });
}

function loadStatus() {
    fetch("data/status.json")
        .then((res) => res.json())
        .then((data) => {
            const latest = data.statuses[0];
            document.getElementById("status-text").textContent = latest.text;
        });
}

document.addEventListener("DOMContentLoaded", () => {
    loadSidebar();
    loadStatus();
});
