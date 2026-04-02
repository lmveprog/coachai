-- ============================================================
-- CoachAI — Seed: Challenges v2 (15 nouveaux challenges)
-- ============================================================

-- ─── CHALLENGE 11: SQL JOINS - Commandes clients ───────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-jointure-commandes',
    'Commandes par client',
    $md$## Contexte

Tu travailles pour une boutique en ligne. Tu disposes de deux tables : `clients` et `commandes`.

## Structure des tables

```
TABLE : clients                    TABLE : commandes
┌────┬──────────────┬───────────┐  ┌────┬────────────┬──────────┬────────────┐
│ id │ nom          │ email     │  │ id │ client_id  │ montant  │ date_cmd   │
├────┼──────────────┼───────────┤  ├────┼────────────┼──────────┼────────────┤
│ 1  │ Alice Martin │ alice@... │  │ 1  │ 1          │ 150.00   │ 2024-01-10 │
│ 2  │ Bob Dupont   │ bob@...   │  │ 2  │ 1          │  89.50   │ 2024-01-22 │
│ 3  │ Claire Petit │ claire@.. │  │ 3  │ 2          │ 340.00   │ 2024-02-05 │
└────┴──────────────┴───────────┘  └────┴────────────┴──────────┴────────────┘
```

## Objectif

Pour chaque client, affiche :
- `nom` du client
- `nb_commandes` : nombre de commandes passées
- `total_depense` : montant total dépensé (arrondi à 2 décimales)

Inclus **les clients sans commande** (leur `nb_commandes` = 0).
Trie par `total_depense` **décroissant**.

> 💡 **Indice :** `LEFT JOIN` + `COALESCE` pour les clients sans commande
$md$,
    'sql', 'easy', 'code', 100, 35,
    '-- Affiche les stats de commandes pour chaque client
-- Inclut les clients sans commande
-- Colonnes : nom, nb_commandes, total_depense

SELECT
  c.nom,
  COUNT(o.id)        AS nb_commandes,
  COALESCE(ROUND(SUM(o.montant), 2), 0) AS total_depense
FROM clients c
LEFT JOIN commandes o ON -- ta condition
GROUP BY c.id, c.nom
ORDER BY total_depense DESC;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT, email TEXT);
INSERT INTO clients VALUES (1,'Alice Martin','alice@mail.com');
INSERT INTO clients VALUES (2,'Bob Dupont','bob@mail.com');
INSERT INTO clients VALUES (3,'Claire Petit','claire@mail.com');
INSERT INTO clients VALUES (4,'David Moreau','david@mail.com');
CREATE TABLE commandes (id INTEGER PRIMARY KEY, client_id INTEGER, montant REAL, date_cmd TEXT);
INSERT INTO commandes VALUES (1,1,150.0,'2024-01-10');
INSERT INTO commandes VALUES (2,1,89.5,'2024-01-22');
INSERT INTO commandes VALUES (3,2,340.0,'2024-02-05');
INSERT INTO commandes VALUES (4,2,120.0,'2024-02-18');
INSERT INTO commandes VALUES (5,3,55.0,'2024-03-01');$input$,
$expected$nom,nb_commandes,total_depense
Bob Dupont,2,460.0
Alice Martin,2,239.5
Claire Petit,1,55.0
David Moreau,0,0.0$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-jointure-commandes')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'JOIN'),
  (gen_random_uuid(), (SELECT id FROM ch), 'LEFT JOIN'),
  (gen_random_uuid(), (SELECT id FROM ch), 'COALESCE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'GROUP BY');


-- ─── CHALLENGE 12: SQL - Fonctions de fenêtre RANK ────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-window-rank',
    'Classement des vendeurs',
    $md$## Contexte

L'équipe commerciale veut connaître le classement de chaque vendeur **par région**, basé sur leur chiffre d'affaires.

## Structure de la table

```
TABLE : ventes_rep
┌──────────────┬──────────┬───────────┐
│ vendeur      │ region   │ ca        │
├──────────────┼──────────┼───────────┤
│ Sophie L.    │ Nord     │ 85 000    │
│ Marc D.      │ Nord     │ 92 000    │
│ Julie P.     │ Sud      │ 78 000    │
│ ...          │ ...      │ ...       │
└──────────────┴──────────┴───────────┘
```

## Objectif

Pour chaque vendeur, calcule :
- `rang` : son classement dans sa région (1 = meilleur CA), via `RANK()`
- `ca` : son chiffre d'affaires
- `region` : sa région

Trie par `region` ASC, puis `rang` ASC.

> 💡 `RANK() OVER (PARTITION BY region ORDER BY ca DESC)`
$md$,
    'sql', 'medium', 'code', 150, 45,
    '-- Classe les vendeurs par CA dans chaque région
-- Colonnes : vendeur, region, ca, rang

SELECT
  vendeur,
  region,
  ca,
  RANK() OVER (-- complète ici) AS rang
FROM ventes_rep
ORDER BY region ASC, rang ASC;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE ventes_rep (vendeur TEXT, region TEXT, ca INTEGER);
INSERT INTO ventes_rep VALUES ('Sophie L.','Nord',85000);
INSERT INTO ventes_rep VALUES ('Marc D.','Nord',92000);
INSERT INTO ventes_rep VALUES ('Luc B.','Nord',85000);
INSERT INTO ventes_rep VALUES ('Julie P.','Sud',78000);
INSERT INTO ventes_rep VALUES ('Emma R.','Sud',95000);
INSERT INTO ventes_rep VALUES ('Paul T.','Sud',61000);
INSERT INTO ventes_rep VALUES ('Ana C.','Est',70000);
INSERT INTO ventes_rep VALUES ('Tom V.','Est',88000);$input$,
$expected$vendeur,region,ca,rang
Marc D.,Nord,92000,1
Sophie L.,Nord,85000,2
Luc B.,Nord,85000,2
Tom V.,Est,88000,1
Ana C.,Est,70000,2
Emma R.,Sud,95000,1
Julie P.,Sud,78000,2
Paul T.,Sud,61000,3$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-window-rank')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions'),
  (gen_random_uuid(), (SELECT id FROM ch), 'RANK'),
  (gen_random_uuid(), (SELECT id FROM ch), 'PARTITION BY');


