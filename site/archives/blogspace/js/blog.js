// app.js

/**
 * Entry point
 */
document.addEventListener("DOMContentLoaded", async () => {
  setupMobileSidebarToggle();

  try {
    const treeData = await loadTree();
    const treeContainer = document.querySelector(".tree");

    treeContainer.innerHTML = "";

    renderRoot(treeData, treeContainer);
    setupGlobalClickHandler();
  } catch (error) {
    console.error("Failed to initialize file explorer:", error);
  }
});

function renderRoot(rootNode, container) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const ul = document.createElement("ul");

  span.textContent = `📁 ${rootNode.name}`;
  span.classList.add("folder", "open"); // open by default

  li.appendChild(span);
  li.appendChild(ul);
  container.appendChild(li);

  renderTree(rootNode, ul);
}

/**
 * Fetch tree.json
 */
async function loadTree() {
  const response = await fetch("data/blog.json");

  if (!response.ok) {
    throw new Error("Could not load tree.json");
  }

  return response.json();
}

/**
 * Recursively render folders/files
 */
function renderTree(node, container) {
  if (!node.children) return;

  node.children.forEach((child) => {
    const li = document.createElement("li");
    const span = document.createElement("span");

    if (child.type === "folder") {
      span.textContent = `📁 ${child.name}`;
    } else {
      span.textContent = `📄 ${child.name}`;
    }

    span.classList.add(child.type);

    li.appendChild(span);
    container.appendChild(li);

    if (child.type === "folder") {
      const ul = document.createElement("ul");
      li.appendChild(ul);
      renderTree(child, ul);
    }

    if (child.type === "file") {
      span.dataset.path = child.path;
    }
  });
}

/**
 * Handle folder toggle + file loading
 */
function setupGlobalClickHandler() {
  document.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.classList.contains("folder")) {
      target.classList.toggle("open");
    }

    if (target.classList.contains("file")) {
      const path = target.dataset.path;
      if (path) {
        await loadFileContent(path, target);
      }
    }
  });
}

/**
 * Load file content into main pane
 */
async function loadFileContent(path, element) {
  const contentPane = document.querySelector(".file-view");

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("File not found");

    const html = await res.text();

    // Clear previous content
    contentPane.innerHTML = "";

    // Create Shadow DOM
    const shadow = contentPane.attachShadow({ mode: "open" });
    shadow.innerHTML = html;

    setActiveFile(element);
    buildBreadcrumb(element);
  } catch (error) {
    contentPane.innerHTML = `<p style="color:red;">Error loading file.</p>`;
    console.error(error);
  }
}

function setActiveFile(selectedElement) {
  document.querySelectorAll(".file").forEach((file) => {
    file.classList.remove("active");
  });

  selectedElement.classList.add("active");
}

function buildBreadcrumb(fileElement) {
  const breadcrumbContainer = document.querySelector(".breadcrumb");
  breadcrumbContainer.innerHTML = "";

  const parts = [];
  let current = fileElement.parentElement;

  while (current) {
    const folderSpan = current.querySelector(":scope > .folder");
    if (folderSpan) {
      parts.unshift(folderSpan.textContent.replace("📁 ", ""));
    }
    current = current.parentElement.closest("li");
  }

  parts.push(fileElement.textContent.replace("📄 ", ""));

  parts.forEach((part, index) => {
    const span = document.createElement("span");
    span.textContent = part;

    breadcrumbContainer.appendChild(span);

    if (index < parts.length - 1) {
      breadcrumbContainer.appendChild(document.createTextNode(" / "));
    }
  });
}

function setupMobileSidebarToggle() {
  const toggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}
