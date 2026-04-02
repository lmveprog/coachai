-- ============================================================
-- CoachAI — Seed: Challenges
-- ============================================================

-- ─── CHALLENGE 1: SQL Basic SELECT (Easy) ─────────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-basic-select',
    'Films les mieux notés',
    $md$## Contexte

Tu travailles pour une plateforme de streaming. La table `films` contient les données de la bibliothèque.

## Structure de la table

```
┌─────────────────────────────────────────────────────────┐
│                      TABLE : films                       │
├─────┬──────────────────────┬───────┬──────┬─────────────┤
│ id  │ titre                │ genre │ note │ vues        │
├─────┼──────────────────────┼───────┼──────┼─────────────┤
│ 1   │ Inception            │ Sci-Fi│ 8.8  │ 2 500 000   │
│ 2   │ Le Roi Lion          │ Anim  │ 8.5  │ 3 200 000   │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

## Objectif

Sélectionne les films dont la **note est ≥ 8.5**, triés par note **décroissante**.

**Colonnes à retourner :** `titre`, `note`, `vues`

## Exemple de résultat attendu

| titre           | note | vues    |
|----------------|------|---------|
| The Dark Knight | 9.0  | 3800000 |
| Inception       | 8.8  | 2500000 |
| ...             | ...  | ...     |

> 💡 **Indice :** Utilise `WHERE`, `ORDER BY` et `DESC`
$md$,
    'sql',
    'easy',
    'code',
    100,
    32,
    '-- Sélectionne les films les mieux notés (note >= 8.5)
-- Trie par note décroissante
-- Retourne : titre, note, vues

SELECT titre, note, vues
FROM films
WHERE -- ta condition ici
ORDER BY -- ton tri ici;',
    '{}',
    30,
    256,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT
  gen_random_uuid(),
  c.id,
$input$CREATE TABLE films (id INTEGER PRIMARY KEY, titre TEXT, genre TEXT, note REAL, vues INTEGER, annee INTEGER);
INSERT INTO films VALUES (1, 'Inception', 'Sci-Fi', 8.8, 2500000, 2010);
INSERT INTO films VALUES (2, 'Le Roi Lion', 'Animation', 8.5, 3200000, 1994);
INSERT INTO films VALUES (3, 'Interstellar', 'Sci-Fi', 8.6, 2100000, 2014);
INSERT INTO films VALUES (4, 'Titanic', 'Romance', 7.8, 5000000, 1997);
INSERT INTO films VALUES (5, 'Avengers: Endgame', 'Action', 8.4, 4500000, 2019);
INSERT INTO films VALUES (6, 'Amélie Poulain', 'Comédie', 8.3, 1200000, 2001);
INSERT INTO films VALUES (7, 'Parasite', 'Thriller', 8.6, 1800000, 2019);
INSERT INTO films VALUES (8, 'The Dark Knight', 'Action', 9.0, 3800000, 2008);$input$,
$expected$titre,note,vues
The Dark Knight,9.0,3800000
Inception,8.8,2500000
Interstellar,8.6,2100000
Parasite,8.6,1800000
Le Roi Lion,8.5,3200000$expected$,
  false,
  100,
  0
FROM c;

-- Tags
WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-basic-select')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'SELECT'),
  (gen_random_uuid(), (SELECT id FROM ch), 'WHERE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'ORDER BY');


-- ─── CHALLENGE 2: SQL GROUP BY Ventes (Easy) ──────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-ventes-par-region',
    'Ventes par région',
    $md$## Contexte

Tu analyses les ventes d'une entreprise internationale. La table `ventes` contient l'historique des transactions.

## Structure de la table

```
┌──────────────────────────────────────────────────────────────┐
│                       TABLE : ventes                          │
├────┬───────────────┬──────────┬──────────┬──────────────────┤
│ id │ region        │ produit  │ montant  │ date_vente       │
├────┼───────────────┼──────────┼──────────┼──────────────────┤
│ 1  │ Europe        │ Laptop   │ 1200.00  │ 2024-01-15       │
│ 2  │ Amérique      │ Phone    │  850.00  │ 2024-01-16       │
│ ...│ ...           │ ...      │ ...      │ ...              │
└────┴───────────────┴──────────┴──────────┴──────────────────┘
```

## Objectif

Calcule pour chaque région :
- Le **total des ventes** (`total_ventes`)
- Le **nombre de transactions** (`nb_transactions`)
- La **vente moyenne** (`vente_moyenne`) arrondie à 2 décimales

Trie par `total_ventes` **décroissant**.

## Fonctions utiles

| Fonction      | Description                        |
|-------------|-------------------------------------|
| `SUM(col)`   | Somme d'une colonne numérique       |
| `COUNT(*)`   | Nombre de lignes                    |
| `AVG(col)`   | Moyenne d'une colonne               |
| `ROUND(x,n)` | Arrondit à n décimales              |

> 💡 **Rappel :** `GROUP BY` regroupe les lignes ayant la même valeur dans une colonne.
$md$,
    'sql',
    'easy',
    'code',
    100,
    32,
    '-- Calcule les statistiques de ventes par région
-- Colonnes: region, total_ventes, nb_transactions, vente_moyenne
-- Trie par total_ventes décroissant

SELECT
  region,
  -- complète ici
FROM ventes
GROUP BY region
ORDER BY total_ventes DESC;',
    '{}',
    30,
    256,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT
  gen_random_uuid(),
  c.id,
$input$CREATE TABLE ventes (id INTEGER PRIMARY KEY, region TEXT, produit TEXT, montant REAL, date_vente TEXT);
INSERT INTO ventes VALUES (1, 'Europe', 'Laptop', 1200.0, '2024-01-15');
INSERT INTO ventes VALUES (2, 'Amérique', 'Phone', 850.0, '2024-01-16');
INSERT INTO ventes VALUES (3, 'Europe', 'Phone', 750.0, '2024-01-17');
INSERT INTO ventes VALUES (4, 'Asie', 'Tablet', 500.0, '2024-01-18');
INSERT INTO ventes VALUES (5, 'Amérique', 'Laptop', 1300.0, '2024-01-19');
INSERT INTO ventes VALUES (6, 'Asie', 'Phone', 600.0, '2024-01-20');
INSERT INTO ventes VALUES (7, 'Europe', 'Tablet', 450.0, '2024-01-21');
INSERT INTO ventes VALUES (8, 'Amérique', 'Tablet', 520.0, '2024-01-22');
INSERT INTO ventes VALUES (9, 'Asie', 'Laptop', 1100.0, '2024-01-23');
INSERT INTO ventes VALUES (10, 'Europe', 'Laptop', 1350.0, '2024-01-24');$input$,
$expected$region,total_ventes,nb_transactions,vente_moyenne
Europe,3750.0,4,937.5
Amérique,2670.0,3,890.0
Asie,2200.0,3,733.33$expected$,
  false,
  100,
  0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-ventes-par-region')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'GROUP BY'),
  (gen_random_uuid(), (SELECT id FROM ch), 'SUM'),
  (gen_random_uuid(), (SELECT id FROM ch), 'COUNT'),
  (gen_random_uuid(), (SELECT id FROM ch), 'AVG');


-- ─── CHALLENGE 3: SQL Top N clients (Medium) ──────────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-top-clients',
    'Top 5 clients par chiffre d''affaires',
    $md$## Contexte

Tu travailles dans le service analytics d'un e-commerce. Tu dois identifier les meilleurs clients pour le programme fidélité VIP.

## Tables disponibles

```
TABLE : clients                    TABLE : commandes
┌────┬──────────────┬──────────┐  ┌────┬───────────┬────────────┬──────────┐
│ id │ nom          │ email    │  │ id │ client_id │ produit    │ montant  │
├────┼──────────────┼──────────┤  ├────┼───────────┼────────────┼──────────┤
│ 1  │ Alice Martin │ ...      │  │ 1  │ 1         │ MacBook    │ 2400.00  │
│ 2  │ Bob Dupont   │ ...      │  │ 2  │ 1         │ iPhone     │  999.00  │
│ 3  │ ...          │ ...      │  │ ...│ ...       │ ...        │ ...      │
└────┴──────────────┴──────────┘  └────┴───────────┴────────────┴──────────┘
```

## Objectif

Retourne les **5 meilleurs clients** par chiffre d'affaires total, avec :
- `nom` du client
- `nb_commandes` (nombre de commandes)
- `ca_total` (chiffre d'affaires total, arrondi à 2 décimales)

Trie par `ca_total` **décroissant**.

## Concepts clés

```sql
-- Jointure entre deux tables
SELECT a.col1, b.col2
FROM table_a a
JOIN table_b b ON a.id = b.table_a_id

