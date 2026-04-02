-- ============================================================
-- CoachAI — Seed: Cours Python & NumPy : Analyse de données
-- ============================================================

WITH python_course AS (
  INSERT INTO courses (id, slug, title, description, level, category, is_published, is_premium)
  VALUES (
    gen_random_uuid(),
    'python-numpy-fondamentaux',
    'Python & NumPy : Analyse de données',
    'Maîtrise Python et Pandas pour manipuler, nettoyer et analyser des données réelles. De l''importation CSV jusqu''aux analyses avancées.',
    'beginner',
    'python',
    true,
    false
  )
  RETURNING id
),

-- ─── LEÇON 1 : Introduction à Python pour la data ──────────────────────────────
lesson1 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT
    gen_random_uuid(),
    python_course.id,
    'Python pour la data : les fondamentaux',
    $content$# Python pour la data : les fondamentaux

## Pourquoi Python ?

Python est devenu le langage de référence pour la data science pour plusieurs raisons :

- **Simple à apprendre** : syntaxe proche de l'anglais
- **Écosystème riche** : pandas, numpy, scikit-learn, matplotlib
- **Communauté énorme** : Stack Overflow, GitHub, Kaggle
- **Production-ready** : de l'exploration à la mise en production

---

## Les types de données essentiels

### Nombres

```python
age = 25           # int
taux = 8.75        # float
salaire = 45_000   # int avec séparateur visuel (= 45000)
```

### Chaînes de caractères

```python
prenom = "Alice"
nom = 'Martin'
nom_complet = f"{prenom} {nom}"  # f-string : "Alice Martin"

# Méthodes utiles
email = "  Alice@Gmail.COM  "
email_propre = email.strip().lower()  # "alice@gmail.com"

print(email.upper())     # "  ALICE@GMAIL.COM  "
print(len("bonjour"))    # 7
print("data" in "data science")  # True
```

### Listes

```python
notes = [14, 17, 12, 19, 15]

print(notes[0])       # 14 (premier élément)
print(notes[-1])      # 15 (dernier)
print(notes[1:3])     # [17, 12] (slice)

notes.append(16)      # ajoute à la fin
notes.sort()          # trie en place
notes_tries = sorted(notes)  # retourne une nouvelle liste triée

# Compréhension de liste
doubles = [n * 2 for n in notes]
superieur_15 = [n for n in notes if n > 15]
```

### Dictionnaires

```python
etudiant = {
    "nom": "Alice",
    "age": 22,
    "notes": [14, 17, 19]
}

print(etudiant["nom"])          # "Alice"
print(etudiant.get("email", ""))  # "" (valeur par défaut si clé absente)

etudiant["email"] = "alice@edu.fr"  # ajouter/modifier

for cle, valeur in etudiant.items():
    print(f"{cle}: {valeur}")
```

---

## Fonctions

```python
def calculer_moyenne(notes: list) -> float:
    """Calcule la moyenne d'une liste de notes."""
    if not notes:
        return 0.0
    return sum(notes) / len(notes)

# Utilisation
moy = calculer_moyenne([14, 17, 19])
print(f"Moyenne : {moy:.2f}")  # "Moyenne : 16.67"
```

### Lambda (fonctions anonymes)

```python
# Utile pour les tris et transformations rapides
noms = ["alice", "bob", "charlie", "david"]
noms_tri = sorted(noms, key=lambda x: len(x))  # tri par longueur
# ['bob', 'alice', 'david', 'charlie']

# En data science : souvent utilisé avec apply()
```

---

## Gestion des fichiers

```python
import csv

# Lire un CSV manuellement (avant de connaître pandas)
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for ligne in reader:
        print(ligne["nom"], ligne["salaire"])

# Écrire dans un fichier
with open("resultats.txt", "w") as f:
    f.write("Résultats de l'analyse\n")
    f.write(f"Nombre de lignes : {1234}\n")
```

---

## Quiz rapide

**Question :** Quelle est la sortie de ce code ?

```python
data = [3, 1, 4, 1, 5, 9, 2, 6]
result = [x**2 for x in data if x > 3]
print(result)
```

<details>
<summary>Voir la réponse</summary>

