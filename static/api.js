const API_LIKE_URL =
  "https://script.google.com/macros/s/AKfycbyyb8luWN-Q5jiz5NOV07FVxOq0QqDI55t9XeUW9E8ZMaTmrqCjwgZqgV7nT_Cj8idF/exec";

export async function loadJSONLists() {
  try {
    // Vérifier si les listes sont en cache dans localStorage
    const cachedBase = localStorage.getItem("pokemonBaseCache");
    const cachedSelf = localStorage.getItem("pokemonSelfCache");
    
    if (cachedBase && cachedSelf) {
      console.log("Listes de fichiers chargées depuis le cache !");
      return { 
        base: JSON.parse(cachedBase), 
        self: JSON.parse(cachedSelf) 
      };
    }

    const [base, self] = await Promise.all([
      fetch("LINK/POKEMON_BASE.json").then((r) => r.json()),
      fetch("LINK/POKEMON_SELF.json").then((r) => r.json()),
    ]);
    
    // Sauvegarder en localStorage pour les prochains appels
    localStorage.setItem("pokemonBaseCache", JSON.stringify(base));
    localStorage.setItem("pokemonSelfCache", JSON.stringify(self));
    
    console.log("Listes de fichiers chargées et mises en cache !");
    return { base, self };
  } catch (err) {
    console.error("Erreur de chargement des JSON :", err);
    return { base: {}, self: {} };
  }
}

export async function fetchPokemons() {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/1N-wZs3SaLRQ7zyKQKGIk_ctYr1YqNHn8ROkSUmHMRsM/gviz/tq?tqx=out:json",
  );
  const txt = await response.text();
  let json = JSON.parse(txt.substring(47).slice(0, -2));
  let cols = json.table.cols.map((c) => c.label.toLowerCase());
  const pokemons = json.table.rows.map((row) => {
    let obj = {};
    row.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? cell.v : "";
    });

    let key = Object.keys(obj).find((k) => k.includes("name of the pokémon"));
    if (key && obj[key]) {
      let value = obj[key].trim();
      let match = value.match(/^(.+?) \((\d+)\)$/);
      if (match) {
        obj.nom = match[1].trim();
        obj.numero = match[2].trim();
      } else {
        obj.nom = value.trim();
        obj.numero = "";
      }
    }
    let paletteKey = Object.keys(obj).find((k) => k.includes("palette"));
    if (paletteKey && obj[paletteKey]) {
      obj.palette = obj[paletteKey];
    }
    obj.video_sprite = obj["video of all base pokémon sprites"] || "";
    obj.video_fusion = obj["video of all self-fusion pokémon sprites"] || "";
    obj.like = obj["like"] || obj["likes"] || 0;
    return obj;
  });

  return pokemons;
}

export function getLikeCount(num, author, callback) {
  fetch(
    `${API_LIKE_URL}?num=${encodeURIComponent(num)}&author=${encodeURIComponent(author)}&action=get`,
  )
    .then((r) => r.text())
    .then((val) => callback(val));
}
export function updateLike(num, author, action, callback) {
  fetch(
    `${API_LIKE_URL}?num=${encodeURIComponent(num)}&author=${encodeURIComponent(author)}&action=${action}`,
  )
    .then((r) => r.text())
    .then((val) => callback(val));
}
