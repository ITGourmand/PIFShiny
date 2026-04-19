import { parsePaletteLine, applyPaletteToImage } from "./imageUtils.js";

export function detectMaxTileInFolder(
  numero,
  folder,
  pokemonBaseList,
  pokemonSelfList,
) {
  // Sélectionner la bonne liste
  const currentList =
    folder === "POKEMON_SELF" ? pokemonSelfList : pokemonBaseList;

  // Récupérer le tableau pour ce Pokémon
  const files = currentList[numero.toString()] || [];

  // Retourne le nombre d'images disponibles (ex: 36 pour ton Pokémon n°1)
  return files.length;
}

export function initTileManager(state, updateUI) {
  const prevBtn = document.getElementById("prev-tile");
  const nextBtn = document.getElementById("next-tile");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (state.maxTile <= 1) return;
      state.currentTile =
        state.currentTile > 1 ? state.currentTile - 1 : state.maxTile;
      updateUI();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (state.maxTile <= 1) return;
      state.currentTile =
        state.currentTile < state.maxTile ? state.currentTile + 1 : 1;
      updateUI();
    };
  }
}

// Crée le div d'aperçu shiny avec navigation
export function renderPreviewShiny(
  poke,
  number = 1,
  maxTile = 1,
  seeSelf = false,
  pokemonBaseList,
  pokemonSelfList,
) {
  let minTile = 1;
  const currentList = seeSelf ? pokemonSelfList : pokemonBaseList;
  const folder = seeSelf ? "POKEMON_SELF" : "POKEMON_BASE";
  const files = currentList[poke.numero.toString()] || [];
  const fileName = files[number - 1] || "FOUND/000.png";

  // 4. Générer l'URL finale
  let imgUrl = `${folder}/${poke.numero}/${fileName}`;
  let palettePairs = parsePaletteLine(poke.palette);
  let previewDiv = document.createElement("div");
  previewDiv.className = "preview-images";
  previewDiv.style.margin = "1.5em 0 1em 0";
  previewDiv.style.display = "flex";
  previewDiv.style.alignItems = "center";
  previewDiv.style.justifyContent = "center";
  previewDiv.innerHTML = `
            <img id="tile-prev" src="OVERLAY/arrow_left.png" style="width:38px;height:38px;cursor:pointer;margin-right:18px;user-select:none;" draggable="false">
            <div style="text-align:center;">
                <div style="font-weight:bold;margin-bottom:0.5em;">Normal</div>
                <img id="preview-normal" src="${imgUrl}" alt="Normal" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;">
            </div>
            <div style="text-align:center;margin-left:2em;">
                <div style="font-weight:bold;margin-bottom:0.5em;">Shiny <button id="double-shiny-btn" style="margin-left:8px;padding:2px 10px;font-size:0.9em;border-radius:8px;border:none;background:#b388ff;color:#2a0845;cursor:pointer;">Double shiny: OFF</button></div>
                <img id="preview-shiny" src="" alt="Shiny" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;">
            </div>
            <img id="tile-next" src="OVERLAY/arrow_right.png" style="width:38px;height:38px;cursor:pointer;margin-left:18px;user-select:none;" draggable="false">
        `;
  setTimeout(() => {
    let normalImg = previewDiv.querySelector("#preview-normal");
    let shinyImg = previewDiv.querySelector("#preview-shiny");
    let doubleBtn = previewDiv.querySelector("#double-shiny-btn");
    let tilePrev = previewDiv.querySelector("#tile-prev");
    let tileNext = previewDiv.querySelector("#tile-next");
    let doubleShiny = false;
    let currentTile = number;

    function updateUrlTile() {
      const url = new URL(window.location.href);
      url.searchParams.set("current", currentTile);
      history.replaceState({}, "", url);
    }

    function updateImages() {
      const currentList = seeSelf ? pokemonSelfList : pokemonBaseList;
      const rootFolder = seeSelf ? "POKEMON_SELF" : "POKEMON_BASE";
      const files = currentList[poke.numero.toString()] || [];
      const fileName = files[currentTile - 1];

      if (fileName) {
        normalImg.src = `${rootFolder}/${poke.numero}/${fileName}`;
      } else {
        console.warn(
          `Image non trouvée pour le Pokémon ${poke.numero} à l'index ${currentTile - 1}`,
        );
      }
    }

    function updateShinyPreview() {
      if (!palettePairs.length) {
        shinyImg.src = normalImg.src;
      } else {
        applyPaletteToImage(normalImg, palettePairs, doubleShiny, (url) => {
          shinyImg.src = url;
        });
      }
    }

    normalImg.onload = updateShinyPreview;
    doubleBtn.onclick = function () {
      doubleShiny = !doubleShiny;
      doubleBtn.textContent = "Double shiny: " + (doubleShiny ? "ON" : "OFF");
      updateShinyPreview();
    };

    // Événements tuile précédente
    tilePrev.addEventListener(
      "mousedown",
      () => (tilePrev.src = "OVERLAY/arrow_left_pressed.png"),
    );
    tilePrev.addEventListener(
      "mouseup",
      () => (tilePrev.src = "OVERLAY/arrow_left_overlay.png"),
    );
    tilePrev.addEventListener(
      "mouseleave",
      () => (tilePrev.src = "OVERLAY/arrow_left.png"),
    );
    tilePrev.addEventListener("mouseenter", () => {
      tilePrev.src = "OVERLAY/arrow_left_overlay.png";
      tilePrev.style.transform = "scale(1.18)";
    });
    tilePrev.addEventListener("mouseleave", () => {
      tilePrev.src = "OVERLAY/arrow_left_overlay.png";
      tilePrev.style.transform = "scale(1)";
    });
    tilePrev.onclick = function () {
      currentTile = currentTile <= minTile ? maxTile : currentTile - 1;
      updateImages();
      updateUrlTile();
    };

    // Événements tuile suivante
    tileNext.addEventListener(
      "mousedown",
      () => (tileNext.src = "OVERLAY/arrow_right_pressed.png"),
    );
    tileNext.addEventListener(
      "mouseup",
      () => (tileNext.src = "OVERLAY/arrow_right_overlay.png"),
    );
    tileNext.addEventListener(
      "mouseleave",
      () => (tileNext.src = "OVERLAY/arrow_right.png"),
    );
    tileNext.addEventListener("mouseenter", () => {
      tileNext.src = "OVERLAY/arrow_right_overlay.png";
      tileNext.style.transform = "scale(1.18)";
    });
    tileNext.addEventListener("mouseleave", () => {
      tileNext.src = "OVERLAY/arrow_right_overlay.png";
      tileNext.style.transform = "scale(1)";
    });
    tileNext.onclick = function () {
      currentTile = currentTile >= maxTile ? minTile : currentTile + 1;
      updateImages();
      updateUrlTile();
    };

    normalImg.addEventListener("load", updateShinyPreview);
  }, 0);

  return previewDiv;
}