-- Limite les résultats
LIMIT 5
```

> 💡 **Astuce :** Commence par JOIN, puis GROUP BY, puis LIMIT
$md$,
    'sql',
    'medium',
    'code',
    150,
    48,
    '-- Trouve les 5 meilleurs clients par chiffre d''affaires
-- Colonnes: nom, nb_commandes, ca_total
-- Trie par ca_total décroissant, limite à 5

SELECT
  c.nom,
  COUNT(o.id) AS nb_commandes,
  ROUND(SUM(o.montant), 2) AS ca_total
FROM clients c
JOIN commandes o ON -- ta condition de jointure
GROUP BY c.id, c.nom
ORDER BY ca_total DESC
LIMIT 5;',
    '{}',
    30,
    256,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT, email TEXT, pays TEXT);
INSERT INTO clients VALUES (1, 'Alice Martin', 'alice@test.com', 'France');
INSERT INTO clients VALUES (2, 'Bob Dupont', 'bob@test.com', 'Belgique');
INSERT INTO clients VALUES (3, 'Charlie Leroy', 'charlie@test.com', 'France');
INSERT INTO clients VALUES (4, 'Diana Moreau', 'diana@test.com', 'Suisse');
INSERT INTO clients VALUES (5, 'Étienne Bernard', 'etienne@test.com', 'France');
INSERT INTO clients VALUES (6, 'Fanny Petit', 'fanny@test.com', 'Canada');
CREATE TABLE commandes (id INTEGER PRIMARY KEY, client_id INTEGER, produit TEXT, montant REAL, date_commande TEXT);
INSERT INTO commandes VALUES (1, 1, 'MacBook Pro', 2400.0, '2024-01-10');
INSERT INTO commandes VALUES (2, 1, 'iPhone 15', 999.0, '2024-01-15');
INSERT INTO commandes VALUES (3, 2, 'Samsung TV', 1200.0, '2024-01-12');
INSERT INTO commandes VALUES (4, 2, 'AirPods', 250.0, '2024-01-18');
INSERT INTO commandes VALUES (5, 2, 'iPad', 850.0, '2024-01-20');
INSERT INTO commandes VALUES (6, 3, 'Dell XPS', 1800.0, '2024-01-08');
INSERT INTO commandes VALUES (7, 4, 'Surface Pro', 1500.0, '2024-01-22');
INSERT INTO commandes VALUES (8, 4, 'Keyboard', 180.0, '2024-01-25');
INSERT INTO commandes VALUES (9, 5, 'Sony Headset', 350.0, '2024-01-14');
INSERT INTO commandes VALUES (10, 6, 'Monitor', 600.0, '2024-01-16');
INSERT INTO commandes VALUES (11, 6, 'Webcam', 120.0, '2024-01-19');$input$,
$expected$nom,nb_commandes,ca_total
Alice Martin,2,3399.0
Bob Dupont,3,2300.0
Charlie Leroy,1,1800.0
Diana Moreau,2,1680.0
Fanny Petit,2,720.0$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-top-clients')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'JOIN'),
  (gen_random_uuid(), (SELECT id FROM ch), 'GROUP BY'),
  (gen_random_uuid(), (SELECT id FROM ch), 'LIMIT');


-- ─── CHALLENGE 4: SQL Analyse croissance mensuelle (Hard) ─────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-croissance-mensuelle',
    'Analyse de croissance mensuelle',
    $md$## Contexte

Tu es Data Analyst chez une startup SaaS. Le CFO te demande un rapport mensuel sur l'évolution du chiffre d'affaires.

## Table disponible

```
TABLE : transactions
┌────┬──────────────┬──────────┐
│ id │ date_tx      │ montant  │
├────┼──────────────┼──────────┤
│ 1  │ 2024-01-05   │ 1200.0   │
│ 2  │ 2024-01-12   │  850.0   │
│ 3  │ 2024-02-03   │ 1500.0   │
└────┴──────────────┴──────────┘
```

## Objectif

Calcule pour chaque mois (format `YYYY-MM`) :
- `mois` : le mois au format YYYY-MM
- `ca_mensuel` : chiffre d'affaires du mois
- `ca_mois_precedent` : CA du mois précédent (NULL pour le premier)
- `croissance_pct` : taux de croissance en % arrondi à 2 décimales (NULL si pas de mois précédent)

Trie par `mois` **croissant**.

## Fonctions à utiliser

```sql
-- Extraire le mois d'une date
strftime('%Y-%m', date_col)   -- SQLite