`[16, 25, 81, 36]` — On garde les éléments > 3 (soit 4, 5, 9, 6) et on les élève au carré.

</details>

---

## Résumé

| Concept | Exemple | Usage data |
|---------|---------|-----------|
| f-string | `f"score: {x:.2f}"` | Affichage formaté |
| List comprehension | `[x*2 for x in l]` | Transformation rapide |
| Dict | `{"col": [1,2,3]}` | Créer des DataFrames |
| Lambda | `key=lambda x: x[1]` | Tris, apply() |
$content$,
    1, 20, false
  FROM python_course
  RETURNING id
),

-- ─── LEÇON 2 : NumPy - Les bases ────────────────────────────────────────────
lesson2 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT
    gen_random_uuid(),
    python_course.id,
    'NumPy : calcul vectorisé',
    $content$# NumPy : calcul vectorisé

## Pourquoi NumPy ?

NumPy (Numerical Python) est la brique fondamentale de tout l'écosystème data Python. Pandas est **construit sur NumPy**.

```
Performance : NumPy array >> Python list
100x plus rapide sur 1 million d'éléments
```

---

## Créer des arrays

```python
import numpy as np

# Depuis une liste
a = np.array([1, 2, 3, 4, 5])
print(a.dtype)   # int64
print(a.shape)   # (5,)

# Arrays 2D (matrices)
matrice = np.array([[1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]])
print(matrice.shape)   # (3, 3)
print(matrice[1, 2])   # 6 (ligne 1, colonne 2)

# Arrays prédéfinis
zeros = np.zeros((3, 4))       # matrice 3x4 de zéros
uns = np.ones((2, 3))          # matrice 2x3 de uns
identite = np.eye(3)           # matrice identité 3x3
range_arr = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)  # [0., 0.25, 0.5, 0.75, 1.]
```

---

## Opérations vectorisées

```python
prix = np.array([100, 250, 80, 320, 150])
quantites = np.array([5, 2, 10, 1, 4])

# Opérations élément par élément (pas de boucle !)
ca = prix * quantites          # [500, 500, 800, 320, 600]
prix_ttc = prix * 1.2          # tous les prix * 1.2
prix_reduits = prix - 10       # tous les prix - 10

# Comparaisons → array de booléens
chers = prix > 200             # [False, True, False, True, False]
prix_chers = prix[chers]       # [250, 320] — filtrage booléen

# Statistiques
print(f"Total CA : {ca.sum():,}")       # 2720
print(f"Prix moyen : {prix.mean():.2f}")  # 180.00
print(f"Prix max : {prix.max()}")         # 320
print(f"Écart-type : {prix.std():.2f}")   # 90.33
```

---

## Broadcasting

NumPy peut opérer sur des arrays de formes différentes :

```python
# Normalisation (z-score) — très utilisé en ML
donnees = np.array([85, 90, 72, 95, 68])
moyenne = donnees.mean()   # 82.0
ecart_type = donnees.std() # 10.06

z_scores = (donnees - moyenne) / ecart_type
# [ 0.30  0.80 -0.99  1.29 -1.39]

# Matrice + vecteur (broadcasting)
A = np.array([[1, 2, 3],
              [4, 5, 6]])
v = np.array([10, 20, 30])
print(A + v)
# [[11, 22, 33],
#  [14, 25, 36]]
```

---

## Génération de données aléatoires

```python
np.random.seed(42)  # reproductibilité

# Distribution normale (moyenne=0, écart-type=1)
normal = np.random.normal(loc=50000, scale=10000, size=1000)

# Distribution uniforme entre 0 et 1
uniforme = np.random.uniform(0, 1, size=500)

# Entiers aléatoires
ages = np.random.randint(18, 65, size=200)

# Choix aléatoire
categories = np.random.choice(['A', 'B', 'C'], size=100, p=[0.5, 0.3, 0.2])
```

---

## Reshape et manipulation