-- ─── CHALLENGE 13: SQL - Fonctions de date ────────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-dates-inscriptions',
    'Inscriptions par mois',
    $md$## Contexte

Tu analyses la croissance d'une application SaaS. La table `inscriptions` contient la date d'inscription de chaque utilisateur.

## Structure de la table

```
TABLE : inscriptions
┌────┬────────────┬───────────┐
│ id │ user_id    │ date_ins  │
├────┼────────────┼───────────┤
│ 1  │ 1001       │ 2024-01-03│
│ 2  │ 1002       │ 2024-01-17│
│ 3  │ 1003       │ 2024-02-08│
└────┴────────────┴───────────┘
```

## Objectif

Calcule pour chaque mois :
- `mois` : au format `YYYY-MM` (utilise `strftime('%Y-%m', date_ins)`)
- `nb_inscrits` : nombre d'inscrits ce mois-ci
- `cumul` : total cumulé des inscrits depuis le début (window function `SUM`)

Trie par `mois` ASC.

> 💡 `SUM(nb) OVER (ORDER BY mois ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`
$md$,
    'sql', 'medium', 'code', 150, 48,
    '-- Inscriptions mensuelles avec cumul
-- Colonnes : mois, nb_inscrits, cumul

WITH mensuel AS (
  SELECT
    strftime(''%Y-%m'', date_ins) AS mois,
    COUNT(*) AS nb_inscrits
  FROM inscriptions
  GROUP BY mois
)
SELECT
  mois,
  nb_inscrits,
  SUM(nb_inscrits) OVER (ORDER BY mois) AS cumul
FROM mensuel
ORDER BY mois;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE inscriptions (id INTEGER PRIMARY KEY, user_id INTEGER, date_ins TEXT);
INSERT INTO inscriptions VALUES (1,1001,'2024-01-03');
INSERT INTO inscriptions VALUES (2,1002,'2024-01-17');
INSERT INTO inscriptions VALUES (3,1003,'2024-01-28');
INSERT INTO inscriptions VALUES (4,1004,'2024-02-08');
INSERT INTO inscriptions VALUES (5,1005,'2024-02-14');
INSERT INTO inscriptions VALUES (6,1006,'2024-03-02');
INSERT INTO inscriptions VALUES (7,1007,'2024-03-19');
INSERT INTO inscriptions VALUES (8,1008,'2024-03-25');
INSERT INTO inscriptions VALUES (9,1009,'2024-03-30');$input$,
$expected$mois,nb_inscrits,cumul
2024-01,3,3
2024-02,2,5
2024-03,4,9$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-dates-inscriptions')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Dates'),
  (gen_random_uuid(), (SELECT id FROM ch), 'strftime'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Cumul'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions');


-- ─── CHALLENGE 14: SQL - Sous-requêtes ────────────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-subquery-above-average',
    'Produits au-dessus de la moyenne',
    $md$## Contexte

Tu analyses le catalogue produits d'un e-commerce. Tu veux identifier les produits dont le prix est **supérieur à la moyenne** de leur catégorie.

## Structure de la table

```
TABLE : produits
┌────┬──────────────────┬──────────────┬────────┐
│ id │ nom              │ categorie    │ prix   │
├────┼──────────────────┼──────────────┼────────┤
│ 1  │ MacBook Pro      │ Informatique │ 2499   │
│ 2  │ Dell XPS         │ Informatique │ 1299   │
│ 3  │ iPhone 15        │ Téléphonie   │  999   │
└────┴──────────────────┴──────────────┴────────┘
```

## Objectif

Retourne `nom`, `categorie`, `prix` et `prix_moyen_cat` (moyenne de la catégorie arrondie à 2 décimales)
pour tous les produits dont le prix est **strictement supérieur** à la moyenne de leur catégorie.

Trie par `categorie` ASC, puis `prix` DESC.

> 💡 Utilise une **sous-requête corrélée** ou un `JOIN` sur un `GROUP BY`
$md$,
    'sql', 'medium', 'code', 150, 52,
    '-- Produits au-dessus de la moyenne de leur catégorie
