import { t, getLang } from './lang.js';
import { detectMaxTileInFolder, renderPreviewShiny } from './tileManager.js';
import { parsePaletteLine } from './imageUtils.js';
import { getLikeCount, updateLike } from './api.js';

export function initDetailsUI(pokemons, pokemonBaseList, pokemonSelfList) {
  const searchSection = document.getElementById("search-section");
  const detailDiv = document.getElementById("pokemon-detail");
  const mainTitle = document.getElementById("main-title");
  const tabsSection = document.getElementById("tabs-section");

  return function afficherDetail(poke, varianteIndex = 0, variantes = null) {
    const urlParams = new URLSearchParams(window.location.search);
    let currentTile = parseInt(urlParams.get("current"), 10);

    const maxTileBase = detectMaxTileInFolder(poke.numero, "POKEMON_BASE", pokemonBaseList, pokemonSelfList);
    const maxTileSelf = detectMaxTileInFolder(poke.numero, "POKEMON_SELF", pokemonBaseList, pokemonSelfList);
    let maxTile = Math.max(maxTileBase, maxTileSelf);
    if (maxTile < 1) maxTile = 1;
    if (isNaN(currentTile) || currentTile < 1 || currentTile > maxTile)
      currentTile = 1;

    document.getElementById("tabs-section").style.display = "none";
    searchSection.style.display = "none";
    document.getElementById("import-section").style.display = "none";
    detailDiv.style.display = "block";
    mainTitle.textContent = `#${poke.numero} - ${poke.nom}`;

    const lang = getLang();
    if (!variantes) {
      variantes = pokemons.filter(
        (p) => p.numero && p.numero.toString() === poke.numero.toString(),
      );
    }

    // Génération du bloc de référence (FusionDex images)
    let fusiondexImgUrl = "";
    let fusiondexShinyImgUrl = "";
    if (poke.numero) {
      let numStr = poke.numero.toString().padStart(3, "0");
      fusiondexImgUrl = `FOUND/${numStr}.png`;
      fusiondexShinyImgUrl = `FOUND SHINY/${numStr}.png`;
    }
    let refBlock = `
            <div class="video-block" style="margin-bottom:1.2em;display:flex;align-items:center;gap:2em;justify-content:center;">
                <div style='text-align:center;'>
                  <b>Normal:</b><br>
                  <img src='${fusiondexImgUrl}' alt='FusionDex #${poke.numero}' style='max-width:180px;max-height:180px;display:block;margin:0.5em auto 0 auto;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;'>
                </div>
                <div style='text-align:center;'>
                  <b>Shiny:</b><br>
                  <img src='${fusiondexShinyImgUrl}' alt='FusionDex Shiny #${poke.numero}' style='max-width:180px;max-height:180px;display:block;margin:0.5em auto 0 auto;border-radius:12px;box-shadow:0 2px 8px #7c4dff44;'>
                </div>
            </div>
        `;

    // Vidéo sprite
    let spriteVideoHtml = "";
    if (poke.video_sprite) {
      let match = poke.video_sprite.match(/[?&]id=([\w-]+)/);
      let fileId = match ? match[1] : "";
      let videoUrl = fileId
        ? `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`
        : poke.video_sprite;
      spriteVideoHtml += `
                <div class="video-block" style="margin:0.7em 0 0.7em 0;">
                    <b>${t("sprite")} :</b><br>
                    <button class='dl-btn' onclick="window.open('${videoUrl}','_blank')">${t("downloadVideo")}</button>
                </div>
            `;
    }

    // Vidéo fusion
    let fusionVideoHtml = "";
    if (poke.video_fusion) {
      let match = poke.video_fusion.match(/[?&]id=([\w-]+)/);
      let fileId = match ? match[1] : "";
      let videoUrl = fileId
        ? `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`
        : poke.video_fusion;
      fusionVideoHtml += `
                <div class="video-block" style="margin:0.7em 0 0.7em 0;">
                    <b>${t("fusion")} :</b><br>
                    <button class='dl-btn' onclick="window.open('${videoUrl}','_blank')">${t("downloadVideo")}</button>
                </div>
            `;
    }

    if (!spriteVideoHtml && !fusionVideoHtml) {
      spriteVideoHtml = `<em>${t("noVideo")}</em>`;
    }

    // Palette HTML
    let paletteHtml = poke.palette
      ? `
            <div class='palette-box' style='display:flex;align-items:flex-start;gap:1em;overflow-x:auto;max-width:100%;padding:0.5em 0;'>
                <pre id='palette-pre' class='palette-pre' style='min-width:0;max-width:70vw;overflow-x:auto;white-space:pre;word-break:break-all;'>${poke.palette}</pre>
                <button id='copy-palette' class='copy-btn'>${t("copyPalette")}</button>
            </div>
        `
      : `<em>${t("noPalette")}</em>`;

    // Gestion des likes
    let author = poke["enter your discord username (for feedback)"]
      ? poke["enter your discord username (for feedback)"].trim()
      : "";
    let likeKey = `like_${poke.numero}_${author}`;
    let liked = !!localStorage.getItem(likeKey);
    let likeBtnText = liked ? `${t("unlike")} (...)` : `${t("like")} (...)`;

    // Navigation variantes
    let navHtml = "";
    if (variantes.length > 1) {
      navHtml = `
                <button id='var-prev' class='var-arrow left' title='Précédent' style="background:none;border:none;padding:0;width:48px;height:48px;">
                    <img id='var-prev-img' src='OVERLAY/arrow_left_overlay.png' style='width:48px;height:48px;transition:transform 0.15s;' draggable='false' />
                </button>
                <button id='var-next' class='var-arrow right' title='Suivant' style="background:none;border:none;padding:0;width:48px;height:48px;">
                    <img id='var-next-img' src='OVERLAY/arrow_right_overlay.png' style='width:48px;height:48px;transition:transform 0.15s;' draggable='false' />
                </button>
            `;
    }

    // Rendu du contenu
    detailDiv.innerHTML = `
            <div class='card' style='box-shadow:0 6px 32px #7c4dff44; border:1px solid #7c4dff; padding:2em 1.5em; position:relative;'>
                <button id='back-to-search' style='margin-bottom:1.5em;background:#b388ff;color:#2a0845;font-weight:bold;border:none;border-radius:8px;padding:8px 22px;font-size:1.1em;cursor:pointer;box-shadow:0 2px 8px #7c4dff33;'>← ${t("back")}</button>
                ${navHtml}
                <h3 class='section-title' style='margin-top:0.5em; font-size:1.2em;'>${t("reference")}</h3>
                ${refBlock}
                ${spriteVideoHtml}
                ${fusionVideoHtml}
                <h3 class='section-title' style='margin-top:1.2em; font-size:1.2em;'>${t("preview")}</h3>
                <div id="preview-shiny-container"></div>
                <h3 class='section-title' style='margin-top:1.2em; font-size:1.2em;'>${t("palette")}</h3>
                ${paletteHtml}
                <div id="like-btn-container" style='display:flex;justify-content:center;margin-top:2em;'>
                  <button id='like-btn' class='like-btn' style='background:linear-gradient(90deg,#7c4dff 60%,#b388ff 100%);color:#fff;font-size:1.25em;padding:0.7em 2.2em;border-radius:30px;border:none;box-shadow:0 2px 12px #7c4dff44;transition:background 0.2s,transform 0.2s;cursor:pointer;display:flex;align-items:center;gap:0.7em;letter-spacing:1px;outline:none;'>
                    <span style='font-size:1.3em;' id='like-emoji'>${liked ? "👎" : "👍"}</span>
                    <span id='like-text'>${likeBtnText}</span>
                  </button>
                </div>
                <div style='text-align:right;margin-top:2.5em;font-size:1em;opacity:0.7;'> ${t("madeBy")} <b id='author-discord'></b></div>
            </div>
        `;

    // Retour à la recherche
    document.getElementById("back-to-search").onclick = function () {
      window.location.href = "/PIFShiny/?lang=" + getLang();
    };

    // Navigation variantes
    if (variantes.length > 1) {
      document.getElementById("var-prev").onclick = function () {
        let newIndex = (varianteIndex - 1 + variantes.length) % variantes.length;
        afficherDetail(variantes[newIndex], newIndex, variantes);
      };
      document.getElementById("var-next").onclick = function () {
        let newIndex = (varianteIndex + 1) % variantes.length;
        afficherDetail(variantes[newIndex], newIndex, variantes);
      };
    }

    // Copier la palette
    let copyBtn = document.getElementById("copy-palette");
    if (copyBtn) {
      copyBtn.onclick = function () {
        let text = document.getElementById("palette-pre").innerText;
        navigator.clipboard.writeText(text);
        this.textContent = t("copied");
        setTimeout(() => {
          this.textContent = t("copyPalette");
        }, 1500);
      };
    }

    // Gestion des likes (mode dev)
    let likeBtnContainer = document.getElementById("like-btn-container");
    let likeBtn = document.getElementById("like-btn");
    const isDev = new URLSearchParams(window.location.search).get("dev") === "true";
    
    if (!isDev) {
      if (likeBtnContainer) likeBtnContainer.style.display = "none";
    } else {
      if (likeBtnContainer) likeBtnContainer.style.display = "flex";
      if (likeBtn) likeBtn.disabled = false;

      let likeText = document.getElementById("like-text");
      let likeEmoji = document.getElementById("like-emoji");
      
      function setLikeBtnState(liked, count) {
        likeText.textContent = (liked ? t("unlike") : t("like")) + ` (${count})`;
        likeEmoji.textContent = liked ? "👎" : "👍";
        btn.style.background = liked
          ? "linear-gradient(90deg,#fff 60%,#b388ff 100%)"
          : "linear-gradient(90deg,#7c4dff 60%,#b388ff 100%)";
        btn.style.color = liked ? "#7c4dff" : "#fff";
      }

      getLikeCount(poke.numero, author, function (count) {
        let liked = !!localStorage.getItem(likeKey);
        setLikeBtnState(liked, count);
        likeBtn.disabled = false;
      });

      likeBtn.onmousedown = () => (likeBtn.style.transform = "scale(0.96)");
      likeBtn.onmouseup = likeBtn.onmouseleave = () => (likeBtn.style.transform = "scale(1)");
      
      likeBtn.onclick = function () {
        if (likeBtn.disabled) return;
        let currentLiked = !!localStorage.getItem(likeKey);
        let action = currentLiked ? "dec" : "inc";
        let newLiked = !currentLiked;
        if (newLiked) localStorage.setItem(likeKey, "1");
        else localStorage.removeItem(likeKey);
        likeText.textContent = t("waiting") || "...";
        likeBtn.disabled = true;
        likeBtn.style.transform = "scale(0.96)";
        updateLike(poke.numero, author, action, function (newCount) {
          let finalLiked = !!localStorage.getItem(likeKey);
          setLikeBtnState(finalLiked, newCount);
          likeBtn.disabled = false;
          likeBtn.style.transform = "scale(1)";
        });
      };
    }

    document.getElementById("author-discord").textContent = author || "Anonyme";

    // Rendu de l'aperçu shiny
    let previewContainer = document.getElementById("preview-shiny-container");
    previewContainer.innerHTML = "";

    let sectionTitle = detailDiv.querySelectorAll(".section-title")[1];
    if (sectionTitle && !document.getElementById("see-self-btn")) {
      let seeSelfBtn = document.createElement("button");
      seeSelfBtn.id = "see-self-btn";
      seeSelfBtn.className = "dl-btn";
      seeSelfBtn.style.marginLeft = "1em";
      seeSelfBtn.style.fontSize = "0.95em";
      seeSelfBtn.style.borderRadius = "8px";
      seeSelfBtn.style.padding = "4px 18px";
      seeSelfBtn.style.fontWeight = "bold";
      seeSelfBtn.style.cursor = "pointer";
      seeSelfBtn.textContent = t("seeSelfOff");
      sectionTitle.appendChild(seeSelfBtn);
    }

    let seeSelf = false;
    let isRendering = false; // Flag pour éviter les appels simultanés
    
    function renderPreview() {
      if (isRendering) return; // Ignorer si déjà en cours de rendu
      isRendering = true;
      
      if (isNaN(currentTile) || currentTile < 1 || currentTile > maxTile)
        currentTile = 1;
      previewContainer.innerHTML = "";
      let previewDiv = renderPreviewShiny(
        poke,
        currentTile,
        maxTile,
        seeSelf,
        pokemonBaseList,
        pokemonSelfList,
      );
      previewContainer.appendChild(previewDiv);
      
      // Attendre que l'image se charge avant de permettre un nouveau rendu
      setTimeout(() => {
        isRendering = false;
      }, 300);
    }

    renderPreview();

    let seeSelfBtn = document.getElementById("see-self-btn");
    if (seeSelfBtn) {
      let btnLocked = false; // Débounce du bouton
      seeSelfBtn.onclick = function () {
        if (btnLocked) return; // Ignorer les clics rapides
        btnLocked = true;
        
        seeSelf = !seeSelf;
        seeSelfBtn.textContent = seeSelf ? t("seeSelfOn") : t("seeSelfOff");
        renderPreview();
        
        // Déverrouiller après 400ms
        setTimeout(() => {
          btnLocked = false;
        }, 400);
      };
    }
  };
}