```python
arr = np.arange(12)        # [0, 1, 2, ..., 11]

matrice = arr.reshape(3, 4)  # 3 lignes, 4 colonnes
# [[ 0,  1,  2,  3],
#  [ 4,  5,  6,  7],
#  [ 8,  9, 10, 11]]

plat = matrice.flatten()   # retour en 1D

# Transposée
print(matrice.T.shape)     # (4, 3)

# Concatenation
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
c = np.concatenate([a, b])  # [1, 2, 3, 4, 5, 6]
```

---

## NumPy vs Pandas

| Opération | NumPy | Pandas |
|-----------|-------|--------|
| Données | Numériques homogènes | Mixtes (int, str, float) |
| Index | Entier 0-N | Labels personnalisés |
| Colonnes | Non | Oui (nommées) |
| Performance | Légèrement plus rapide | Plus pratique |
| Usage | Calculs ML, matrices | Analyse de données |
$content$,
    2, 18, false
  FROM python_course
  RETURNING id
),

-- ─── LEÇON 3 : Pandas - Introduction et chargement ──────────────────────────
lesson3 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT
    gen_random_uuid(),
    python_course.id,
    'Pandas : charger et explorer les données',
    $content$# Pandas : charger et explorer les données

## Qu'est-ce que Pandas ?

Pandas est la bibliothèque Python n°1 pour la manipulation de données tabulaires. Son nom vient de "**Pan**el **Da**ta".

```python
import pandas as pd
import numpy as np
```

---

## Chargement de données

### Depuis un fichier

```python
# CSV (le plus courant)
df = pd.read_csv("data.csv")
df = pd.read_csv("data.csv", sep=";", encoding="utf-8")
df = pd.read_csv("data.csv", parse_dates=["date_inscription"])

# Excel
df = pd.read_excel("rapport.xlsx", sheet_name="Ventes")

# JSON
df = pd.read_json("data.json")

# SQL
import sqlite3
conn = sqlite3.connect("database.db")
df = pd.read_sql("SELECT * FROM clients WHERE actif = 1", conn)
```

### Depuis un dictionnaire

```python
df = pd.DataFrame({
    "nom": ["Alice", "Bob", "Claire"],
    "age": [28, 34, 29],
    "salaire": [45000, 52000, 48000],
    "département": ["IT", "Finance", "IT"]
})
```

---

## Explorer les données

```python
# Dimensions
print(df.shape)          # (100, 8) → 100 lignes, 8 colonnes
print(len(df))           # 100 lignes

# Premières / dernières lignes
df.head(5)               # 5 premières lignes
df.tail(3)               # 3 dernières lignes

# Résumé complet
df.info()
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 100 entries, 0 to 99
# Data columns (total 4 columns):
#  #   Column      Non-Null Count  Dtype
#  0   nom         100 non-null    object
#  1   age         98 non-null     float64
#  2   salaire     95 non-null     float64
#  3   département 100 non-null    object

# Statistiques descriptives
df.describe()
#        age    salaire
# count  98.0    95.0
# mean   31.2  49823.0
# std     7.5  12400.0
# min    18.0  28000.0
# 25%    25.0  42000.0
# 50%    30.0  48000.0
# 75%    37.0  56000.0
# max    55.0  95000.0

# Types des colonnes
df.dtypes
# nom            object
# age           float64
# salaire       float64
# département    object
```

---

## Sélection de données

```python
# Sélectionner une colonne → Series
ages = df["age"]
noms = df.nom          # syntaxe alternative (si pas d'espace dans le nom)

# Sélectionner plusieurs colonnes → DataFrame
sous_df = df[["nom", "salaire"]]

# Filtrage (comme WHERE en SQL)
it_dept = df[df["département"] == "IT"]
seniors = df[df["age"] >= 35]
bien_payes = df[df["salaire"] > 50000]

# Conditions multiples
it_seniors = df[(df["département"] == "IT") & (df["age"] >= 35)]
paris_ou_lyon = df[df["ville"].isin(["Paris", "Lyon"])]
```

### loc vs iloc

```python
# .loc → par labels/conditions
df.loc[0, "nom"]           # ligne 0, colonne "nom"
df.loc[df["age"] > 30, ["nom", "age"]]  # filtre + colonnes

# .iloc → par position numérique
df.iloc[0, 1]              # 1ère ligne, 2ème colonne
df.iloc[5:10, :]           # lignes 5 à 9, toutes les colonnes
df.iloc[:, -1]             # toute la dernière colonne
```