-- Colonnes : nom, categorie, prix, prix_moyen_cat

SELECT
  p.nom,
  p.categorie,
  p.prix,
  ROUND(avg_cat.prix_moyen, 2) AS prix_moyen_cat
FROM produits p
JOIN (
  SELECT categorie, AVG(prix) AS prix_moyen
  FROM produits
  GROUP BY categorie
) avg_cat ON p.categorie = avg_cat.categorie
WHERE p.prix > avg_cat.prix_moyen
ORDER BY p.categorie ASC, p.prix DESC;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE produits (id INTEGER PRIMARY KEY, nom TEXT, categorie TEXT, prix REAL);
INSERT INTO produits VALUES (1,'MacBook Pro','Informatique',2499);
INSERT INTO produits VALUES (2,'Dell XPS','Informatique',1299);
INSERT INTO produits VALUES (3,'ASUS VivoBook','Informatique',699);
INSERT INTO produits VALUES (4,'iPhone 15','Téléphonie',999);
INSERT INTO produits VALUES (5,'Samsung S24','Téléphonie',899);
INSERT INTO produits VALUES (6,'Xiaomi 14','Téléphonie',499);
INSERT INTO produits VALUES (7,'Sony WH-1000XM5','Audio',349);
INSERT INTO produits VALUES (8,'AirPods Pro','Audio',279);
INSERT INTO produits VALUES (9,'Bose QC45','Audio',329);$input$,
$expected$nom,categorie,prix,prix_moyen_cat
Sony WH-1000XM5,Audio,349,319.0
MacBook Pro,Informatique,2499,1499.0
iPhone 15,Téléphonie,999,799.0$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-subquery-above-average')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Sous-requête'),
  (gen_random_uuid(), (SELECT id FROM ch), 'AVG'),
  (gen_random_uuid(), (SELECT id FROM ch), 'JOIN');


-- ─── CHALLENGE 15: SQL - String manipulation ──────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-string-manipulation',
    'Nettoyage et formatage des emails',
    $md$## Contexte

La table `contacts` contient des emails mal formatés (espaces, majuscules, domaines variés). Tu dois les normaliser.

## Structure de la table

```
TABLE : contacts
┌────┬──────────────────────────┬───────────────────┐
│ id │ nom                      │ email_brut         │
├────┼──────────────────────────┼───────────────────┤
│ 1  │ alice martin             │  Alice@Gmail.COM  │
│ 2  │ BOB DUPONT               │ Bob@Outlook.fr    │
└────┴──────────────────────────┴───────────────────┘
```

## Objectif

Retourne pour chaque contact :
- `nom_formate` : prénom + nom avec initiales en majuscule (`INITCAP` dans PostgreSQL, ou gère manuellement)
- `email_propre` : email en **minuscules** sans espaces (`LOWER` + `TRIM`)
- `domaine` : partie après le `@` en minuscules

Trie par `id` ASC.

> 💡 `LOWER()`, `TRIM()`, `SUBSTR()`, `INSTR()` (SQLite) ou `SPLIT_PART()` (PostgreSQL)
$md$,
    'sql', 'easy', 'code', 100, 30,
    '-- Nettoyage emails
-- Colonnes : id, nom_formate, email_propre, domaine

SELECT
  id,
  -- nom_formate : utilise UPPER pour la première lettre...
  LOWER(TRIM(email_brut)) AS email_propre,
  LOWER(SUBSTR(TRIM(email_brut), INSTR(TRIM(email_brut), ''@'') + 1)) AS domaine
FROM contacts
ORDER BY id;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE contacts (id INTEGER PRIMARY KEY, nom TEXT, email_brut TEXT);
INSERT INTO contacts VALUES (1,'alice martin',' Alice@Gmail.COM');
INSERT INTO contacts VALUES (2,'BOB DUPONT','Bob@Outlook.fr ');
INSERT INTO contacts VALUES (3,'claire petit','  CLAIRE@Yahoo.fr  ');
INSERT INTO contacts VALUES (4,'david moreau','David@Company.com');$input$,
$expected$id,email_propre,domaine
1,alice@gmail.com,gmail.com
2,bob@outlook.fr,outlook.fr
3,claire@yahoo.fr,yahoo.fr
4,david@company.com,company.com$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-string-manipulation')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'LOWER'),
  (gen_random_uuid(), (SELECT id FROM ch), 'TRIM'),
  (gen_random_uuid(), (SELECT id FROM ch), 'String Functions');


-- ─── CHALLENGE 16: SQL - NTILE (percentiles) ──────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-ntile-quartiles',
    'Segmentation clients par quartile',
    $md$## Contexte

Tu veux segmenter tes clients en 4 groupes selon leur valeur totale de commandes (quartiles).

## Objectif

Pour chaque client, calcule :
- `client_id`
- `total_commandes` : total de ses commandes
- `quartile` : 1 (top 25%), 2, 3, 4 (bottom 25%) via `NTILE(4)`
- `segment` : label lisible :
  - 1 → `'Champions'`
  - 2 → `'Loyaux'`
  - 3 → `'Potentiels'`
  - 4 → `'À risque'`

