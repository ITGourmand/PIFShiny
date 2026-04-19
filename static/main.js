// Imports
import { t, getLang, setLang } from './lang.js';
import { loadJSONLists, fetchPokemons } from './api.js';
import { initImportLogic, switchTab } from './importUI.js';
import { initSearchUI } from './searchUI.js';
import { initDetailsUI } from './detailsUI.js';

// === VARIABLES GLOBALES ===
let pokemonBaseList = {};
let pokemonSelfList = {};
let pokemons = [];

// === ÉLÉMENTS DOM ===
const mainTitle = document.getElementById("main-title");
const searchInput = document.getElementById("search");
const langBtns = document.querySelectorAll(".lang-btn");

// === INITIALISATION PRINCIPALE ===
async function init() {
  updateTitle();
  
  // Chargement des listes JSON et des Pokémon
  const lists = await loadJSONLists();
  pokemonBaseList = lists.base;
  pokemonSelfList = lists.self;
  
  pokemons = await fetchPokemons();
  
  // Initialisation de l'UI
  initImportLogic(pokemons);
  
  // Initialisation de la recherche
  const afficherDetail = initDetailsUI(pokemons, pokemonBaseList, pokemonSelfList);
  initSearchUI(pokemons, afficherDetail);
}

// === GESTION DU TITRE ET LANGUE ===
function updateTitle() {
  const lang = getLang();
  const title = t("searchTitle");
  document.getElementById("main-title").textContent = title;
  document.title = title;
  searchInput.placeholder = t("placeholder");
  document.getElementById("valider-btn").textContent = t("validate");
  document.getElementById("footer-credit").innerHTML = t("credit");

  // Mettre à jour les textes de la section import
  updateImportSectionTranslations();
}

function updateImportSectionTranslations() {
  const searchBtnText = document.getElementById("search-btn-text");
  const importBtnText = document.getElementById("import-btn-text");
  const importSpriteTitle = document.getElementById("import-sprite-title");
  const dragDropHint = document.getElementById("drag-drop-hint");
  const uploadBtn = document.getElementById("upload-btn");
  const selectPalettesTitle = document.getElementById("select-palettes-title");
  const originalLabel = document.getElementById("original-label");
  const previewTitle = document.getElementById("preview-title");
  const headPaletteTitle = document.getElementById("head-palette-title");
  const bodyPaletteTitle = document.getElementById("body-palette-title");
  const paletteSearchHead = document.getElementById("palette-search-head");
  const paletteSearchBody = document.getElementById("palette-search-body");
  const resetPalettesBtn = document.getElementById("reset-palettes-btn");
  const downloadBtn = document.getElementById("download-btn");

  if (searchBtnText) searchBtnText.textContent = t("searchBtn") || "Search";
  if (importBtnText) importBtnText.textContent = t("importSpriteBtn") || "Import Sprite";
  if (importSpriteTitle) importSpriteTitle.textContent = t("importSpriteTitle") || "Import Sprite";
  if (dragDropHint) dragDropHint.textContent = t("dragDropHint") || "Drag & drop PNG here";
  if (uploadBtn) uploadBtn.textContent = t("uploadBtn") || "Upload";
  if (selectPalettesTitle) selectPalettesTitle.textContent = t("selectPalettes") || "Select Palettes";
  if (originalLabel) originalLabel.textContent = t("original") || "Original";
  if (previewTitle) previewTitle.textContent = t("previewWithPalette") || "Preview with Palette";
  if (headPaletteTitle) headPaletteTitle.textContent = t("headPaletteLabel") || "Head Palette";
  if (bodyPaletteTitle) bodyPaletteTitle.textContent = t("bodyPaletteLabel") || "Body Palette";
  if (paletteSearchHead) paletteSearchHead.placeholder = t("searchHint") || "Search...";
  if (paletteSearchBody) paletteSearchBody.placeholder = t("searchHint") || "Search...";
  if (resetPalettesBtn) resetPalettesBtn.textContent = t("resetPalettes") || "🔄 Reset";
  if (downloadBtn) downloadBtn.textContent = t("downloadImageBtn") || "⬇️ Download Image";
}

// Gestion de la langue
langBtns.forEach((btn) => {
  btn.onclick = () => setLang(btn.id.replace("lang-", ""));
  if (window.location.search.includes("lang=" + btn.id.replace("lang-", ""))) {
    btn.classList.add("active");
  }
});

// Mise à jour du titre lors du changement d'état
window.addEventListener("popstate", updateTitle);

// === GESTION DES TABS ===
const tabSearch = document.getElementById("tab-search");
const tabImport = document.getElementById("tab-import");

if (tabSearch) {
  tabSearch.onclick = () => switchTab("search");
}
if (tabImport) {
  tabImport.onclick = () => switchTab("import");
}

// === LANCEMENT DE L'APPLICATION ===
init();