---

## Valeurs manquantes

```python
# Détecter
df.isnull()              # DataFrame de booléens
df.isnull().sum()        # nb de NaN par colonne
df.isnull().sum() / len(df) * 100  # % manquants

# Gérer
df.dropna()              # supprime toutes les lignes avec NaN
df.dropna(subset=["salaire"])  # seulement si "salaire" est NaN
df.dropna(thresh=3)      # garde les lignes avec au moins 3 valeurs non-NaN

df.fillna(0)                          # remplace NaN par 0
df["salaire"].fillna(df["salaire"].mean())  # par la moyenne
df.fillna(method="ffill")             # forward fill (valeur précédente)

# Vérifier après nettoyage
print(f"Valeurs manquantes restantes : {df.isnull().sum().sum()}")
```

---

## Exemple complet : pipeline d'import

```python
import pandas as pd

def charger_et_nettoyer(chemin: str) -> pd.DataFrame:
    """Charge un CSV et le prépare pour l'analyse."""
    df = pd.read_csv(chemin, parse_dates=["date_inscription"])

    print(f"📥 Chargé : {df.shape[0]} lignes, {df.shape[1]} colonnes")
    print(f"🔍 Manquants : {df.isnull().sum().sum()}")

    # Nettoyage
    df = df.drop_duplicates()
    df.columns = df.columns.str.lower().str.replace(" ", "_")
    df["email"] = df["email"].str.strip().str.lower()

    print(f"✅ Après nettoyage : {df.shape[0]} lignes")
    return df

df = charger_et_nettoyer("clients.csv")
```
$content$,
    3, 22, false
  FROM python_course
  RETURNING id
),

-- ─── LEÇON 4 : Pandas - Transformation et agrégation ────────────────────────
lesson4 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT
    gen_random_uuid(),
    python_course.id,
    'Pandas : transformer et agréger',
    $content$# Pandas : transformer et agréger

## Créer et modifier des colonnes

```python
import pandas as pd

df = pd.DataFrame({
    "prénom": ["alice", "bob", "claire"],
    "naissance": [1995, 1988, 1992],
    "salaire": [45000, 52000, 48000],
    "département": ["IT", "Finance", "IT"]
})

# Nouvelles colonnes
df["age"] = 2024 - df["naissance"]
df["salaire_mensuel"] = df["salaire"] / 12
df["ancienneté"] = df["age"] - 22  # approximation

# Transformation de texte
df["prénom"] = df["prénom"].str.title()  # "Alice", "Bob", "Claire"
df["email"] = df["prénom"].str.lower() + "@company.fr"

# apply() : appliquer une fonction personnalisée
def categoriser_salaire(s):
    if s < 40000: return "Junior"
    elif s < 60000: return "Confirmé"
    else: return "Senior"

df["niveau"] = df["salaire"].apply(categoriser_salaire)

# Plus concis avec lambda
df["salaire_k"] = df["salaire"].apply(lambda x: f"{x/1000:.0f}k€")
```

---

## Tri et classement

```python
# Tri simple
df_tri = df.sort_values("salaire", ascending=False)

# Tri multiple
df_tri = df.sort_values(["département", "salaire"], ascending=[True, False])

# Classement (rank)
df["rang_salaire"] = df["salaire"].rank(ascending=False, method="dense").astype(int)
# method='dense' → pas de saut de rang (1, 2, 2, 3 au lieu de 1, 2, 2, 4)
```

---

## GroupBy : agrégation SQL-like

```python
# Équivalent de GROUP BY en SQL
stats = df.groupby("département")["salaire"].agg(["mean", "min", "max", "count"])
stats.columns = ["salaire_moyen", "salaire_min", "salaire_max", "effectif"]

# Agrégation multiple sur plusieurs colonnes
stats2 = df.groupby("département").agg(
    effectif=("salaire", "count"),
    masse_salariale=("salaire", "sum"),
    salaire_moyen=("salaire", "mean"),
    age_moyen=("age", "mean")
).round(2)

# Avec une fonction custom
def cv(x):
    """Coefficient de variation (en %)"""
    return (x.std() / x.mean() * 100).round(1)

stats3 = df.groupby("département")["salaire"].agg(["mean", "std", cv])
```