Trie par `total_commandes` DESC.

> 💡 `NTILE(4) OVER (ORDER BY total_commandes DESC)` puis `CASE WHEN`
$md$,
    'sql', 'hard', 'code', 200, 65,
    '-- Segmentation clients par quartile de dépense
-- Colonnes : client_id, total_commandes, quartile, segment

WITH totaux AS (
  SELECT client_id, SUM(montant) AS total_commandes
  FROM commandes
  GROUP BY client_id
),
ranked AS (
  SELECT
    client_id,
    total_commandes,
    NTILE(4) OVER (ORDER BY total_commandes DESC) AS quartile
  FROM totaux
)
SELECT
  client_id,
  total_commandes,
  quartile,
  CASE quartile
    WHEN 1 THEN ''Champions''
    WHEN 2 THEN ''Loyaux''
    WHEN 3 THEN ''Potentiels''
    ELSE ''À risque''
  END AS segment
FROM ranked
ORDER BY total_commandes DESC;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE commandes (id INTEGER PRIMARY KEY, client_id INTEGER, montant REAL);
INSERT INTO commandes VALUES (1,101,1200);
INSERT INTO commandes VALUES (2,101,800);
INSERT INTO commandes VALUES (3,102,500);
INSERT INTO commandes VALUES (4,103,2100);
INSERT INTO commandes VALUES (5,103,900);
INSERT INTO commandes VALUES (6,104,300);
INSERT INTO commandes VALUES (7,105,150);
INSERT INTO commandes VALUES (8,105,200);
INSERT INTO commandes VALUES (9,106,1800);
INSERT INTO commandes VALUES (10,107,400);
INSERT INTO commandes VALUES (11,108,600);$input$,
$expected$client_id,total_commandes,quartile,segment
103,3000.0,1,Champions
106,1800.0,1,Champions
101,2000.0,1,Champions
102,500.0,2,Loyaux
108,600.0,2,Loyaux
111,1000.0,2,Loyaux
104,300.0,3,Potentiels
107,350.0,3,Potentiels
105,350.0,4,À risque$expected$,
  false, 200, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-ntile-quartiles')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'NTILE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Segmentation'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions'),
  (gen_random_uuid(), (SELECT id FROM ch), 'CASE WHEN');


-- ─── CHALLENGE 17: Pandas - Nettoyage de données ──────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-data-cleaning',
    'Nettoyage d''un dataset clients',
    $md$## Contexte

Tu reçois un fichier CSV de clients avec des données sales : valeurs manquantes, doublons, types incorrects.

## Données

```python
import pandas as pd
import io

data = """id,nom,age,email,salaire
1,Alice Martin,28,alice@mail.com,45000
2,Bob Dupont,,bob@mail.com,52000
3,Alice Martin,28,alice@mail.com,45000
4,Claire Petit,35,claire@mail.com,
5,David Moreau,29,david@mail.com,61000
6,,42,paul@mail.com,38000
7,Emma Laurent,31,emma@mail.com,57000
"""
df = pd.read_csv(io.StringIO(data))
```

## Objectif

1. Supprime les **doublons exacts** (même `nom`, `age`, `email`)
2. Supprime les lignes où `nom` est **vide / NaN**
3. Remplace les `salaire` manquants par la **médiane** des salaires connus (arrondi entier)
4. Convertis `age` en `int` (drop les NaN d'abord)

Affiche le DataFrame final trié par `id`, colonnes : `id, nom, age, email, salaire`

> 💡 `drop_duplicates()`, `dropna()`, `fillna()`, `astype()`
$md$,
    'data_engineering', 'easy', 'code', 100, 35,
    'import pandas as pd
import io

data = """id,nom,age,email,salaire
1,Alice Martin,28,alice@mail.com,45000
2,Bob Dupont,,bob@mail.com,52000
3,Alice Martin,28,alice@mail.com,45000
4,Claire Petit,35,claire@mail.com,
5,David Moreau,29,david@mail.com,61000
6,,42,paul@mail.com,38000
7,Emma Laurent,31,emma@mail.com,57000
"""
df = pd.read_csv(io.StringIO(data))

# 1. Supprimer les doublons
df = df.drop_duplicates(subset=[''nom'', ''age'', ''email''])

# 2. Supprimer les lignes sans nom
df = df.dropna(subset=[''nom''])

# 3. Remplir salaires manquants par la médiane
mediane = df[''salaire''].median()
df[''salaire''] = df[''salaire''].fillna(mediane).astype(int)

# 4. Convertir age en int
df[''age''] = df[''age''].astype(int)

result = df[[''id'', ''nom'', ''age'', ''email'', ''salaire'']].sort_values(''id'')
print(result.to_csv(index=False))',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$id,nom,age,email,salaire
1,Alice Martin,28,alice@mail.com,45000
2,Bob Dupont,28,bob@mail.com,52000
4,Claire Petit,35,claire@mail.com,52000
5,David Moreau,29,david@mail.com,61000
7,Emma Laurent,31,emma@mail.com,57000$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-data-cleaning')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Nettoyage'),
  (gen_random_uuid(), (SELECT id FROM ch), 'dropna'),
  (gen_random_uuid(), (SELECT id FROM ch), 'fillna');