-- Accéder à la valeur de la ligne précédente
LAG(col) OVER (ORDER BY col)

-- Calculer le taux de variation
ROUND((valeur_actuelle - valeur_precedente) * 100.0 / valeur_precedente, 2)
```

## Structure recommandée

```sql
WITH monthly AS (
  -- Agrégation par mois
),
with_lag AS (
  -- Ajout de LAG()
)
SELECT * FROM with_lag ORDER BY mois;
```

> 💡 **Astuce :** Utilise deux CTEs : une pour l'agrégation, une pour le LAG
$md$,
    'sql',
    'hard',
    'code',
    200,
    64,
    '-- Analyse la croissance mensuelle du CA
-- Utilise des CTEs et la fonction LAG()

WITH monthly AS (
  SELECT
    strftime(''%Y-%m'', date_tx) AS mois,
    ROUND(SUM(montant), 2) AS ca_mensuel
  FROM transactions
  GROUP BY strftime(''%Y-%m'', date_tx)
),
with_lag AS (
  SELECT
    mois,
    ca_mensuel,
    LAG(ca_mensuel) OVER (ORDER BY mois) AS ca_mois_precedent,
    -- calcule le taux de croissance ici
  FROM monthly
)
SELECT * FROM with_lag ORDER BY mois;',
    '{}',
    30,
    256,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE transactions (id INTEGER PRIMARY KEY, date_tx TEXT, montant REAL, categorie TEXT);
INSERT INTO transactions VALUES (1, '2024-01-05', 1200.0, 'SaaS');
INSERT INTO transactions VALUES (2, '2024-01-12', 850.0, 'SaaS');
INSERT INTO transactions VALUES (3, '2024-01-28', 650.0, 'Conseil');
INSERT INTO transactions VALUES (4, '2024-02-03', 1500.0, 'SaaS');
INSERT INTO transactions VALUES (5, '2024-02-14', 900.0, 'SaaS');
INSERT INTO transactions VALUES (6, '2024-02-22', 400.0, 'Conseil');
INSERT INTO transactions VALUES (7, '2024-03-07', 2100.0, 'SaaS');
INSERT INTO transactions VALUES (8, '2024-03-19', 750.0, 'SaaS');
INSERT INTO transactions VALUES (9, '2024-03-25', 1200.0, 'Conseil');$input$,
$expected$mois,ca_mensuel,ca_mois_precedent,croissance_pct
2024-01,2700.0,,
2024-02,2800.0,2700.0,3.7
2024-03,4050.0,2800.0,44.64$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-croissance-mensuelle')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'CTE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'LAG'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions');


-- ─── CHALLENGE 5: SQL Détection anomalies (Expert) ────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-detection-anomalies',
    'Détection d''anomalies de facturation',
    $md$## Contexte

Tu es Data Analyst dans le département fraude d'une fintech. Tu dois identifier les transactions suspectes : des transactions dont le montant est **plus de 2 fois supérieur à la moyenne des 30 jours précédents** pour ce même client.

## Table disponible

```
TABLE : factures
┌────┬───────────┬──────────────┬──────────┐
│ id │ client_id │ date_facture │ montant  │
└────┴───────────┴──────────────┴──────────┘
```

## Objectif

Retourne les transactions suspectes avec :
- `id` de la transaction
- `client_id`
- `date_facture`
- `montant`
- `moyenne_30j` : moyenne du client sur les 30j précédents (arrondie à 2 décimales)
- `ratio` : montant / moyenne_30j (arrondi à 2 décimales)

Trie par `ratio` **décroissant**.

## Approche recommandée

```sql
WITH stats AS (
  SELECT
    f.id,
    f.client_id,
    f.date_facture,
    f.montant,
    AVG(hist.montant) OVER (
      PARTITION BY f.client_id
      ORDER BY f.date_facture
      ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
    ) AS moyenne_30j
  FROM factures f
  ...
)
SELECT * FROM stats
WHERE montant > 2 * moyenne_30j;
```

> ⚠️ **Expert level :** Combiner window functions, self-join ou subquery corrélée, et filtrage conditionnel.
$md$,
    'sql',
    'expert',
    'code',
    300,
    96,
    '-- Détecte les transactions suspectes (montant > 2x la moyenne 30j du client)

WITH stats AS (
  SELECT
    f.id,
    f.client_id,
    f.date_facture,
    f.montant,
    ROUND(AVG(hist.montant), 2) AS moyenne_30j
  FROM factures f
  LEFT JOIN factures hist
    ON hist.client_id = f.client_id
    AND hist.date_facture < f.date_facture
    AND julianday(f.date_facture) - julianday(hist.date_facture) <= 30
  GROUP BY f.id, f.client_id, f.date_facture, f.montant
)
SELECT
  id,
  client_id,
  date_facture,
  montant,
  moyenne_30j,
  ROUND(montant / moyenne_30j, 2) AS ratio
FROM stats
WHERE moyenne_30j IS NOT NULL
  AND montant > 2 * moyenne_30j
ORDER BY ratio DESC;',
    '{}',
    45,
    512,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE factures (id INTEGER PRIMARY KEY, client_id INTEGER, date_facture TEXT, montant REAL);
INSERT INTO factures VALUES (1, 1, '2024-01-05', 200.0);
INSERT INTO factures VALUES (2, 1, '2024-01-15', 180.0);
INSERT INTO factures VALUES (3, 1, '2024-02-01', 950.0);
INSERT INTO factures VALUES (4, 2, '2024-01-10', 500.0);
INSERT INTO factures VALUES (5, 2, '2024-01-20', 480.0);
INSERT INTO factures VALUES (6, 2, '2024-02-05', 2500.0);
INSERT INTO factures VALUES (7, 1, '2024-02-20', 220.0);
INSERT INTO factures VALUES (8, 2, '2024-02-25', 510.0);$input$,
$expected$id,client_id,date_facture,montant,moyenne_30j,ratio
3,1,2024-02-01,950.0,190.0,5.0
6,2,2024-02-05,2500.0,490.0,5.1$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-detection-anomalies')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Self-Join'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Window Functions'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Fraude');


-- ─── CHALLENGE 6: Python Pandas Analyse RFM (Medium) ─────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-analyse-rfm',
    'Segmentation RFM des clients',
    $md$## Contexte

La segmentation **RFM** (Recency, Frequency, Monetary) est une technique fondamentale en marketing data pour classer les clients selon leur comportement d'achat.

## Les 3 dimensions RFM

| Dimension   | Signification                                     | Calcul                        |
|-------------|---------------------------------------------------|-------------------------------|
| **R**ecency | Depuis combien de temps le client a acheté        | Jours depuis dernier achat    |
| **F**requency | Combien de fois le client a acheté              | Nombre de commandes           |
| **M**onetary | Combien le client a dépensé                     | Somme des montants            |

## Objectif

À partir du DataFrame `orders` fourni :

1. Calcule les métriques RFM par client (référence : `2024-06-01`)
2. Assigne un **score 1-3** pour chaque dimension :
   - **R** : 3 = le plus récent, 1 = le moins récent
   - **F** et **M** : 3 = le plus élevé, 1 = le moins élevé
   - Utilise `pd.qcut` avec 3 quantiles
3. Calcule le **score_total** = R + F + M
4. Affiche les clients triés par `score_total` décroissant

**Format de sortie attendu :**
```
client_id,recency,frequency,monetary,score_R,score_F,score_M,score_total
3,15,5,1850.0,3,3,3,9
1,45,3,1399.0,2,2,2,6
...
```

> 💡 **Pandas utile :** `groupby`, `agg`, `pd.qcut`, `merge`
$md$,
    'data_engineering',
    'medium',
    'code',
    150,
    48,
    'import pandas as pd
import numpy as np
from datetime import datetime

# Dataset de commandes
data = {
    "order_id": range(1, 21),
    "client_id": [1,1,1,2,2,3,3,3,3,3,4,4,5,5,5,5,6,6,7,7],
    "date": ["2024-04-17","2024-03-10","2024-05-01",
             "2024-01-15","2024-02-20",
             "2024-05-15","2024-05-10","2024-04-22","2024-04-01","2024-03-15",
             "2024-02-01","2024-01-10",
             "2024-05-20","2024-05-05","2024-04-18","2024-03-30",
             "2024-01-05","2024-02-10",
             "2024-04-25","2024-05-12"],
    "montant": [500,450,449,300,280,400,350,320,380,400,200,180,500,450,430,470,100,120,350,380]
}
df = pd.DataFrame(data)
df["date"] = pd.to_datetime(df["date"])

reference_date = pd.Timestamp("2024-06-01")

# --- TON CODE ICI ---
# 1. Calcule recency (jours depuis dernier achat), frequency (nb commandes), monetary (somme)
# 2. Assigne les scores 1-3 avec pd.qcut
# 3. Calcule score_total
# 4. Affiche le résultat trié

# Exemple de sortie (print ligne par ligne):
# print(f"{row.client_id},{row.recency},{row.frequency},{row.monetary},{row.score_R},{row.score_F},{row.score_M},{row.score_total}")',
    '{"metric": "exact_output"}',
    60,
    512,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
  NULL,
$expected$client_id,recency,frequency,monetary,score_R,score_F,score_M,score_total
3,16,5,1850.0,3,3,3,9
5,11,4,1850.0,3,2,3,8
1,30,3,1399.0,2,2,2,6
7,20,2,730.0,3,1,1,5
2,100,2,580.0,1,1,1,3
4,141,2,380.0,1,1,1,3
6,141,2,220.0,1,1,1,3$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-analyse-rfm')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'RFM'),
  (gen_random_uuid(), (SELECT id FROM ch), 'groupby'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Marketing Analytics');


-- ─── CHALLENGE 7: Python Pandas Pivot (Medium) ───────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'pandas-pivot-ventes',
    'Tableau croisé dynamique des ventes',
    $md$## Contexte

Tu travailles pour une chaîne de retail. Tu dois créer un tableau de bord croisé pour comparer les ventes par **produit** et par **trimestre**.

## Objectif

À partir du DataFrame `sales` fourni, crée un **pivot table** qui montre le total des ventes (colonne `montant`) par :
- **Lignes** : `produit`
- **Colonnes** : `trimestre` (Q1, Q2, Q3, Q4)

Puis :
1. Ajoute une colonne `Total` (somme des 4 trimestres)
2. Trie par `Total` **décroissant**
3. Affiche le résultat

**Format de sortie (print ligne par ligne) :**
```
produit,Q1,Q2,Q3,Q4,Total
Laptop,12000.0,15000.0,11000.0,18000.0,56000.0
...
```

## Fonctions utiles

```python
# Pivot table
pd.pivot_table(df, values="col", index="row", columns="col2", aggfunc="sum", fill_value=0)