---

## Pivot tables

```python
df_ventes = pd.DataFrame({
    "région": ["Nord", "Nord", "Sud", "Sud", "Est"],
    "trimestre": ["Q1", "Q2", "Q1", "Q2", "Q1"],
    "ca": [120000, 98000, 85000, 112000, 76000]
})

# Équivalent d'un tableau croisé dynamique Excel
pivot = pd.pivot_table(
    df_ventes,
    values="ca",
    index="région",
    columns="trimestre",
    aggfunc="sum",
    fill_value=0,
    margins=True,       # ajoute une ligne "All" avec le total
    margins_name="TOTAL"
)
print(pivot)
# trimestre  Q1      Q2    TOTAL
# région
# Est      76000       0    76000
# Nord    120000   98000   218000
# Sud      85000  112000   197000
# TOTAL   281000  210000   491000
```

---

## merge() : équivalent des JOIN SQL

```python
clients = pd.DataFrame({
    "client_id": [1, 2, 3, 4],
    "nom": ["Alice", "Bob", "Claire", "David"]
})
commandes = pd.DataFrame({
    "commande_id": [101, 102, 103, 104],
    "client_id": [1, 1, 2, 3],
    "montant": [150, 89.5, 340, 55]
})

# INNER JOIN
df_inner = pd.merge(clients, commandes, on="client_id")
# seulement les clients avec des commandes

# LEFT JOIN (tous les clients, même sans commande)
df_left = pd.merge(clients, commandes, on="client_id", how="left")

# Renommer les colonnes conflictuelles
df = pd.merge(df1, df2, left_on="client_id", right_on="id",
              suffixes=("_client", "_commande"))
```

---

## Exemple : rapport de ventes complet

```python
import pandas as pd

# Données
commandes = pd.read_csv("commandes.csv", parse_dates=["date"])
produits = pd.read_csv("produits.csv")

# Enrichissement
df = pd.merge(commandes, produits, on="produit_id")
df["ca_ligne"] = df["quantite"] * df["prix_unitaire"]
df["mois"] = df["date"].dt.to_period("M")

# Rapport mensuel par catégorie
rapport = df.groupby(["mois", "categorie"]).agg(
    nb_commandes=("commande_id", "count"),
    ca=("ca_ligne", "sum"),
    panier_moyen=("ca_ligne", "mean")
).round(2)

print(rapport.to_string())
```
$content$,
    4, 25, false
  FROM python_course
  RETURNING id
),

-- ─── LEÇON 5 : Pandas - Nettoyage avancé et cas réels ───────────────────────
lesson5 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT
    gen_random_uuid(),
    python_course.id,
    'Nettoyage avancé et cas réels',
    $content$# Nettoyage avancé et cas réels

## Détection et traitement des doublons

```python
import pandas as pd

df = pd.read_csv("clients.csv")

# Identifier les doublons
print(f"Doublons exacts : {df.duplicated().sum()}")
print(f"Doublons sur email : {df.duplicated('email').sum()}")

# Voir les doublons
doublons = df[df.duplicated(keep=False)]  # keep=False → toutes les occurrences

# Supprimer (garde la première occurrence)
df_clean = df.drop_duplicates()
df_clean = df.drop_duplicates(subset=["email"], keep="first")

# Après nettoyage
print(f"Lignes supprimées : {len(df) - len(df_clean)}")
```

---

## Gestion des outliers

```python
import numpy as np

# Méthode IQR (InterQuartile Range)
def supprimer_outliers_iqr(df, colonne, seuil=1.5):
    Q1 = df[colonne].quantile(0.25)
    Q3 = df[colonne].quantile(0.75)
    IQR = Q3 - Q1
    borne_inf = Q1 - seuil * IQR
    borne_sup = Q3 + seuil * IQR

    masque = (df[colonne] >= borne_inf) & (df[colonne] <= borne_sup)
    print(f"Outliers supprimés ({colonne}): {(~masque).sum()}")
    return df[masque]

df = supprimer_outliers_iqr(df, "salaire")

# Méthode Z-score
from scipy import stats
z_scores = np.abs(stats.zscore(df["salaire"]))
df = df[z_scores < 3]  # garde les valeurs à moins de 3 écarts-types
```