-- ─── CHALLENGE 18: Pandas - Merge & Join ──────────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-merge-enrichissement',
    'Enrichissement de données avec merge',
    $md$## Contexte

Tu travailles sur deux DataFrames : `commandes` (historique des achats) et `produits` (catalogue).
Tu dois enrichir les commandes avec les infos produit.

## Objectif

1. Fais un `merge` inner entre `commandes` et `produits` sur `produit_id`
2. Calcule `ca_ligne` = `quantite * prix_unitaire`
3. Calcule par `categorie` :
   - `nb_commandes` : nombre de lignes
   - `ca_total` : somme de `ca_ligne`
   - `panier_moyen` : moyenne de `ca_ligne` arrondie à 2 décimales
4. Trie par `ca_total` DESC

Affiche le résultat avec `print(result.to_csv(index=False))`

> 💡 `pd.merge()`, `groupby()`, `agg()`
$md$,
    'data_engineering', 'medium', 'code', 150, 50,
    'import pandas as pd

commandes = pd.DataFrame({
    ''commande_id'': [1,2,3,4,5,6,7,8],
    ''produit_id'': [101,102,101,103,102,104,103,101],
    ''quantite'': [2,1,3,1,2,1,4,1]
})

produits = pd.DataFrame({
    ''produit_id'': [101,102,103,104],
    ''nom'': [''Laptop'',''Souris'',''Clavier'',''Écran''],
    ''categorie'': [''Informatique'',''Accessoires'',''Accessoires'',''Informatique''],
    ''prix_unitaire'': [899.0,29.0,79.0,299.0]
})

# Ton code ici
df = pd.merge(commandes, produits, on=''produit_id'')
df[''ca_ligne''] = df[''quantite''] * df[''prix_unitaire'']

result = df.groupby(''categorie'').agg(
    nb_commandes=(''commande_id'', ''count''),
    ca_total=(''ca_ligne'', ''sum''),
    panier_moyen=(''ca_ligne'', ''mean'')
).round(2).reset_index().sort_values(''ca_total'', ascending=False)

print(result.to_csv(index=False))',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$categorie,nb_commandes,ca_total,panier_moyen
Informatique,4,4194.0,1048.5
Accessoires,4,524.0,131.0$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-merge-enrichissement')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'merge'),
  (gen_random_uuid(), (SELECT id FROM ch), 'groupby'),
  (gen_random_uuid(), (SELECT id FROM ch), 'agg');


-- ─── CHALLENGE 19: Pandas - Séries temporelles ────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-time-series',
    'Analyse de séries temporelles',
    $md$## Contexte

Tu analyses le trafic journalier d'un site web sur 30 jours. Tu veux calculer une **moyenne mobile** sur 7 jours pour lisser les pics.

## Objectif

À partir du DataFrame `trafic` :
1. Convertis `date` en `datetime` et définis-le comme index
2. Calcule `ma_7j` = moyenne mobile sur 7 jours (`rolling(7).mean()`) arrondie à 1 décimale
3. Calcule `pct_change` = variation % par rapport au jour précédent (`pct_change()`) arrondie à 3 décimales
4. Retourne uniquement les lignes où `ma_7j` n'est pas NaN
5. Colonnes à afficher : `visites`, `ma_7j`, `pct_change`

Affiche avec `print(result.to_csv())`

> 💡 `pd.to_datetime()`, `rolling()`, `pct_change()`, `dropna()`
$md$,
    'data_engineering', 'medium', 'code', 150, 55,
    'import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range(''2024-01-01'', periods=14, freq=''D'')
visites = [1200,1350,980,1100,1420,1680,1250,1300,1180,1450,1600,1380,1290,1510]

df = pd.DataFrame({''date'': dates, ''visites'': visites})

# Ton code ici
df[''date''] = pd.to_datetime(df[''date''])
df = df.set_index(''date'')
df[''ma_7j''] = df[''visites''].rolling(7).mean().round(1)
df[''pct_change''] = df[''visites''].pct_change().round(3)
result = df.dropna(subset=[''ma_7j''])
print(result[[''visites'',''ma_7j'',''pct_change'']].to_csv())',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$date,visites,ma_7j,pct_change
2024-01-07,1250,1282.9,0.256
2024-01-08,1300,1282.9,0.04
2024-01-09,1180,1311.4,-0.092
2024-01-10,1450,1337.1,0.229
2024-01-11,1600,1351.4,0.103
2024-01-12,1380,1394.3,-0.138
2024-01-13,1290,1350.0,-0.065
2024-01-14,1510,1387.1,0.171$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-time-series')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'rolling'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Séries temporelles'),
  (gen_random_uuid(), (SELECT id FROM ch), 'pct_change');


-- ─── CHALLENGE 20: ML - Régression linéaire ───────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'ml-linear-regression',
    'Prédiction du prix immobilier',
    $md$## Contexte

Tu dois prédire le **prix de vente** d'appartements à partir de leurs caractéristiques.

## Features disponibles

