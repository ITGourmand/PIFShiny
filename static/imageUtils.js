export function parsePaletteLine(palette) {
  if (!palette) return [];
  let match = palette.match(/\{(.+)\}/);
  if (!match) return [];
  let content = match[1];
  let pairs = [];
  content.split(",").forEach((part) => {
    let m = part.match(/"([^"]+)"/);
    if (m) {
      let [from, to] = m[1].split(".");
      if (from && to) {
        let fromArr = from.trim().startsWith("#")
          ? hexToRgb(from.trim())
          : from.trim().split(" ").map(Number);
        let toArr = to.trim().startsWith("#")
          ? hexToRgb(to.trim())
          : to.trim().split(" ").map(Number);

        // Appliquer la logique Ruby : si valeur <= 10, remplacer par 10
        for (let i = 0; i < fromArr.length; i++) {
          if (fromArr[i] <= 10) fromArr[i] = 10;
        }
        for (let i = 0; i < toArr.length; i++) {
          if (toArr[i] <= 10) toArr[i] = 10;
        }

        pairs.push({
          from: fromArr,
          to: toArr,
        });
      }
    }
  });
  return pairs;
}

export function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  let num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

export function rgbToHex(rgb) {
  return "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function applyPaletteToImage(img, palettePairs, doubleShiny, callback) {
  let canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  // Sépare les paires identiques et différentes pour le double shiny
  const identical = [];
  const different = [];

  if (doubleShiny) {
    for (const p of palettePairs) {
      if (
        p.from[0] === p.to[0] &&
        p.from[1] === p.to[1] &&
        p.from[2] === p.to[2]
      ) {
        identical.push(p);
      } else {
        different.push(p);
      }
    }
  }

  function applyRules(pairs) {
    // Cache pour éviter les recalculs DANS cette pass
    const colorCache = {};

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Créer la clé du cache
      const key = `${r},${g},${b}`;

      // Vérifier le cache
      if (colorCache.hasOwnProperty(key)) {
        const cached = colorCache[key];
        if (cached) {
          data[i] = cached[0];
          data[i + 1] = cached[1];
          data[i + 2] = cached[2];
        }
        continue;
      }

      // Convertir en float
      let rf = r * 1.0;
      let gf = g * 1.0;
      let bf = b * 1.0;

      // Éviter la division par zéro
      if (rf < 0.1) rf = 0.1;
      if (gf < 0.1) gf = 0.1;
      if (bf < 0.1) bf = 0.1;

      // Trouver la règle la plus proche
      let minDistance = Infinity;
      let closestRule = null;

      for (const rule of pairs) {
        const from = rule.from;
        const dist =
          Math.pow(rf - from[0], 2) +
          Math.pow(gf - from[1], 2) +
          Math.pow(bf - from[2], 2);

        if (dist < minDistance) {
          minDistance = dist;
          closestRule = rule;
        }
      }

      if (!closestRule) {
        colorCache[key] = null;
        continue;
      }

      // Appliquer la formule : adjusted = to + (pixel - from), clampé à [0, 255]
      const from = closestRule.from;
      const to = closestRule.to;

      let adjustedR = to[0] + (rf - from[0]);
      let adjustedG = to[1] + (gf - from[1]);
      let adjustedB = to[2] + (bf - from[2]);

      // Clamp entre 0 et 255
      adjustedR = Math.max(0, Math.min(255, adjustedR));
      adjustedG = Math.max(0, Math.min(255, adjustedG));
      adjustedB = Math.max(0, Math.min(255, adjustedB));

      const adj = [
        Math.round(adjustedR),
        Math.round(adjustedG),
        Math.round(adjustedB),
      ];
      colorCache[key] = adj;

      data[i] = adj[0];
      data[i + 1] = adj[1];
      data[i + 2] = adj[2];
    }
  }

  // Appliquer les règles
  if (doubleShiny) {
    if (different.length > 0) applyRules(different);
    if (identical.length > 0) applyRules(identical);
  } else {
    applyRules(palettePairs);
  }

  ctx.putImageData(imageData, 0, 0);
  callback(canvas.toDataURL());
}

