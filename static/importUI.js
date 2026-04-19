import { t } from "./lang.js";
import {
  parsePaletteLine,
  combinePalettes,
  applyPaletteString,
  applyPaletteToImage,
} from "./imageUtils.js";

export function initImportLogic(pokemons) {
  let importedImage = null;
  let uploadedFile = null;
  let selectedPaletteHead = null;
  let selectedPaletteBody = null;
  let filteredPalettesHead = [];
  let filteredPalettesBody = [];

  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("file-input");
  const uploadBtn = document.getElementById("upload-btn");
  const uploadedImageElement = document.getElementById("uploaded-image");
  const paletteSection = document.getElementById("palette-section");
  const paletteSearchHead = document.getElementById("palette-search-head");
  const paletteSearchBody = document.getElementById("palette-search-body");
  const paletteListHead = document.getElementById("palette-list-head");
  const paletteListBody = document.getElementById("palette-list-body");
  const paletteDisplayHead = document.getElementById("palette-display-head");
  const paletteDisplayBody = document.getElementById("palette-display-body");
  const originalPreview = document.getElementById("original-preview");
  const palettePreview = document.getElementById("palette-preview");

  // Fonction pour gérer la sélection de fichier
  function handleFileSelect(file) {
    if (!file.type.startsWith("image/png") && !file.name.endsWith(".png")) {
      alert(t("invalidImage"));
      return;
    }
    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        importedImage = img;
        uploadedImageElement.src = e.target.result;
        uploadedImageElement.style.display = "block";
        uploadArea.style.display = "none";
        paletteSection.style.display = "block";
        originalPreview.src = e.target.result;
        updatePaletteListHead();
        updatePaletteListBody();
      };
      img.onerror = () => {
        alert(t("invalidImage"));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updatePaletteListHead() {
    const searchTerm = paletteSearchHead.value.toLowerCase();
    filteredPalettesHead = pokemons.filter((p) => {
      if (!p.palette) return false;
      const pokeName = (p.nom || "").toLowerCase();
      const pokeNum = (p.numero || "").toString();
      return pokeName.includes(searchTerm) || pokeNum.includes(searchTerm);
    });

    paletteListHead.innerHTML = "";
    if (filteredPalettesHead.length === 0) {
      paletteListHead.innerHTML =
        '<div style="padding: 1em; color: #b388ff; text-align: center;">Aucune palette trouvée</div>';
      return;
    }

    filteredPalettesHead.forEach((poke, index) => {
      const item = document.createElement("div");
      item.className = "palette-item";
      if (selectedPaletteHead && selectedPaletteHead.numero === poke.numero) {
        item.classList.add("selected");
      }
      item.innerHTML = `<span>#${poke.numero} - ${poke.nom}</span><span style="font-size: 0.9em; opacity: 0.8;">►</span>`;
      item.onclick = () => selectPaletteHead(poke, index);
      paletteListHead.appendChild(item);
    });
  }

  function updatePaletteListBody() {
    const searchTerm = paletteSearchBody.value.toLowerCase();
    filteredPalettesBody = pokemons.filter((p) => {
      if (!p.palette) return false;
      const pokeName = (p.nom || "").toLowerCase();
      const pokeNum = (p.numero || "").toString();
      return pokeName.includes(searchTerm) || pokeNum.includes(searchTerm);
    });

    paletteListBody.innerHTML = "";
    if (filteredPalettesBody.length === 0) {
      paletteListBody.innerHTML =
        '<div style="padding: 1em; color: #b388ff; text-align: center;">Aucune palette trouvée</div>';
      return;
    }

    filteredPalettesBody.forEach((poke, index) => {
      const item = document.createElement("div");
      item.className = "palette-item";
      if (selectedPaletteBody && selectedPaletteBody.numero === poke.numero) {
        item.classList.add("selected");
      }
      item.innerHTML = `<span>#${poke.numero} - ${poke.nom}</span><span style="font-size: 0.9em; opacity: 0.8;">►</span>`;
      item.onclick = () => selectPaletteBody(poke, index);
      paletteListBody.appendChild(item);
    });
  }

  function selectPaletteHead(poke, index) {
    if (selectedPaletteHead && selectedPaletteHead.numero === poke.numero) {
      selectedPaletteHead = null;
      paletteDisplayHead.textContent = "—";
      const items = paletteListHead.querySelectorAll(".palette-item");
      items.forEach((item) => item.classList.remove("selected"));
    } else {
      selectedPaletteHead = poke;
      const items = paletteListHead.querySelectorAll(".palette-item");
      items.forEach((item) => item.classList.remove("selected"));
      items[index].classList.add("selected");
      updatePaletteDisplayHead();
    }
    updatePreviewDynamic();
  }

  function selectPaletteBody(poke, index) {
    if (selectedPaletteBody && selectedPaletteBody.numero === poke.numero) {
      selectedPaletteBody = null;
      paletteDisplayBody.textContent = "—";
      const items = paletteListBody.querySelectorAll(".palette-item");
      items.forEach((item) => item.classList.remove("selected"));
    } else {
      selectedPaletteBody = poke;
      const items = paletteListBody.querySelectorAll(".palette-item");
      items.forEach((item) => item.classList.remove("selected"));
      items[index].classList.add("selected");
      updatePaletteDisplayBody();
    }
    updatePreviewDynamic();
  }

  function updatePaletteDisplayHead() {
    if (selectedPaletteHead && selectedPaletteHead.palette) {
      paletteDisplayHead.textContent = selectedPaletteHead.palette;
    } else {
      paletteDisplayHead.textContent = "—";
    }
  }

  function updatePaletteDisplayBody() {
    if (selectedPaletteBody && selectedPaletteBody.palette) {
      paletteDisplayBody.textContent = selectedPaletteBody.palette;
    } else {
      paletteDisplayBody.textContent = "—";
    }
  }

  function updatePreviewDynamic() {
    if (!importedImage) return;

    if (!selectedPaletteHead && !selectedPaletteBody) {
      palettePreview.src = "";
      palettePreview.style.display = "none";
      document.getElementById("preview-title").textContent = t("previewWithPalette");
      return;
    }

    const img = new Image();
    img.src = importedImage.src;
    img.onload = () => {
      const useBothPalettes = selectedPaletteHead && selectedPaletteBody;

      if (useBothPalettes) {
        const combinedPaletteStr = combinePalettes(
          selectedPaletteHead.palette,
          selectedPaletteBody.palette,
        );
        applyPaletteString(img, combinedPaletteStr, (url) => {
          palettePreview.src = url;
          palettePreview.style.display = "block";
          updatePreviewTitle();
        });
      } else if (selectedPaletteHead) {
        const headPairs = parsePaletteLine(selectedPaletteHead.palette);
        applyPaletteToImage(img, headPairs, false, (url) => {
          palettePreview.src = url;
          palettePreview.style.display = "block";
          updatePreviewTitle();
        });
      } else if (selectedPaletteBody) {
        const bodyPairs = parsePaletteLine(selectedPaletteBody.palette);
        applyPaletteToImage(img, bodyPairs, false, (url) => {
          palettePreview.src = url;
          palettePreview.style.display = "block";
          updatePreviewTitle();
        });
      }
    };
  }

  function updatePreviewTitle() {
    const previewTitle = document.getElementById("preview-title");
    let title = t("previewWithPalette");

    if (selectedPaletteHead && selectedPaletteBody) {
      title = `✨ ${selectedPaletteHead.nom}/${selectedPaletteBody.nom} - Double Shiny`;
    } else if (selectedPaletteHead) {
      title = `${selectedPaletteHead.nom}`;
    } else if (selectedPaletteBody) {
      title = `${selectedPaletteBody.nom}`;
    }

    if (previewTitle) {
      previewTitle.textContent = title;
    }
  }

  function resetPaletteSelection() {
    selectedPaletteHead = null;
    selectedPaletteBody = null;
    paletteSearchHead.value = "";
    paletteSearchBody.value = "";
    paletteListHead.innerHTML = "";
    paletteListBody.innerHTML = "";
    paletteDisplayHead.textContent = "—";
    paletteDisplayBody.textContent = "—";
    palettePreview.src = "";
    palettePreview.style.display = "none";
    document.getElementById("preview-title").textContent = t("previewWithPalette");
    updatePaletteListHead();
    updatePaletteListBody();
  }

  function downloadImage() {
    if (!palettePreview.src || palettePreview.src === "") {
      alert(t("applyFirstPalette") || "Veuillez d'abord appliquer une palette");
      return;
    }
    const link = document.createElement("a");
    link.href = palettePreview.src;
    link.download = `sprite_${Date.now()}.png`;
    link.click();
  }

  function resetImport() {
    importedImage = null;
    uploadedFile = null;
    selectedPaletteHead = null;
    selectedPaletteBody = null;
    filteredPalettesHead = [];
    filteredPalettesBody = [];
    uploadedImageElement.src = "";
    uploadedImageElement.style.display = "none";
    uploadArea.style.display = "block";
    paletteSection.style.display = "none";
    fileInput.value = "";
    paletteSearchHead.value = "";
    paletteSearchBody.value = "";
    paletteListHead.innerHTML = "";
    paletteListBody.innerHTML = "";
    paletteDisplayHead.textContent = "—";
    paletteDisplayBody.textContent = "—";
    palettePreview.src = "";
    palettePreview.style.display = "none";
    document.getElementById("preview-title").textContent = t("previewWithPalette");
  }

  // Event listeners
  uploadBtn.onclick = () => fileInput.click();

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  });

  paletteSearchHead.addEventListener("input", updatePaletteListHead);
  paletteSearchBody.addEventListener("input", updatePaletteListBody);

  // Boutons d'action
  let resetBtn = document.getElementById("reset-palettes-btn");
  if (resetBtn) {
    resetBtn.onclick = resetPaletteSelection;
  }

  let downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.onclick = downloadImage;
  }
}

export function switchTab(tab) {
  const searchSection = document.getElementById("search-section");
  const importSection = document.getElementById("import-section");
  const tabSearch = document.getElementById("tab-search");
  const tabImport = document.getElementById("tab-import");

  if (tab === "search") {
    searchSection.style.display = "flex";
    importSection.style.display = "none";
    tabSearch.classList.add("active");
    tabImport.classList.remove("active");
  } else {
    searchSection.style.display = "none";
    importSection.style.display = "block";
    tabSearch.classList.remove("active");
    tabImport.classList.add("active");
  }
}