| Feature         | Description                        |
|-----------------|-----------------------------------|
| `surface`       | Surface en m²                     |
| `nb_pieces`     | Nombre de pièces                  |
| `etage`         | Étage (0 = RDC)                   |
| `distance_metro`| Distance au métro en minutes      |
| `annee_construction` | Année de construction         |

## Objectif

1. Entraîne une `LinearRegression` sur 80% des données (random_state=42)
2. Évalue sur le test set : calcule `RMSE` et `R²`
3. Le modèle doit atteindre un **R² ≥ 0.85**

Affiche sur deux lignes :
```
RMSE: {valeur}
R2: {valeur}
```
$md$,
    'machine_learning', 'easy', 'code', 100, 40,
    'import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)
n = 200
surface = np.random.randint(25, 150, n)
nb_pieces = np.clip(surface // 25 + np.random.randint(-1, 2, n), 1, 6)
etage = np.random.randint(0, 10, n)
distance_metro = np.random.randint(2, 30, n)
annee = np.random.randint(1960, 2023, n)

prix = (surface * 6500
        + nb_pieces * 8000
        - distance_metro * 500
        + etage * 1000
        + (annee - 1960) * 200
        + np.random.normal(0, 15000, n))

df = pd.DataFrame({
    ''surface'': surface, ''nb_pieces'': nb_pieces,
    ''etage'': etage, ''distance_metro'': distance_metro,
    ''annee_construction'': annee, ''prix'': prix
})

X = df.drop(''prix'', axis=1)
y = df[''prix'']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)
print(f"RMSE: {rmse:.0f}")
print(f"R2: {r2:.4f}")',
    '{}', 60, 512, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$RMSE: 15432
R2: 0.9721$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'ml-linear-regression')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'sklearn'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Régression'),
  (gen_random_uuid(), (SELECT id FROM ch), 'RMSE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'R2');


-- ─── CHALLENGE 21: ML - Cross-validation & GridSearch ─────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'ml-cross-validation',
    'Optimisation avec GridSearchCV',
    $md$## Contexte

Tu entraînes un `RandomForestClassifier` sur le dataset Iris. Tu dois trouver les meilleurs hyperparamètres via `GridSearchCV`.

## Objectif

1. Charge le dataset Iris (`load_iris()`)
2. Configure un `GridSearchCV` avec :
   - `n_estimators`: [50, 100]
   - `max_depth`: [3, 5, None]
   - `cv=5`, `scoring='accuracy'`
3. Entraîne le GridSearch
4. Affiche :
   ```
   Best params: {params}
   Best CV score: {score}
   Test accuracy: {accuracy}
   ```
   - `Best CV score` et `Test accuracy` arrondis à **4 décimales**

> Le `Test accuracy` doit être ≥ **0.93**
$md$,
    'machine_learning', 'medium', 'code', 150, 58,
    'from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

param_grid = {
    ''n_estimators'': [50, 100],
    ''max_depth'': [3, 5, None]
}

grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring=''accuracy''
)
grid.fit(X_train, y_train)

best_score = grid.best_score_
test_accuracy = grid.score(X_test, y_test)

print(f"Best params: {grid.best_params_}")
print(f"Best CV score: {best_score:.4f}")
print(f"Test accuracy: {test_accuracy:.4f}")',
    '{}', 120, 512, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$Best params: {'max_depth': None, 'n_estimators': 100}
Best CV score: 0.9583
Test accuracy: 1.0000$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'ml-cross-validation')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'GridSearchCV'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Cross-validation'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Random Forest'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Hyperparamètres');


-- ─── CHALLENGE 22: SQL - Triple JOIN avec agrégation ──────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-triple-join',
    'Rapport ventes produits par catégorie',
    $md$## Contexte

Tu travailles avec 3 tables : `produits`, `categories`, `lignes_ventes`.

## Structure

```
categories          produits                    lignes_ventes
┌────┬─────────┐   ┌────┬────────┬────────┐   ┌────┬────────────┬────────┬────────┐
│ id │ nom     │   │ id │ nom    │ cat_id │   │ id │ produit_id │ qte    │ prix   │
└────┴─────────┘   └────┴────────┴────────┘   └────┴────────────┴────────┴────────┘
```

## Objectif

Pour chaque **catégorie**, retourne :
- `categorie` : nom de la catégorie
- `nb_produits` : nombre de produits distincts vendus
- `total_unites` : total des unités vendues
- `ca_total` : chiffre d'affaires total (`SUM(qte * prix)`) arrondi à 2 décimales
- `ca_moyen_produit` : CA moyen par produit arrondi à 2 décimales

Trie par `ca_total` DESC.
$md$,
    'sql', 'hard', 'code', 200, 68,
    '-- Rapport par catégorie
SELECT
  cat.nom AS categorie,
  COUNT(DISTINCT p.id) AS nb_produits,
  SUM(lv.qte) AS total_unites,
  ROUND(SUM(lv.qte * lv.prix), 2) AS ca_total,
  ROUND(SUM(lv.qte * lv.prix) / COUNT(DISTINCT p.id), 2) AS ca_moyen_produit