export function combinePalettes(headPaletteStr, bodyPaletteStr) {
  // Extraire les paires de chaque palette
  const headPairs = parsePaletteLine(headPaletteStr);
  const bodyPairs = parsePaletteLine(bodyPaletteStr);

  const differentPairs = [];
  const identicalPairs = [];

  // Ajouter les paires de la tête
  for (const pair of headPairs) {
    if (
      pair.from[0] === pair.to[0] &&
      pair.from[1] === pair.to[1] &&
      pair.from[2] === pair.to[2]
    ) {
      identicalPairs.push(pair);
    } else {
      differentPairs.push(pair);
    }
  }

  // Ajouter les paires du corps
  for (const pair of bodyPairs) {
    if (
      pair.from[0] === pair.to[0] &&
      pair.from[1] === pair.to[1] &&
      pair.from[2] === pair.to[2]
    ) {
      identicalPairs.push(pair);
    } else {
      differentPairs.push(pair);
    }
  }

  // Construire la chaîne combinée
  let result = "";

  if (differentPairs.length > 0) {
    result += differentPairs
      .map((p) => `"${p.from.join(" ")}.${p.to.join(" ")}"`)
      .join(",");
  }

  if (identicalPairs.length > 0) {
    const identicalStr = identicalPairs
      .map((p) => `"${p.from.join(" ")}.${p.to.join(" ")}"`)
      .join(",");
    if (result) {
      result += "&" + identicalStr;
    } else {
      result = identicalStr;
    }
  }

  return `{${result}}`;
}

export function applyPaletteString(img, paletteStr, callback) {
  // Cette fonction gère le format avec & et |
  if (!paletteStr || paletteStr === "nil" || paletteStr === '{"nil"}') {
    callback(img.src);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Traiter chaque partie séparée par &
  const parts = paletteStr
    .replace(/[{}]/g, "")
    .split("&")
    .map((p) => p.trim());

  let currentCanvas = canvas;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const pairs = part
      .split(",")
      .map((pairStr) => {
        const match = pairStr.match(/"([^"]+)"/);
        if (!match) return null;

        const [from, to] = match[1].split(".");
        return {
          from: from.trim().split(" ").map(Number),
          to: to.trim().split(" ").map(Number),
        };
      })
      .filter((p) => p !== null);

    // Appliquer avec double shiny pour toutes les parties
    const imageData = ctx.getImageData(
      0,
      0,
      currentCanvas.width,
      currentCanvas.height,
    );
    applyRulesToImageData(imageData, pairs, true);
    ctx.putImageData(imageData, 0, 0);
  }

  callback(canvas.toDataURL());
}
export function applyRulesToImageData(imageData, pairs, doubleShiny) {
  const data = imageData.data;

  // Sépare les paires identiques et différentes
  const identical = [];
  const different = [];

  if (doubleShiny) {
    for (const p of pairs) {
      if (
        p.from[0] === p.to[0] &&
        p.from[1] === p.to[1] &&
        p.from[2] === p.to[2]
      ) {
        identical.push(p);
      } else {
        different.push(p);
      }
    }
  }

  function applyRules(rulePairs) {
    const colorCache = {};

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const key = `${r},${g},${b}`;

      if (colorCache.hasOwnProperty(key)) {
        const cached = colorCache[key];
        if (cached) {
          data[i] = cached[0];
          data[i + 1] = cached[1];
          data[i + 2] = cached[2];
        }
        continue;
      }

      let rf = r * 1.0;
      let gf = g * 1.0;
      let bf = b * 1.0;

      if (rf < 0.1) rf = 0.1;
      if (gf < 0.1) gf = 0.1;
      if (bf < 0.1) bf = 0.1;

      let minDistance = Infinity;
      let closestRule = null;

      for (const rule of rulePairs) {
        const from = rule.from;
        const dist =
          Math.pow(rf - from[0], 2) +
          Math.pow(gf - from[1], 2) +
          Math.pow(bf - from[2], 2);

        if (dist < minDistance) {
          minDistance = dist;
          closestRule = rule;
        }
      }

      if (!closestRule) {
        colorCache[key] = null;
        continue;
      }

      const from = closestRule.from;
      const to = closestRule.to;

      let adjustedR = to[0] + (rf - from[0]);
      let adjustedG = to[1] + (gf - from[1]);
      let adjustedB = to[2] + (bf - from[2]);

      adjustedR = Math.max(0, Math.min(255, adjustedR));
      adjustedG = Math.max(0, Math.min(255, adjustedG));
      adjustedB = Math.max(0, Math.min(255, adjustedB));

      const adj = [
        Math.round(adjustedR),
        Math.round(adjustedG),
        Math.round(adjustedB),
      ];
      colorCache[key] = adj;

      data[i] = adj[0];
      data[i + 1] = adj[1];
      data[i + 2] = adj[2];
    }
  }

  if (doubleShiny) {
    if (different.length > 0) applyRules(different);
    if (identical.length > 0) applyRules(identical);
  } else {
    applyRules(pairs);
  }
}
