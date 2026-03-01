document.addEventListener("DOMContentLoaded", init);

async function init() {
  const filenames = await loadIndex();
  const posts = await loadPosts(filenames);
  renderPosts(posts);
}

async function loadIndex() {
  const response = await fetch("data/microblog.json");
  if (!response.ok) throw new Error("Could not load index.json");
  return response.json();
}

async function loadPosts(filenames) {
  const posts = await Promise.all(
    filenames.map((filename) =>
      fetch(`content/microblog/${filename}`)
        .then((res) => res.text())
        .then(parseMarkdownPost)
    )
  );

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function parseMarkdownPost(text) {
  const parts = text.split("---").map((p) => p.trim());
  const metadataBlock = parts[1];
  const content = parts.slice(2).join("\n");

  const metadata = {};

  metadataBlock.split("\n").forEach((line) => {
    const [key, ...value] = line.split(":");
    metadata[key.trim()] = value.join(":").trim();
  });

  return {
    ...metadata,
    content
  };
}

function renderPosts(posts) {
  const container = document.querySelector(".posts");
  container.innerHTML = "";

  posts.forEach((post) => {
    const article = document.createElement("div");
    article.classList.add("post");

    article.innerHTML = `
      <img src="${post.avatar}" class="avatar">
      <div class="post-body">
        <div class="post-header">
          <span class="username">${post.username}</span>
          <span class="handle">${post.handle}</span>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-date">${formatDate(post.date)}</div>
      </div>
    `;

    container.appendChild(article);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