FROM categories cat
JOIN produits p ON p.cat_id = cat.id
JOIN lignes_ventes lv ON lv.produit_id = p.id
GROUP BY cat.id, cat.nom
ORDER BY ca_total DESC;',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE categories (id INTEGER PRIMARY KEY, nom TEXT);
INSERT INTO categories VALUES (1,'Électronique'),(2,'Vêtements'),(3,'Alimentation');
CREATE TABLE produits (id INTEGER PRIMARY KEY, nom TEXT, cat_id INTEGER);
INSERT INTO produits VALUES (1,'Laptop',1),(2,'Smartphone',1),(3,'T-Shirt',2),(4,'Jean',2),(5,'Café',3),(6,'Thé',3);
CREATE TABLE lignes_ventes (id INTEGER PRIMARY KEY, produit_id INTEGER, qte INTEGER, prix REAL);
INSERT INTO lignes_ventes VALUES (1,1,3,899),(2,1,2,899),(3,2,5,499),(4,2,3,499),(5,3,10,29),(6,3,8,29),(7,4,6,79),(8,5,20,12),(9,5,15,12),(10,6,25,8);$input$,
$expected$categorie,nb_produits,total_unites,ca_total,ca_moyen_produit
Électronique,2,13,6490.0,3245.0
Vêtements,2,24,870.0,435.0
Alimentation,2,60,560.0,280.0$expected$,
  false, 200, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-triple-join')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'JOIN'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Agrégation'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Multi-tables');


-- ─── CHALLENGE 23: Pandas - Pivot tables ──────────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-pivot-avance',
    'Tableau croisé dynamique des ventes',
    $md$## Contexte

Tu as un DataFrame de ventes avec colonnes `region`, `trimestre`, `produit`, `ca`. Tu veux construire un **pivot table** pour visualiser le CA par région et trimestre.

## Objectif

1. Crée un pivot table avec :
   - index = `region`
   - columns = `trimestre`
   - values = `ca`
   - aggfunc = `sum`
   - `fill_value=0`
2. Ajoute une colonne `TOTAL` = somme des 4 trimestres
3. Trie par `TOTAL` DESC
4. Arrondi tout à 0 décimales (entiers)

Affiche avec `print(result.to_csv())`
$md$,
    'data_engineering', 'medium', 'code', 150, 52,
    'import pandas as pd

data = {
    ''region'': [''Nord'',''Nord'',''Sud'',''Sud'',''Est'',''Est'',''Ouest'',''Ouest'',
                ''Nord'',''Sud'',''Est'',''Ouest''],
    ''trimestre'': [''Q1'',''Q2'',''Q1'',''Q2'',''Q1'',''Q2'',''Q1'',''Q2'',
                   ''Q3'',''Q3'',''Q3'',''Q3''],
    ''produit'': [''A'',''B'',''A'',''A'',''B'',''B'',''A'',''A'',
                 ''A'',''B'',''A'',''B''],
    ''ca'': [12000,8500,9000,11000,7500,6000,10000,8000,
             9500,8000,7000,6500]
}
df = pd.DataFrame(data)

# Ton code ici
pivot = pd.pivot_table(df, values=''ca'', index=''region'',
                       columns=''trimestre'', aggfunc=''sum'', fill_value=0)
pivot[''TOTAL''] = pivot.sum(axis=1)
pivot = pivot.sort_values(''TOTAL'', ascending=False).astype(int)
print(pivot.to_csv())',
    '{}', 30, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$trimestre,Q1,Q2,Q3,TOTAL
region,,,,
Nord,12000,8500,9500,30000
Ouest,10000,8000,6500,24500
Sud,9000,11000,8000,28000
Est,7500,6000,7000,20500$expected$,
  false, 150, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-pivot-avance')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'pivot_table'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Tableau croisé');


-- ─── CHALLENGE 24: ML - Feature Engineering ───────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'ml-feature-engineering',
    'Feature Engineering pour la prédiction de churn',
    $md$## Contexte

Tu prépares les features pour un modèle de prédiction de churn. Les données brutes contiennent des informations clients qu'il faut transformer.

## Objectif

À partir du DataFrame `df` :

1. **Encode** `plan` avec `LabelEncoder` → `plan_encoded`
2. **Crée** `ratio_support` = `nb_tickets_support / anciennete_mois` (arrondi à 4 décimales)
3. **Normalise** `montant_mensuel` avec `StandardScaler` → `montant_scaled` (arrondi à 4 décimales)
4. **One-hot encode** `region` (drop_first=True) → colonnes `region_Nord`, `region_Ouest`, `region_Sud`
5. Entraîne un `LogisticRegression(random_state=42, max_iter=200)` sur ces features
6. Affiche `Test accuracy: {score:.4f}`

> Le score doit être ≥ **0.80**
$md$,
    'machine_learning', 'hard', 'code', 200, 72,
    'import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 300
df = pd.DataFrame({
    ''anciennete_mois'': np.random.randint(1, 60, n),
    ''montant_mensuel'': np.random.uniform(10, 200, n),
    ''nb_tickets_support'': np.random.randint(0, 20, n),
    ''plan'': np.random.choice([''Free'',''Pro'',''Enterprise''], n),
    ''region'': np.random.choice([''Est'',''Ouest'',''Nord'',''Sud''], n),
})
df[''churn''] = ((df[''nb_tickets_support''] / df[''anciennete_mois''] > 0.3)
                 | (df[''montant_mensuel''] < 30)).astype(int)

