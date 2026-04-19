import { t, getLang } from './lang.js';

export function initSearchUI(pokemons, afficherDetailCallback) {
  const searchInput = document.getElementById("search");
  const suggestionsDiv = document.getElementById("suggestions");
  const searchSection = document.getElementById("search-section");
  const detailDiv = document.getElementById("pokemon-detail");
  const mainTitle = document.getElementById("main-title");
  const tabsSection = document.getElementById("tabs-section");

  // Gestion de la saisie de recherche
  searchInput.addEventListener("input", function () {
    let val = this.value.trim();
    if (val) {
      window.location.hash = `/recherche=${encodeURIComponent(val)}`;
    } else {
      window.location.hash = "";
    }

    let valLower = val.toLowerCase();
    suggestionsDiv.innerHTML = "";
    if (!valLower) return;
    
    let seen = new Set();
    let results = [];
    for (let p of pokemons) {
      let num = p.numero ? p.numero.toString().trim() : "";
      if (
        ((p.numero && p.numero.toString().includes(valLower)) ||
          (p.nom && p.nom.toLowerCase().includes(valLower))) &&
        num &&
        !seen.has(num)
      ) {
        seen.add(num);
        results.push(p);
      }
      if (results.length >= 10) break;
    }
    
    results.forEach((p) => {
      let div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = `#${(p.numero || "").toString().trim()} - ${(p.nom || "").trim()}`;
      div.onclick = () => {
        window.location.hash = `/${p.numero}`;
      };
      suggestionsDiv.appendChild(div);
    });
  });

  // Gestion du routing basé sur l'URL
  function afficherSiDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const rParam = urlParams.get("r");

    if (rParam && !isNaN(rParam)) {
      let poke = pokemons.find((p) => p.numero && p.numero.toString() === rParam);
      if (poke) afficherDetailCallback(poke);
      else afficherErreur();
      return;
    }

    let hash = window.location.hash.replace(/^#\/?/, "");
    
    if (hash.startsWith("recherche=")) {
      let val = decodeURIComponent(hash.replace("recherche=", ""));
      tabsSection.style.display = "flex";
      searchSection.style.display = "block";
      document.getElementById("import-section").style.display = "none";
      detailDiv.style.display = "none";
      mainTitle.textContent = t("searchTitle");
      searchInput.value = val;
      if (getLang() === "fr") {
        searchInput.placeholder = t("Nom ou numéro du Pokémon");
      } else {
        searchInput.placeholder = t("Pokemon name or number");
      }
      document.getElementById("valider-btn").textContent = t("validate");
      searchInput.focus();
      let event = new Event("input");
      searchInput.dispatchEvent(event);
      return;
    }

    if (hash && !isNaN(hash)) {
      let poke = pokemons.find((p) => p.numero && p.numero.toString() === hash);
      if (poke) afficherDetailCallback(poke);
      else afficherErreur();
    } else {
      tabsSection.style.display = "flex";
      searchSection.style.display = "block";
      document.getElementById("import-section").style.display = "none";
      detailDiv.style.display = "none";
      mainTitle.textContent = t("searchTitle");
      searchInput.value = "";
      searchInput.placeholder = t("placeholder");
      document.getElementById("valider-btn").textContent = t("validate");
      suggestionsDiv.innerHTML = "";
      searchInput.focus();
    }
  }

  // Fonction pour afficher une erreur
  function afficherErreur() {
    searchSection.style.display = "none";
    detailDiv.style.display = "block";
    mainTitle.textContent = t("notFound");
    detailDiv.innerHTML = `<p>${t("notFoundMsg")}</p><div style="margin-top:1em;"><a href="/" class="back-link">${t("back")}</a></div>`;
  }

  // Gestion du bouton valider
  let validerBtn = document.getElementById("valider-btn");
  if (validerBtn) {
    validerBtn.onclick = function () {
      let val = searchInput.value.trim();
      if (!val || isNaN(val)) {
        alert(t("enterValid"));
        return;
      }
      let poke = pokemons.find((p) => p.numero && p.numero.toString() === val);
      if (poke) {
        goToDetail(poke.numero);
      } else {
        alert(t("notFoundNum"));
      }
    };
  }

  // Fonction de navigation vers le détail
  function goToDetail(num) {
    const url = new URL(window.location.href);
    url.searchParams.set("r", num);
    history.pushState({}, "", url);
    afficherSiDetail();
  }

  // Écoute les changements d'URL
  window.addEventListener("hashchange", afficherSiDetail);
  
  // Affichage initial
  afficherSiDetail();
}