---

## Transformation des types

```python
# Problème courant : colonnes numériques stockées en string
df["prix"] = df["prix"].str.replace("€", "").str.replace(",", ".").str.strip()
df["prix"] = pd.to_numeric(df["prix"], errors="coerce")
# errors="coerce" → met NaN si conversion impossible

# Dates
df["date"] = pd.to_datetime(df["date"], format="%d/%m/%Y")
df["année"] = df["date"].dt.year
df["mois"] = df["date"].dt.month
df["jour_semaine"] = df["date"].dt.day_name()

# Catégories (économise la mémoire)
df["département"] = df["département"].astype("category")
print(df.memory_usage(deep=True))  # compare avant/après

# Booléens
df["actif"] = df["statut"].map({"actif": True, "inactif": False})
```

---

## Reshape : melt() et stack()

```python
# Wide → Long avec melt()
df_wide = pd.DataFrame({
    "client": ["Alice", "Bob"],
    "jan": [1200, 900],
    "fev": [1100, 1050],
    "mar": [1350, 800]
})

df_long = pd.melt(df_wide,
    id_vars=["client"],
    var_name="mois",
    value_name="ca"
)
#   client  mois    ca
# 0  Alice   jan  1200
# 1    Bob   jan   900
# 2  Alice   fev  1100
# ...

# Long → Wide avec pivot()
df_wide_bis = df_long.pivot(index="client", columns="mois", values="ca")
```

---

## Cas réel : audit qualité d'un dataset

```python
def audit_qualite(df: pd.DataFrame) -> pd.DataFrame:
    """Génère un rapport de qualité pour chaque colonne."""
    rapport = []

    for col in df.columns:
        series = df[col]
        rapport.append({
            "colonne": col,
            "type": str(series.dtype),
            "valeurs_totales": len(series),
            "manquants": series.isnull().sum(),
            "pct_manquants": f"{series.isnull().mean()*100:.1f}%",
            "uniques": series.nunique(),
            "doublons": series.duplicated().sum(),
            "exemple": str(series.dropna().iloc[0]) if series.dropna().any() else "N/A"
        })

    return pd.DataFrame(rapport)

# Utilisation
rapport = audit_qualite(df)
print(rapport.to_string(index=False))
```

---

## Projet final : pipeline complet

```python
import pandas as pd
import numpy as np

def pipeline_data(chemin: str) -> pd.DataFrame:
    """Pipeline complet de nettoyage."""

    # 1. Chargement
    df = pd.read_csv(chemin)
    print(f"✅ Chargé : {df.shape}")

    # 2. Colonnes standardisées
    df.columns = df.columns.str.lower().str.strip().str.replace(" ", "_")

    # 3. Types
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    for col in df.select_dtypes("object"):
        df[col] = df[col].str.strip()

    # 4. Doublons
    avant = len(df)
    df = df.drop_duplicates()
    print(f"🔄 Doublons supprimés : {avant - len(df)}")

    # 5. Valeurs manquantes
    for col in df.select_dtypes("number"):
        df[col] = df[col].fillna(df[col].median())
    for col in df.select_dtypes("object"):
        df[col] = df[col].fillna("Inconnu")

    print(f"✅ Résultat final : {df.shape}")
    return df
```

---

## Récap des méthodes clés

| Opération | Méthode Pandas |
|-----------|---------------|
| Filtrer | `df[condition]`, `df.query()` |
| Trier | `sort_values()` |
| Regrouper | `groupby().agg()` |
| Joindre | `merge()`, `concat()` |
| Pivoter | `pivot_table()`, `melt()` |
| Nettoyer | `dropna()`, `fillna()`, `drop_duplicates()` |
| Transformer | `apply()`, `map()`, `str.*`, `dt.*` |
$content$,
    5, 28, true
  FROM python_course
  RETURNING id
)

SELECT 'Python & Pandas course created' AS status;