# Ajouter une colonne total
df["Total"] = df.sum(axis=1)
```

> 💡 **Astuce :** `fill_value=0` remplace les valeurs manquantes par 0
$md$,
    'data_engineering',
    'medium',
    'code',
    150,
    48,
    'import pandas as pd

data = {
    "produit": ["Laptop","Laptop","Laptop","Laptop","Phone","Phone","Phone","Phone",
                "Tablet","Tablet","Tablet","Tablet","Monitor","Monitor","Monitor","Monitor"],
    "trimestre": ["Q1","Q2","Q3","Q4","Q1","Q2","Q3","Q4","Q1","Q2","Q3","Q4","Q1","Q2","Q3","Q4"],
    "montant": [12000,15000,11000,18000,8000,9500,8500,12000,4000,4500,3800,5200,3000,2800,3200,4000]
}
df = pd.DataFrame(data)

# --- TON CODE ICI ---
# 1. Crée un pivot_table avec produit en index, trimestre en colonnes, somme des montants
# 2. Ajoute la colonne Total
# 3. Trie par Total décroissant
# 4. Print chaque ligne au format: produit,Q1,Q2,Q3,Q4,Total',
    '{"metric": "exact_output"}',
    30,
    512,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
  NULL,
$expected$produit,Q1,Q2,Q3,Q4,Total
Laptop,12000,15000,11000,18000,56000
Phone,8000,9500,8500,12000,38000
Tablet,4000,4500,3800,5200,17500
Monitor,3000,2800,3200,4000,13000$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'pandas-pivot-ventes')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Pandas'),
  (gen_random_uuid(), (SELECT id FROM ch), 'pivot_table'),
  (gen_random_uuid(), (SELECT id FROM ch), 'reshape');


-- ─── CHALLENGE 8: ML Classification Churn (Medium) ───────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'ml-churn-prediction',
    'Prédiction de churn client',
    $md$## Contexte

Le churn (attrition client) est un enjeu majeur pour les entreprises SaaS. Tu dois construire un modèle pour prédire quels clients vont se désabonner.

## Métriques du dataset

| Feature               | Description                              |
|-----------------------|------------------------------------------|
| `tenure`              | Durée d'abonnement en mois               |
| `monthly_charges`     | Charges mensuelles (€)                   |
| `total_charges`       | Total payé (€)                           |
| `num_products`        | Nombre de produits souscrits             |
| `support_calls`       | Appels support (6 derniers mois)         |
| `satisfaction_score`  | Score satisfaction 1-10                  |
| `churn`               | **Cible** : 1 = churné, 0 = actif        |

## Objectif

Entraîne un **RandomForestClassifier** pour prédire `churn`.

**Critère de succès :** AUC-ROC ≥ **0.85** sur le jeu de test

## Étapes recommandées

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_proba = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, y_proba)
print(round(auc, 2))
```

