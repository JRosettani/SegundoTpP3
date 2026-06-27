import {
  fetchGameDetail,
  fetchGameScreenshots,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../../services/service.js";

const $container = document.getElementById("game-detail");

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

if (!gameId) {
  $container.innerHTML = `<p class="error-msg">No se especificó ningún juego. <a href="/">Volver al inicio</a></p>`;
} else {
  loadDetail(gameId);
}

async function loadDetail(id) {
  try {
    const [game, screenshots] = await Promise.all([
      fetchGameDetail(id),
      fetchGameScreenshots(id),
    ]);

    renderDetail(game, screenshots);
  } catch (err) {
    console.error(err);
    $container.innerHTML = `
      <p class="error-msg">Error al cargar el juego. <a href="/">Volver al inicio</a></p>
    `;
  }
}

function renderDetail(game, screenshots) {
  const fav = isFavorite(game.id);

  const mc = game.metacritic;
  const mcColor = mc >= 75 ? "#4ade80" : mc >= 50 ? "#facc15" : "#f87171";
  const mcBadge = mc
    ? `<span class="mc-badge" style="border-color:${mcColor};color:${mcColor}">${mc}</span>`
    : "";

  const platforms = (game.platforms ?? [])
    .map((p) => p.platform.name)
    .join(" · ");

  const genres = (game.genres ?? []).map((g) => g.name).join(", ");
  const devs = (game.developers ?? []).map((d) => d.name).join(", ") || "—";

  const tags = (game.tags ?? [])
    .slice(0, 6)
    .map((t) => `<span class="tag">${t.name}</span>`)
    .join("");

  const screenshotHTML = screenshots
    .slice(0, 6)
    .map(
      (s) =>
        `<img class="screenshot" src="${s.image}" alt="screenshot" loading="lazy" />`,
    )
    .join("");

  const description = game.description || "<p>Sin descripción disponible.</p>";

  $container.innerHTML = `
    <a class="btn-back" href="/">← Volver</a>

    <div class="detail-hero" style="background-image:url('${game.background_image}')">
      <div class="detail-hero-overlay">
        <h1 class="detail-title">${game.name}</h1>
        <div class="detail-meta">
          ${mcBadge}
          <span class="detail-rating">★ ${(game.rating ?? 0).toFixed(1)} / 5</span>
          <span class="detail-release">📅 ${game.released ?? "—"}</span>
        </div>
        <button id="btn-fav" class="btn-fav-detail ${fav ? "active" : ""}">
          ${fav ? "♥ En favoritos" : "♡ Agregar a favoritos"}
        </button>
      </div>
    </div>

    <div class="detail-body">

      <section class="detail-section">
        <h2>Plataformas</h2>
        <p>${platforms || "—"}</p>
      </section>

      <section class="detail-section">
        <h2>Géneros</h2>
        <p>${genres || "—"}</p>
      </section>

      <section class="detail-section">
        <h2>Desarrollador</h2>
        <p>${devs}</p>
      </section>

      ${
        game.website
          ? `<section class="detail-section">
               <h2>Sitio web</h2>
               <a class="detail-link" href="${game.website}" target="_blank" rel="noopener">${game.website}</a>
             </section>`
          : ""
      }

      <section class="detail-section detail-description">
        <h2>Descripción</h2>
        <div class="description-text">${description}</div>
      </section>

      ${
        tags
          ? `<section class="detail-section">
               <h2>Tags</h2>
               <div class="tags-list">${tags}</div>
             </section>`
          : ""
      }

      ${
        screenshotHTML
          ? `<section class="detail-section">
               <h2>Screenshots</h2>
               <div class="screenshots-grid">${screenshotHTML}</div>
             </section>`
          : ""
      }

    </div>
  `;

  document.getElementById("btn-fav").addEventListener("click", () => {
    const $btn = document.getElementById("btn-fav");
    if (isFavorite(game.id)) {
      removeFavorite(game.id);
      $btn.textContent = "♡ Agregar a favoritos";
      $btn.classList.remove("active");
    } else {
      addFavorite({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        rating: game.rating,
        genres: game.genres,
        slug: game.slug,
      });
      $btn.textContent = "♥ En favoritos";
      $btn.classList.add("active");
    }
  });

  $container.querySelectorAll(".screenshot").forEach(($img) => {
    $img.addEventListener("click", () => openImgModal($img.src));
  });
}

function openImgModal(src) {
  const $overlay = document.createElement("div");
  $overlay.classList.add("img-modal");
  $overlay.innerHTML = `<img src="${src}" alt="screenshot ampliado" /><span class="img-modal-close">✕</span>`;
  document.body.appendChild($overlay);

  const close = () => $overlay.remove();
  $overlay.querySelector(".img-modal-close").addEventListener("click", close);
  $overlay.addEventListener("click", (e) => {
    if (e.target === $overlay) close();
  });
}