le = LabelEncoder()
df[''plan_encoded''] = le.fit_transform(df[''plan''])
df[''ratio_support''] = (df[''nb_tickets_support''] / df[''anciennete_mois'']).round(4)

scaler = StandardScaler()
df[''montant_scaled''] = scaler.fit_transform(df[[''montant_mensuel'']]).round(4).flatten()

dummies = pd.get_dummies(df[''region''], prefix=''region'', drop_first=True).astype(int)
df = pd.concat([df, dummies], axis=1)

features = [''plan_encoded'',''ratio_support'',''montant_scaled'',''region_Nord'',''region_Ouest'',''region_Sud'']
X = df[features]
y = df[''churn'']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LogisticRegression(random_state=42, max_iter=200)
model.fit(X_train, y_train)
print(f"Test accuracy: {model.score(X_test, y_test):.4f}")',
    '{}', 60, 512, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$$input$,
$expected$Test accuracy: 0.8833$expected$,
  false, 200, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'ml-feature-engineering')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Feature Engineering'),
  (gen_random_uuid(), (SELECT id FROM ch), 'LabelEncoder'),
  (gen_random_uuid(), (SELECT id FROM ch), 'StandardScaler'),
  (gen_random_uuid(), (SELECT id FROM ch), 'One-hot encoding');


-- ─── CHALLENGE 25: SQL Expert - Détection de sessions ─────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-sessionization',
    'Détection de sessions utilisateur',
    $md$## Contexte

Un **événement** appartient à la même **session** que le précédent si l'écart est ≤ 30 minutes.
Si l'écart est > 30 min, c'est le début d'une nouvelle session.

## Objectif

Pour chaque user, numérote les sessions et calcule pour chaque session :
- `user_id`
- `session_id` : numéro de session (commence à 1 par user)
- `session_start` : premier événement de la session
- `session_end` : dernier événement
- `nb_events` : nombre d'événements
- `duree_minutes` : durée en minutes (end - start)

Trie par `user_id`, `session_id`.

> 💡 Utilise `LAG()` pour comparer timestamps, puis cumulative sum pour numéroter les sessions.
> `JULIANDAY()` dans SQLite pour les différences de dates.
$md$,
    'sql', 'expert', 'code', 300, 90,
    '-- Sessionisation avec window functions
-- Colonnes: user_id, session_id, session_start, session_end, nb_events, duree_minutes

WITH avec_lag AS (
  SELECT
    user_id,
    event_time,
    LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) AS prev_time
  FROM events
),
nouvelle_session AS (
  SELECT
    user_id,
    event_time,
    CASE
      WHEN prev_time IS NULL
        OR (JULIANDAY(event_time) - JULIANDAY(prev_time)) * 1440 > 30
      THEN 1 ELSE 0
    END AS new_session_flag
  FROM avec_lag
),
numerotation AS (
  SELECT
    user_id,
    event_time,
    SUM(new_session_flag) OVER (PARTITION BY user_id ORDER BY event_time) AS session_id
  FROM nouvelle_session
)
SELECT
  user_id,
  session_id,
  MIN(event_time) AS session_start,
  MAX(event_time) AS session_end,
  COUNT(*) AS nb_events,
  ROUND((JULIANDAY(MAX(event_time)) - JULIANDAY(MIN(event_time))) * 1440) AS duree_minutes
FROM numerotation
GROUP BY user_id, session_id
ORDER BY user_id, session_id;',
    '{}', 60, 256, true
  ) RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE events (id INTEGER PRIMARY KEY, user_id INTEGER, event_time TEXT);
INSERT INTO events VALUES (1,1,'2024-01-01 10:00:00');
INSERT INTO events VALUES (2,1,'2024-01-01 10:15:00');
INSERT INTO events VALUES (3,1,'2024-01-01 10:45:00');
INSERT INTO events VALUES (4,1,'2024-01-01 11:20:00');
INSERT INTO events VALUES (5,1,'2024-01-01 14:00:00');
INSERT INTO events VALUES (6,1,'2024-01-01 14:10:00');
INSERT INTO events VALUES (7,2,'2024-01-01 09:00:00');
INSERT INTO events VALUES (8,2,'2024-01-01 09:25:00');
INSERT INTO events VALUES (9,2,'2024-01-01 10:05:00');
INSERT INTO events VALUES (10,2,'2024-01-01 13:00:00');$input$,
$expected$user_id,session_id,session_start,session_end,nb_events,duree_minutes
1,1,2024-01-01 10:00:00,2024-01-01 11:20:00,4,80.0
1,2,2024-01-01 14:00:00,2024-01-01 14:10:00,2,10.0
2,1,2024-01-01 09:00:00,2024-01-01 10:05:00,3,65.0
2,2,2024-01-01 13:00:00,2024-01-01 13:00:00,1,0.0$expected$,
  false, 300, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-sessionization')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Sessionisation'),
  (gen_random_uuid(), (SELECT id FROM ch), 'LAG'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Product Analytics'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Expert');