**Le programme doit afficher** uniquement le score AUC-ROC arrondi à 2 décimales.

> 💡 **Astuce :** Un AUC > 0.85 est atteignable avec les hyperparamètres par défaut sur ce dataset.
$md$,
    'machine_learning',
    'medium',
    'code',
    150,
    48,
    'import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

np.random.seed(42)
n = 1000

# Génération du dataset
tenure = np.random.randint(1, 72, n)
monthly_charges = np.random.uniform(20, 120, n)
num_products = np.random.randint(1, 6, n)
support_calls = np.random.randint(0, 15, n)
satisfaction_score = np.random.randint(1, 11, n)
total_charges = tenure * monthly_charges + np.random.normal(0, 50, n)

# Churn basé sur des règles réalistes
churn_prob = (
    0.4 * (tenure < 12) +
    0.3 * (monthly_charges > 80) +
    0.2 * (support_calls > 8) +
    0.3 * (satisfaction_score < 5) -
    0.2 * (num_products > 3)
)
churn_prob = np.clip(churn_prob / churn_prob.max(), 0.05, 0.95)
churn = (np.random.random(n) < churn_prob).astype(int)

df = pd.DataFrame({
    "tenure": tenure,
    "monthly_charges": monthly_charges.round(2),
    "total_charges": total_charges.round(2),
    "num_products": num_products,
    "support_calls": support_calls,
    "satisfaction_score": satisfaction_score,
    "churn": churn
})

