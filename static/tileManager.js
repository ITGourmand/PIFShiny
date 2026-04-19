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
  const filesBase = pokemonBaseList[poke.numero.toString()] || [];
  const filesSelf = pokemonSelfList[poke.numero.toString()] || [];
  const fileNameBase = filesBase[number - 1] || "FOUND/000.png";
  const fileNameSelf = filesSelf[number - 1] || "FOUND/000.png";
  const baseUrl = `POKEMON_BASE/${poke.numero}/${fileNameBase}`;
  const selfUrl = `POKEMON_SELF/${poke.numero}/${fileNameSelf}`;
  const palettePairs = parsePaletteLine(poke.palette);

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
                <img id="preview-normal-base" src="${baseUrl}" alt="Normal Base" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;display:${seeSelf ? "none" : "block"};">
                <img id="preview-normal-self" src="${selfUrl}" alt="Normal Self" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;display:${seeSelf ? "block" : "none"};">
            </div>
            <div style="text-align:center;margin-left:2em;">
                <div style="font-weight:bold;margin-bottom:0.5em;">Shiny <button id="double-shiny-btn" style="margin-left:8px;padding:2px 10px;font-size:0.9em;border-radius:8px;border:none;background:#b388ff;color:#2a0845;cursor:pointer;">Double shiny: OFF</button></div>
                <img id="preview-shiny-base" src="" alt="Shiny Base" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;display:${seeSelf ? "none" : "block"};">
                <img id="preview-shiny-self" src="" alt="Shiny Self" style="max-width:180px;max-height:180px;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;background:#fff;display:${seeSelf ? "block" : "none"};">
            </div>
            <img id="tile-next" src="OVERLAY/arrow_right.png" style="width:38px;height:38px;cursor:pointer;margin-left:18px;user-select:none;" draggable="false">
        `;

  setTimeout(() => {
    let normalBaseImg = previewDiv.querySelector("#preview-normal-base");
    let normalSelfImg = previewDiv.querySelector("#preview-normal-self");
    let shinyBaseImg = previewDiv.querySelector("#preview-shiny-base");
    let shinySelfImg = previewDiv.querySelector("#preview-shiny-self");
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

    function updateWrapperVisibility() {
      const showSelf = seeSelf;
      normalBaseImg.style.display = showSelf ? "none" : "block";
      normalSelfImg.style.display = showSelf ? "block" : "none";
      shinyBaseImg.style.display = showSelf ? "none" : "block";
      shinySelfImg.style.display = showSelf ? "block" : "none";
    }

    function updateImages() {
      const filesBase = pokemonBaseList[poke.numero.toString()] || [];
      const filesSelf = pokemonSelfList[poke.numero.toString()] || [];
      const fileNameBase = filesBase[currentTile - 1];
      const fileNameSelf = filesSelf[currentTile - 1];

      normalBaseImg.src = fileNameBase
        ? `POKEMON_BASE/${poke.numero}/${fileNameBase}`
        : baseUrl;
      normalSelfImg.src = fileNameSelf
        ? `POKEMON_SELF/${poke.numero}/${fileNameSelf}`
        : selfUrl;

      if (!fileNameBase) {
        console.warn(
          `Image not found for the Pokémon ${poke.numero} base at index ${currentTile - 1}`,
        );
      }
      if (!fileNameSelf) {
        console.warn(
          `Image not found for the Pokémon ${poke.numero} self at index ${currentTile - 1}`,
        );
      }

      updateShinyPreview();
    }

    function updateShinyPreview() {
      if (!palettePairs.length) {
        shinyBaseImg.src = normalBaseImg.src;
        shinySelfImg.src = normalSelfImg.src;
        return;
      }

      function renderShiny(imgElement, targetElement) {
        if (imgElement.complete && imgElement.naturalWidth !== 0) {
          applyPaletteToImage(imgElement, palettePairs, doubleShiny, (url) => {
            targetElement.src = url;
          });
        } else {
          imgElement.onload = () => {
            applyPaletteToImage(imgElement, palettePairs, doubleShiny, (url) => {
              targetElement.src = url;
            });
          };
        }
      }

      renderShiny(normalBaseImg, shinyBaseImg);
      renderShiny(normalSelfImg, shinySelfImg);
    }

    updateWrapperVisibility();
    updateShinyPreview();

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
  }, 0);

  return previewDiv;
}
