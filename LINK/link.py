import os
import json

def generate_pokemon_json(folder_name, output_file):
    # Dictionnaire qui contiendra notre structure
    # On peut soit faire une liste simple, soit une structure par dossier
    file_structure = {}

    if not os.path.exists(folder_name):
        print(f"Erreur : Le dossier '{folder_name}' n'existe pas.")
        return

    print(f"Scan du dossier {folder_name} en cours...")

    for root, dirs, files in os.walk(folder_name):
        # Obtenir le chemin relatif (ex: POKEMON_BASE/Generation1)
        relative_path = os.path.relpath(root, folder_name)
        
        # Filtrer pour ne garder que les images (png, jpg, etc.)
        valid_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
        images = [f for f in files if f.lower().endswith(valid_extensions)]
        
        if images:
            # Si on est à la racine du dossier
            if relative_path == ".":
                file_structure["root"] = images
            else:
                file_structure[relative_path] = images

    # Écriture du fichier JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(file_structure, f, indent=4, ensure_ascii=False)

    print(f"Terminé ! Le fichier '{output_file}' a été généré.")

# Lancement du script
if __name__ == "__main__":
    generate_pokemon_json('POKEMON_SELF', 'POKEMON_SELF.json')