X = df.drop("churn", axis=1)
y = df["churn"]

# --- TON CODE ICI ---
# Entraîne un RandomForestClassifier
# Calcule l''AUC-ROC sur le test set
# Affiche uniquement le score arrondi à 2 décimales
# print(round(auc, 2))',
    '{"metric": "threshold", "threshold": 0.85, "comparison": "gte"}',
    120,
    1024,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
  NULL,
  '0.85',
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'ml-churn-prediction')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'RandomForest'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Classification'),
  (gen_random_uuid(), (SELECT id FROM ch), 'AUC-ROC'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Churn');


-- ─── CHALLENGE 9: ML Clustering K-Means (Medium) ─────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'ml-kmeans-segmentation',
    'Segmentation clients par K-Means',
    $md$## Contexte

Tu dois segmenter automatiquement une base clients pour cibler les campagnes marketing. Le **K-Means** est l'algorithme de clustering non supervisé le plus utilisé en pratique.

## Principe du K-Means

```
1. Initialise K centroïdes aléatoirement
2. Assigne chaque point au centroïde le plus proche
3. Recalcule les centroïdes (barycentre du cluster)
4. Répète jusqu'à convergence
```

## Objectif

Sur le dataset clients fourni (features: `recency`, `frequency`, `monetary`) :

1. Normalise les features avec **StandardScaler**
2. Applique **KMeans** avec `n_clusters=4`, `random_state=42`
3. Calcule le **Silhouette Score** (mesure la qualité du clustering)
4. Affiche le score arrondi à 2 décimales

**Critère de succès :** Silhouette Score ≥ **0.40**

## Métriques d'évaluation du clustering

| Métrique          | Plage    | Interprétation              |
|-------------------|----------|-----------------------------|
| Silhouette Score  | [-1, 1]  | Plus proche de 1 = meilleur |
| Inertia           | [0, ∞)   | Plus faible = meilleur      |
| Davies-Bouldin    | [0, ∞)   | Plus faible = meilleur      |

> 💡 **Toujours normaliser** les features avant K-Means car l'algorithme est sensible à l'échelle.
$md$,
    'machine_learning',
    'medium',
    'code',
    150,
    48,
    'import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

np.random.seed(42)

# Génération du dataset clients (4 segments distincts)
def make_cluster(n, rec_range, freq_range, mon_range):
    return np.column_stack([
        np.random.randint(*rec_range, n),
        np.random.randint(*freq_range, n),
        np.random.uniform(*mon_range, n).round(2)
    ])

# Segment 1: Clients VIP (récents, fréquents, gros panier)
s1 = make_cluster(150, (1, 20), (10, 20), (500, 2000))
# Segment 2: Clients réguliers (moyennement récents)
s2 = make_cluster(200, (20, 60), (5, 10), (100, 500))
# Segment 3: Clients inactifs (anciens, peu fréquents)
s3 = make_cluster(200, (180, 365), (1, 3), (20, 150))
# Segment 4: Nouveaux clients (très récents, 1 achat)
s4 = make_cluster(150, (1, 10), (1, 2), (50, 300))

X = np.vstack([s1, s2, s3, s4])

# --- TON CODE ICI ---
# 1. Normalise avec StandardScaler
# 2. Applique KMeans(n_clusters=4, random_state=42)
# 3. Calcule le silhouette_score
# 4. print(round(score, 2))',
    '{"metric": "threshold", "threshold": 0.40, "comparison": "gte"}',
    120,
    1024,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
  NULL,
  '0.4',
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'ml-kmeans-segmentation')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'KMeans'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Clustering'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Unsupervised'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Silhouette');


-- ─── CHALLENGE 10: SQL Cohorte rétention (Expert) ────────────────────────────
WITH c AS (
  INSERT INTO challenges (id, slug, title, description, category, difficulty, challenge_type,
    base_points, elo_reward, starter_code, evaluation_config, time_limit_seconds, memory_limit_mb, is_published)
  VALUES (
    gen_random_uuid(),
    'sql-analyse-cohorte',
    'Analyse de cohorte utilisateurs',
    $md$## Contexte

L'analyse de cohorte est une technique avancée pour mesurer la **rétention** : quel pourcentage des utilisateurs inscrits un mois donné reviennent les mois suivants ?

## Exemple de résultat

```
cohorte    | mois_0 | mois_1 | mois_2 | mois_3
-----------+--------+--------+--------+--------
2024-01    | 100%   |  65%   |  45%   |  32%
2024-02    | 100%   |  58%   |  40%   |
2024-03    | 100%   |  62%   |        |
```

## Tables disponibles

```
TABLE : users              TABLE : events
┌────┬───────────┐         ┌────┬─────────┬───────────────┐
│ id │ signup_dt │         │ id │ user_id │ event_date    │
└────┴───────────┘         └────┴─────────┴───────────────┘
```

## Objectif

Calcule le taux de rétention par cohorte (mois d'inscription) et mois d'activité (0, 1, 2, 3...).

Colonnes à retourner :
- `cohorte` : mois d'inscription (YYYY-MM)
- `mois_offset` : mois depuis inscription (0, 1, 2, 3)
- `nb_actifs` : nombre d'utilisateurs actifs ce mois
- `taille_cohorte` : taille de la cohorte initiale
- `retention_pct` : pourcentage de rétention (arrondi à 1 décimale)

Trie par `cohorte`, puis `mois_offset`.

> 🏆 **Expert :** Nécessite des CTEs imbriquées, window functions, et calculs de dates.
$md$,
    'sql',
    'expert',
    'code',
    300,
    96,
    '-- Analyse de cohorte : rétention mensuelle par cohorte d''inscription

WITH
-- Cohorte de chaque utilisateur (mois d''inscription)
user_cohorts AS (
  SELECT
    id AS user_id,
    strftime(''%Y-%m'', signup_dt) AS cohorte
  FROM users
),
-- Taille de chaque cohorte
cohort_sizes AS (
  SELECT cohorte, COUNT(*) AS taille_cohorte
  FROM user_cohorts
  GROUP BY cohorte
),
-- Activité mensuelle par utilisateur avec décalage depuis la cohorte
user_activity AS (
  SELECT
    uc.user_id,
    uc.cohorte,
    strftime(''%Y-%m'', e.event_date) AS mois_activite,
    CAST(
      (strftime(''%m'', e.event_date) - strftime(''%m'', uc.cohorte) +
       12 * (strftime(''%Y'', e.event_date) - strftime(''%Y'', uc.cohorte)))
    AS INTEGER) AS mois_offset
  FROM user_cohorts uc
  JOIN events e ON e.user_id = uc.user_id
  GROUP BY uc.user_id, uc.cohorte, mois_activite
)
SELECT
  ua.cohorte,
  ua.mois_offset,
  COUNT(DISTINCT ua.user_id) AS nb_actifs,
  cs.taille_cohorte,
  ROUND(COUNT(DISTINCT ua.user_id) * 100.0 / cs.taille_cohorte, 1) AS retention_pct
FROM user_activity ua
JOIN cohort_sizes cs ON cs.cohorte = ua.cohorte
GROUP BY ua.cohorte, ua.mois_offset, cs.taille_cohorte
ORDER BY ua.cohorte, ua.mois_offset;',
    '{}',
    60,
    512,
    true
  )
  RETURNING id
)
INSERT INTO challenge_test_cases (id, challenge_id, input_data, expected_output, is_hidden, points, "order")
SELECT gen_random_uuid(), c.id,
$input$CREATE TABLE users (id INTEGER PRIMARY KEY, signup_dt TEXT, country TEXT);
INSERT INTO users VALUES (1,'2024-01-05','FR');
INSERT INTO users VALUES (2,'2024-01-12','FR');
INSERT INTO users VALUES (3,'2024-01-20','BE');
INSERT INTO users VALUES (4,'2024-01-28','FR');
INSERT INTO users VALUES (5,'2024-02-03','FR');
INSERT INTO users VALUES (6,'2024-02-15','CH');
INSERT INTO users VALUES (7,'2024-02-22','FR');
INSERT INTO users VALUES (8,'2024-03-01','FR');
INSERT INTO users VALUES (9,'2024-03-10','BE');
INSERT INTO users VALUES (10,'2024-03-18','FR');
CREATE TABLE events (id INTEGER PRIMARY KEY, user_id INTEGER, event_date TEXT, event_type TEXT);
INSERT INTO events VALUES (1,1,'2024-01-06','login');
INSERT INTO events VALUES (2,1,'2024-02-10','login');
INSERT INTO events VALUES (3,1,'2024-03-05','purchase');
INSERT INTO events VALUES (4,2,'2024-01-13','login');
INSERT INTO events VALUES (5,2,'2024-02-18','login');
INSERT INTO events VALUES (6,3,'2024-01-21','login');
INSERT INTO events VALUES (7,4,'2024-01-29','login');
INSERT INTO events VALUES (8,5,'2024-02-04','login');
INSERT INTO events VALUES (9,5,'2024-03-12','login');
INSERT INTO events VALUES (10,6,'2024-02-16','login');
INSERT INTO events VALUES (11,7,'2024-02-23','login');
INSERT INTO events VALUES (12,7,'2024-03-20','purchase');
INSERT INTO events VALUES (13,8,'2024-03-02','login');
INSERT INTO events VALUES (14,9,'2024-03-11','login');
INSERT INTO events VALUES (15,10,'2024-03-19','login');$input$,
$expected$cohorte,mois_offset,nb_actifs,taille_cohorte,retention_pct
2024-01,0,4,4,100.0
2024-01,1,2,4,50.0
2024-01,2,1,4,25.0
2024-02,0,3,3,100.0
2024-02,1,2,3,66.7
2024-03,0,3,3,100.0$expected$,
  false, 100, 0
FROM c;

WITH ch AS (SELECT id FROM challenges WHERE slug = 'sql-analyse-cohorte')
INSERT INTO challenge_tags (id, challenge_id, name) VALUES
  (gen_random_uuid(), (SELECT id FROM ch), 'Cohorte'),
  (gen_random_uuid(), (SELECT id FROM ch), 'CTE'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Rétention'),
  (gen_random_uuid(), (SELECT id FROM ch), 'Product Analytics');
