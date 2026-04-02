-- ============================================================
-- CoachAI — Seed: Courses + Rich Lessons
-- ============================================================

-- ─── COURSE 1: SQL pour Data Analysts ────────────────────────────────────────
WITH sql_course AS (
  INSERT INTO courses (id, slug, title, description, category, level, is_published, is_premium, "order")
  VALUES (
    gen_random_uuid(),
    'sql-pour-data-analysts',
    'SQL pour Data Analysts',
    'Maîtrise le SQL de zéro à expert. Des bases du SELECT aux window functions avancées, avec des exercices pratiques sur des données réelles.',
    'sql',
    'beginner',
    true,
    false,
    1
  )
  RETURNING id
),

-- Leçon 1 : Introduction
l1 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'Introduction au SQL et aux bases de données',
$content$# Introduction au SQL et aux bases de données relationnelles

## Pourquoi SQL est incontournable en Data ?

Le SQL (Structured Query Language) est **la** compétence #1 des Data Analysts. En 2024 :

- **82%** des offres Data demandent du SQL
- Utilisé dans tous les secteurs : finance, e-commerce, santé, tech
- Fonctionne avec PostgreSQL, MySQL, BigQuery, Snowflake, Redshift...

> 💡 **Le SQL n'est pas un langage de programmation** — c'est un **langage de requête déclaratif** : tu décris *ce que tu veux*, pas *comment le calculer*.

---

## Le modèle relationnel

Une **base de données relationnelle** organise les données en **tables** (relations), composées de **colonnes** (attributs) et de **lignes** (enregistrements).

```
┌──────────────────────────────────────────────────────────────┐
│                        TABLE : clients                        │
├─────┬──────────────────┬─────────────────┬────────┬──────────┤
│ id  │ nom              │ email           │ age    │ pays     │
├─────┼──────────────────┼─────────────────┼────────┼──────────┤
│  1  │ Alice Martin     │ alice@test.com  │  28    │ France   │
│  2  │ Bob Dupont       │ bob@test.com    │  34    │ Belgique │
│  3  │ Charlie Leroy    │ charlie@...     │  25    │ France   │
└─────┴──────────────────┴─────────────────┴────────┴──────────┘
       ↑                                    ↑
  Clé primaire (unique)              Colonne = attribut
```

**Concepts fondamentaux :**

| Concept       | Définition                                        | Exemple           |
|---------------|---------------------------------------------------|-------------------|
| Table         | Collection structurée de données                  | `clients`         |
| Colonne       | Un attribut de la table                           | `nom`, `email`    |
| Ligne         | Un enregistrement                                 | Alice Martin, 28  |
| Clé primaire  | Identifiant unique de chaque ligne                | `id = 1`          |
| Clé étrangère | Référence vers la clé primaire d'une autre table  | `client_id`       |

---

## Relations entre tables

Les bases de données sont **relationnelles** : les tables sont liées entre elles.

```
TABLE clients          TABLE commandes
┌────┬────────┐        ┌────┬───────────┬──────────┬──────────┐
│ id │ nom    │        │ id │ client_id │ produit  │ montant  │
├────┼────────┤        ├────┼───────────┼──────────┼──────────┤
│  1 │ Alice  │───┐    │  1 │     1     │ Laptop   │ 1200.00  │
│  2 │ Bob    │   └───>│  2 │     1     │ iPhone   │  999.00  │
└────┴────────┘        │  3 │     2     │ TV       │  850.00  │
                       └────┴───────────┴──────────┴──────────┘
                                ↑
                          Clé étrangère → référence id de clients
```

---

## Les 4 opérations fondamentales (CRUD)

| Opération | SQL      | Description                    |
|-----------|----------|-------------------------------|
| **C**reate | `INSERT` | Ajouter des données           |
| **R**ead   | `SELECT` | **Lire et interroger** (90%)  |
| **U**pdate | `UPDATE` | Modifier des données          |
| **D**elete | `DELETE` | Supprimer des données         |

> En Data Analysis, on utilise quasi-exclusivement **SELECT**. Les autres opérations sont réservées aux ingénieurs.

---

## Ta première requête SQL

```sql
-- Récupère tous les clients de France
SELECT id, nom, email
FROM clients
WHERE pays = 'France'
ORDER BY nom ASC;
```

**Résultat :**
```
 id │ nom           │ email
────┼───────────────┼────────────────
  1 │ Alice Martin  │ alice@test.com
  3 │ Charlie Leroy │ charlie@...
```

### Anatomie d'une requête SELECT

```sql
SELECT  colonnes           -- 3. Quelles colonnes afficher ?
FROM    table              -- 1. Quelle table interroger ?
WHERE   condition          -- 2. Quel filtre appliquer ?
ORDER BY colonne ASC|DESC  -- 4. Dans quel ordre ?
LIMIT   n;                 -- 5. Combien de lignes max ?
```

> ⚠️ **Ordre d'exécution SQL** : FROM → WHERE → SELECT → ORDER BY → LIMIT
> L'ordre d'écriture est différent de l'ordre d'exécution !

---

## Prêt à pratiquer ?

Tu maîtrises maintenant les bases conceptuelles. Dans la prochaine leçon, tu vas écrire tes premières requêtes SELECT sur des données réelles !

**Checkpoint :** Sais-tu répondre à ces questions ?
- [ ] Qu'est-ce qu'une clé primaire ?
- [ ] Quelle est la différence entre une table et une ligne ?
- [ ] Dans quel ordre SQL exécute-t-il les clauses ?
$content$,
  1, 12, false
  FROM sql_course
  RETURNING id
),

-- Leçon 2 : SELECT WHERE ORDER BY
l2 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'SELECT, WHERE, ORDER BY — Interroger vos données',
$content$# SELECT, WHERE, ORDER BY — Interroger vos données

## La clause SELECT

`SELECT` définit les colonnes à afficher dans le résultat.

```sql
-- Toutes les colonnes (éviter en production)
SELECT * FROM produits;

-- Colonnes spécifiques
SELECT nom, prix, stock FROM produits;

-- Avec alias (renommer une colonne dans le résultat)
SELECT nom AS "Nom du produit", prix AS "Prix (€)" FROM produits;

-- Expressions calculées
SELECT nom, prix, prix * 0.8 AS prix_solde FROM produits;
```

---

## La clause WHERE — Filtrer les données

`WHERE` filtre les lignes selon une ou plusieurs conditions.

### Opérateurs de comparaison

| Opérateur | Signification         | Exemple                     |
|-----------|-----------------------|-----------------------------|
| `=`       | Égal                  | `WHERE pays = 'France'`     |
| `!=` / `<>` | Différent           | `WHERE statut != 'inactif'` |
| `>`       | Supérieur             | `WHERE prix > 100`          |
| `>=`      | Supérieur ou égal     | `WHERE note >= 4.5`         |
| `<`       | Inférieur             | `WHERE stock < 10`          |
| `<=`      | Inférieur ou égal     | `WHERE age <= 30`           |

### Opérateurs logiques

```sql
-- ET : les deux conditions doivent être vraies
WHERE pays = 'France' AND age > 25

-- OU : au moins une condition vraie
WHERE pays = 'France' OR pays = 'Belgique'

-- NON : inverse la condition
WHERE NOT statut = 'inactif'

-- Priorité : AND est prioritaire sur OR, utilise des parenthèses
WHERE (pays = 'France' OR pays = 'Belgique') AND age > 18
```

### Opérateurs spéciaux

```sql
-- IN : valeur dans une liste
WHERE pays IN ('France', 'Belgique', 'Suisse')

-- BETWEEN : valeur dans un intervalle (inclusif)
WHERE prix BETWEEN 10 AND 100
WHERE date_commande BETWEEN '2024-01-01' AND '2024-12-31'

-- LIKE : correspondance de pattern
WHERE nom LIKE 'A%'        -- commence par A
WHERE email LIKE '%@gmail.com'  -- se termine par @gmail.com
WHERE nom LIKE '%alice%'   -- contient alice (insensible à la casse avec ILIKE en PostgreSQL)

-- IS NULL / IS NOT NULL
WHERE email IS NULL        -- valeur manquante
WHERE telephone IS NOT NULL
```

---

## La clause ORDER BY — Trier les résultats

```sql
-- Tri croissant (défaut)
SELECT * FROM clients ORDER BY nom ASC;
SELECT * FROM clients ORDER BY nom;  -- même chose

-- Tri décroissant
SELECT * FROM produits ORDER BY prix DESC;

-- Tri sur plusieurs colonnes
SELECT * FROM employes ORDER BY departement ASC, salaire DESC;
-- Trie d'abord par département, puis par salaire décroissant au sein de chaque département
```

---

## LIMIT et OFFSET — Pagination

```sql
-- Les 10 premiers résultats
SELECT * FROM produits ORDER BY prix DESC LIMIT 10;

-- Page 2 (résultats 11 à 20)
SELECT * FROM produits ORDER BY prix DESC LIMIT 10 OFFSET 10;

-- Top 5 des clients les plus récents
SELECT nom, email, created_at
FROM clients
ORDER BY created_at DESC
LIMIT 5;
```

---

## DISTINCT — Valeurs uniques

```sql
-- Liste des pays sans doublons
SELECT DISTINCT pays FROM clients;

-- Combinaisons uniques pays + ville
SELECT DISTINCT pays, ville FROM clients ORDER BY pays;

-- Compter les valeurs distinctes
SELECT COUNT(DISTINCT pays) AS nb_pays FROM clients;
```

---

## Exemples complets

```sql
-- Cas d'usage réel : trouver les clients VIP récents en France
SELECT
  nom,
  email,
  montant_total AS "CA Total (€)",
  derniere_commande
FROM clients
WHERE
  pays = 'France'
  AND montant_total >= 1000
  AND derniere_commande >= '2024-01-01'
ORDER BY montant_total DESC
LIMIT 20;
```

```sql
-- Produits en rupture de stock ou prix anormal
SELECT nom, prix, stock, categorie
FROM produits
WHERE stock = 0 OR prix <= 0 OR prix IS NULL
ORDER BY categorie, nom;
```

---

## Quiz rapide

1. Quelle clause utilises-tu pour filtrer les lignes ? → `___`
2. Comment afficher uniquement les 5 premiers résultats ? → `LIMIT ___`
3. `BETWEEN 10 AND 20` inclut-il 10 et 20 ? → `___` (Oui/Non)
4. Quelle est la différence entre `=` et `LIKE` ? → `___`
$content$,
  2, 18, false
  FROM sql_course
  RETURNING id
),

-- Leçon 3 : GROUP BY Agrégations
l3 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'Agrégations — Résumer vos données avec GROUP BY',
$content$# Agrégations — Résumer vos données avec GROUP BY

## Pourquoi les agrégations ?

Les agrégations permettent de **résumer** des milliers de lignes en quelques métriques clés. C'est l'essence du travail d'analyse :

```
1 000 000 transactions  →  12 lignes (une par mois)  →  Insight business
```

---

## Les 5 fonctions d'agrégation essentielles

| Fonction    | Description                      | Exemple                          |
|-------------|----------------------------------|----------------------------------|
| `COUNT(*)`  | Nombre total de lignes           | `COUNT(*) → 1000`               |
| `COUNT(col)`| Lignes non-NULL de la colonne    | `COUNT(email) → 950`            |
| `SUM(col)`  | Somme des valeurs                | `SUM(montant) → 45820.50`       |
| `AVG(col)`  | Moyenne                          | `AVG(note) → 4.2`               |
| `MIN(col)`  | Valeur minimale                  | `MIN(prix) → 9.99`              |
| `MAX(col)`  | Valeur maximale                  | `MAX(salaire) → 95000`          |

```sql
-- Statistiques globales sur les commandes
SELECT
  COUNT(*) AS nb_commandes,
  COUNT(DISTINCT client_id) AS nb_clients_uniques,
  SUM(montant) AS ca_total,
  AVG(montant) AS panier_moyen,
  MIN(montant) AS commande_min,
  MAX(montant) AS commande_max
FROM commandes
WHERE date_commande >= '2024-01-01';
```

---

## GROUP BY — Agréger par groupe

`GROUP BY` divise les données en groupes et applique une agrégation à chaque groupe.

```
SANS GROUP BY :                AVEC GROUP BY region :
┌──────────────────────────┐   ┌────────────┬──────────────┐
│ Toutes les transactions  │   │ region     │ total_ventes │
│ → 1 seule valeur globale │   ├────────────┼──────────────┤
└──────────────────────────┘   │ Europe     │  45 820 €    │
                               │ Amérique   │  32 100 €    │
                               │ Asie       │  28 450 €    │
                               └────────────┴──────────────┘
```

```sql
-- CA par région
SELECT
  region,
  COUNT(*) AS nb_ventes,
  SUM(montant) AS ca_total,
  ROUND(AVG(montant), 2) AS panier_moyen
FROM ventes
GROUP BY region
ORDER BY ca_total DESC;

-- CA par mois (extraction de date)
SELECT
  strftime('%Y-%m', date_vente) AS mois,  -- SQLite
  -- DATE_TRUNC('month', date_vente) AS mois  -- PostgreSQL
  SUM(montant) AS ca_mensuel
FROM ventes
GROUP BY mois
ORDER BY mois;
```

### ⚠️ Règle d'or du GROUP BY

> **Toute colonne dans SELECT qui n'est pas une agrégation DOIT être dans GROUP BY**

```sql
-- ✅ Correct
SELECT region, categorie, SUM(montant) FROM ventes GROUP BY region, categorie;

-- ❌ Erreur : nom n'est pas dans GROUP BY ni une agrégation
SELECT region, nom, SUM(montant) FROM ventes GROUP BY region;
```

---

## HAVING — Filtrer les groupes

`WHERE` filtre les **lignes** avant l'agrégation.
`HAVING` filtre les **groupes** après l'agrégation.

```
         WHERE               GROUP BY + AGG       HAVING
Toutes lignes → Filtre lignes → Crée groupes → Filtre groupes → Résultat
```

```sql
-- Régions avec CA > 30 000 €
SELECT region, SUM(montant) AS ca_total
FROM ventes
GROUP BY region
HAVING SUM(montant) > 30000
ORDER BY ca_total DESC;

-- Clients ayant passé plus de 5 commandes
SELECT client_id, COUNT(*) AS nb_commandes
FROM commandes
GROUP BY client_id
HAVING COUNT(*) > 5
ORDER BY nb_commandes DESC;

-- Combinaison WHERE + HAVING
SELECT
  categorie,
  COUNT(*) AS nb_produits,
  AVG(prix) AS prix_moyen
FROM produits
WHERE stock > 0           -- filtre les produits en stock
GROUP BY categorie
HAVING AVG(prix) > 50     -- garde les catégories avec prix moyen > 50
ORDER BY prix_moyen DESC;
```

---

## ROLLUP et CUBE (Agrégations multidimensionnelles)

```sql
-- ROLLUP : sous-totaux hiérarchiques
SELECT region, categorie, SUM(montant)
FROM ventes
GROUP BY ROLLUP(region, categorie);
-- Génère: par (region, categorie), par region seule, total global

-- GROUPING SETS : contrôle précis des groupes
SELECT region, categorie, SUM(montant)
FROM ventes
GROUP BY GROUPING SETS ((region, categorie), (region), ());
```

---

## Ordre d'exécution complet

```sql
SELECT region, SUM(montant) AS ca    -- 5. Calcule et sélectionne
FROM ventes                          -- 1. Charge la table
WHERE date_vente >= '2024-01-01'     -- 2. Filtre les lignes
GROUP BY region                      -- 3. Regroupe
HAVING SUM(montant) > 10000          -- 4. Filtre les groupes
ORDER BY ca DESC                     -- 6. Trie
LIMIT 10;                            -- 7. Limite
```

---

## Cas pratique : Dashboard e-commerce

```sql
-- Top catégories par CA, nombre de commandes et panier moyen
SELECT
  p.categorie,
  COUNT(DISTINCT o.id) AS nb_commandes,
  COUNT(DISTINCT o.client_id) AS nb_clients,
  ROUND(SUM(oi.quantite * oi.prix_unitaire), 2) AS ca_total,
  ROUND(AVG(o.montant_total), 2) AS panier_moyen
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN produits p ON p.id = oi.produit_id
WHERE o.statut = 'completed'
  AND o.date_commande >= '2024-01-01'
GROUP BY p.categorie
HAVING COUNT(DISTINCT o.id) >= 10
ORDER BY ca_total DESC
LIMIT 10;
```
$content$,
  3, 20, false
  FROM sql_course
  RETURNING id
),

-- Leçon 4 : JOINs
l4 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'Jointures — Combiner plusieurs tables',
$content$# Jointures — Combiner plusieurs tables

## Pourquoi les jointures ?

Les données en base sont **normalisées** : réparties dans plusieurs tables pour éviter la duplication. Les jointures permettent de les **recombiner** pour l'analyse.

```
TABLE clients    +    TABLE commandes    =    Résultat joint
┌────┬────────┐        ┌────┬────────┐        ┌───────────────────────┐
│ id │ nom    │   JOIN │ id │ clt_id │   =    │ nom      │ commande  │
├────┼────────┤        ├────┼────────┤        ├──────────┼───────────┤
│  1 │ Alice  │        │  1 │   1    │        │ Alice    │     1     │
│  2 │ Bob    │        │  2 │   1    │        │ Alice    │     2     │
│  3 │ Charlie│        │  3 │   2    │        │ Bob      │     3     │
└────┴────────┘        └────┴────────┘        └──────────┴───────────┘
```

---

## Les 4 types de JOIN

### INNER JOIN — Intersection

Retourne uniquement les lignes qui ont une correspondance dans **les deux** tables.

```
Table A  ∩  Table B  →  Seulement les matchs
```

```sql
SELECT c.nom, o.montant, o.date_commande
FROM clients c
INNER JOIN commandes o ON c.id = o.client_id;
-- Syntaxe simplifiée : JOIN = INNER JOIN
```

```
clients          commandes        Résultat INNER JOIN
┌───┬────────┐   ┌───┬─────┐     ┌────────┬─────────┐
│ 1 │ Alice  │   │ 1 │  1  │     │ Alice  │    1    │
│ 2 │ Bob    │   │ 2 │  1  │     │ Alice  │    2    │
│ 3 │ Charlie│   │ 3 │  2  │     │ Bob    │    3    │
└───┴────────┘   └───┴─────┘     └────────┴─────────┘
          Charlie (id=3) n'apparaît pas → pas de commande
```

### LEFT JOIN — Tous les éléments de gauche

Retourne **toutes** les lignes de la table de gauche, et les correspondances de droite (NULL si pas de match).

```sql
-- Tous les clients, même ceux sans commande
SELECT c.nom, COUNT(o.id) AS nb_commandes
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
GROUP BY c.id, c.nom
ORDER BY nb_commandes DESC;
```

```
Résultat LEFT JOIN :
┌─────────┬──────────────┐
│ nom     │ nb_commandes │
├─────────┼──────────────┤
│ Alice   │      2       │
│ Bob     │      1       │
│ Charlie │      0       │  ← Charlie apparaît avec 0 commandes
└─────────┴──────────────┘
```

### RIGHT JOIN et FULL JOIN

```sql
-- RIGHT JOIN : tous les éléments de droite
-- Équivalent à inverser les tables avec un LEFT JOIN
SELECT * FROM commandes o RIGHT JOIN clients c ON c.id = o.client_id;

-- FULL OUTER JOIN : union de LEFT et RIGHT
-- Tous les éléments des deux côtés (avec NULL si pas de match)
SELECT * FROM clients c FULL JOIN commandes o ON c.id = o.client_id;
```

### Comparaison visuelle

```
Table A : [1, 2, 3]    Table B : [2, 3, 4]

INNER JOIN  :  [2, 3]              → Intersection
LEFT JOIN   :  [1, 2, 3]           → Tous de A + matches de B
RIGHT JOIN  :  [2, 3, 4]           → Tous de B + matches de A
FULL JOIN   :  [1, 2, 3, 4]        → Union
```

---

## Jointures multiples

```sql
-- Commandes avec infos client + produit
SELECT
  c.nom AS client,
  p.nom AS produit,
  p.categorie,
  oi.quantite,
  oi.prix_unitaire,
  oi.quantite * oi.prix_unitaire AS total_ligne
FROM commandes o
JOIN clients c ON c.id = o.client_id
JOIN order_items oi ON oi.order_id = o.id
JOIN produits p ON p.id = oi.produit_id
WHERE o.statut = 'completed'
ORDER BY total_ligne DESC;
```

---

## Self JOIN — Jointure sur elle-même

```sql
-- Trouver les managers et leurs subordonnés
SELECT
  e.nom AS employe,
  m.nom AS manager
FROM employes e
LEFT JOIN employes m ON m.id = e.manager_id
ORDER BY m.nom, e.nom;
```

---

## Conseils de performance

```sql
-- ✅ Utilise des alias courts
FROM clients c JOIN commandes o ON c.id = o.client_id

-- ✅ Filtre tôt (réduit les données avant la jointure)
SELECT * FROM commandes o
JOIN (SELECT id FROM clients WHERE pays = 'France') c ON c.id = o.client_id

-- ✅ Jointure sur des colonnes indexées (clés primaires/étrangères)
-- Les colonnes id sont automatiquement indexées

-- ⚠️ Évite le produit cartésien (oubli de ON)
SELECT * FROM clients, commandes  -- Attention ! 1000 × 500 = 500 000 lignes !
```

---

## Exercice pratique

```sql
-- Défi : Trouve les 5 commerciaux avec le plus grand CA
-- Tables: commerciaux (id, nom), clients (id, commercial_id), commandes (id, client_id, montant)

SELECT
  co.nom AS commercial,
  COUNT(DISTINCT c.id) AS nb_clients,
  COUNT(o.id) AS nb_commandes,
  ROUND(SUM(o.montant), 2) AS ca_total
FROM commerciaux co
LEFT JOIN clients c ON c.commercial_id = co.id
LEFT JOIN commandes o ON o.client_id = c.id AND o.statut = 'completed'
GROUP BY co.id, co.nom
ORDER BY ca_total DESC
LIMIT 5;
```
$content$,
  4, 22, false
  FROM sql_course
  RETURNING id
),

-- Leçon 5 : Window Functions (Premium)
l5 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'Fonctions de fenêtre — L''analytics avancée',
$content$# Fonctions de fenêtre — L'analytics avancée

## Qu'est-ce qu'une Window Function ?

Les fonctions de fenêtre effectuent des calculs sur un **ensemble de lignes liées à la ligne courante**, sans réduire le nombre de lignes (contrairement à `GROUP BY`).

```
GROUP BY :      Lignes → Groupes → 1 résultat par groupe (perd le détail)
Window Func :   Lignes → Calcul → 1 résultat par ligne (garde le détail)
```

```sql
-- GROUP BY : 1 ligne par département
SELECT departement, AVG(salaire) FROM employes GROUP BY departement;

-- Window Function : toutes les lignes + moyenne du département
SELECT
  nom,
  departement,
  salaire,
  AVG(salaire) OVER (PARTITION BY departement) AS salaire_moyen_dept
FROM employes;
```

---

## Syntaxe OVER

```sql
FUNCTION() OVER (
  PARTITION BY col      -- Divise en groupes (optionnel)
  ORDER BY col          -- Ordre dans chaque partition (optionnel)
  ROWS/RANGE BETWEEN    -- Fenêtre glissante (optionnel)
)
```

---

## Fonctions de classement

### ROW_NUMBER — Numéro unique séquentiel

```sql
SELECT
  nom,
  departement,
  salaire,
  ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC) AS rang_dept
FROM employes;
```

```
nom           │ dept        │ salaire │ rang_dept
──────────────┼─────────────┼─────────┼──────────
Alice         │ Engineering │ 95 000  │    1
Diana         │ Engineering │ 82 000  │    2
Bob           │ Engineering │ 78 000  │    3
Frank         │ HR          │ 55 000  │    1
Grace         │ HR          │ 52 000  │    2
```

### RANK vs DENSE_RANK — Gestion des ex-aequo

```sql
-- Données : salaires [100k, 90k, 90k, 80k]
SELECT
  nom,
  salaire,
  ROW_NUMBER() OVER (ORDER BY salaire DESC) AS row_num,    -- 1, 2, 3, 4
  RANK()       OVER (ORDER BY salaire DESC) AS rank_val,   -- 1, 2, 2, 4 (saute 3)
  DENSE_RANK() OVER (ORDER BY salaire DESC) AS dense_rank  -- 1, 2, 2, 3 (pas de saut)
FROM employes;
```

---

## Fonctions d'accès aux lignes voisines

### LAG et LEAD

```sql
SELECT
  mois,
  ca_mensuel,
  LAG(ca_mensuel) OVER (ORDER BY mois) AS ca_mois_precedent,
  LEAD(ca_mensuel) OVER (ORDER BY mois) AS ca_mois_suivant,
  -- Taux de croissance MoM
  ROUND(
    (ca_mensuel - LAG(ca_mensuel) OVER (ORDER BY mois)) * 100.0
    / LAG(ca_mensuel) OVER (ORDER BY mois),
    2
  ) AS croissance_pct
FROM ventes_mensuelles
ORDER BY mois;
```

```
mois    │ ca_mensuel │ ca_precedent │ croissance_pct
────────┼────────────┼──────────────┼────────────────
2024-01 │  50 000    │    NULL      │    NULL
2024-02 │  58 000    │  50 000      │   +16.0%
2024-03 │  52 000    │  58 000      │   -10.3%
2024-04 │  65 000    │  52 000      │   +25.0%
```

### FIRST_VALUE et LAST_VALUE

```sql
SELECT
  nom,
  departement,
  salaire,
  FIRST_VALUE(nom) OVER (PARTITION BY departement ORDER BY salaire DESC) AS meilleur_payé
FROM employes;
```

---

## Agrégations glissantes (Rolling)

```sql
-- Moyenne mobile sur 3 mois
SELECT
  mois,
  ca_mensuel,
  AVG(ca_mensuel) OVER (
    ORDER BY mois
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS moy_mobile_3m,

  -- Cumul depuis le début de l'année
  SUM(ca_mensuel) OVER (
    ORDER BY mois
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS ca_cumulatif
FROM ventes_mensuelles;
```

```
mois    │ ca    │ moy_3m │ ca_cumulatif
────────┼───────┼────────┼─────────────
2024-01 │ 50k   │  50k   │   50k
2024-02 │ 58k   │  54k   │  108k
2024-03 │ 52k   │  53.3k │  160k
2024-04 │ 65k   │  58.3k │  225k
```

---

## Top N par groupe (pattern courant)

```sql
-- Top 3 produits par catégorie (par CA)
WITH ranked AS (
  SELECT
    categorie,
    produit,
    SUM(montant) AS ca,
    ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY SUM(montant) DESC) AS rang
  FROM ventes
  GROUP BY categorie, produit
)
SELECT categorie, produit, ca
FROM ranked
WHERE rang <= 3
ORDER BY categorie, rang;
```

---

## NTILE — Découper en quantiles

```sql
-- Divise les clients en 4 quartiles selon leur CA
SELECT
  client_id,
  ca_total,
  NTILE(4) OVER (ORDER BY ca_total DESC) AS quartile
  -- 1 = top 25%, 4 = bottom 25%
FROM (SELECT client_id, SUM(montant) AS ca_total FROM commandes GROUP BY client_id) t;
```
$content$,
  5, 25, true
  FROM sql_course
  RETURNING id
),

-- Leçon 6 : CTEs
l6 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), sql_course.id,
  'CTEs et Sous-requêtes — SQL lisible et maintenable',
$content$# CTEs et Sous-requêtes — SQL lisible et maintenable

## Les Sous-requêtes

Une **sous-requête** (subquery) est une requête imbriquée dans une autre requête.

```sql
-- Sous-requête dans WHERE
SELECT nom, ca_total
FROM clients
WHERE ca_total > (SELECT AVG(ca_total) FROM clients);
--                └─── sous-requête scalaire (retourne 1 valeur)

-- Sous-requête dans FROM (table dérivée)
SELECT dept, avg_sal
FROM (
  SELECT departement AS dept, AVG(salaire) AS avg_sal
  FROM employes
  GROUP BY departement
) AS stats_dept
WHERE avg_sal > 60000;

-- Sous-requête corrélée (référence la requête externe)
SELECT e.nom, e.salaire
FROM employes e
WHERE e.salaire > (
  SELECT AVG(salaire)
  FROM employes
  WHERE departement = e.departement  -- ← référence e de la requête externe
);
```

---

## CTEs — Common Table Expressions

Les **CTEs** (ou expressions de table communes) permettent de nommer des sous-requêtes et de les réutiliser. Elles rendent le SQL **lisible et maintenable**.

```sql
WITH nom_de_la_cte AS (
  SELECT ...  -- la sous-requête
),
autre_cte AS (
  SELECT ... FROM nom_de_la_cte  -- peut référencer les CTEs précédentes
)
SELECT * FROM autre_cte;
```

### Exemple : Analyse de rétention sans CTE (illisible)

```sql
-- ❌ Sans CTE : imbrication profonde, difficile à déboguer
SELECT cohorte, COUNT(DISTINCT user_id) * 100.0 / (
  SELECT COUNT(*) FROM users u2 WHERE strftime('%Y-%m', u2.signup_dt) = cohorte
) AS retention
FROM (
  SELECT strftime('%Y-%m', u.signup_dt) AS cohorte, e.user_id
  FROM events e JOIN users u ON u.id = e.user_id
  WHERE strftime('%Y-%m', e.event_date) = strftime('%Y-%m', DATE('now', '-1 month'))
) sub
GROUP BY cohorte;
```

### Exemple : La même requête avec CTEs (lisible)

```sql
-- ✅ Avec CTEs : clair, modulaire, débogable étape par étape
WITH
-- Étape 1 : Cohorte de chaque utilisateur
user_cohorts AS (
  SELECT id, strftime('%Y-%m', signup_dt) AS cohorte
  FROM users
),
-- Étape 2 : Taille de chaque cohorte
cohort_sizes AS (
  SELECT cohorte, COUNT(*) AS taille
  FROM user_cohorts
  GROUP BY cohorte
),
-- Étape 3 : Activité du mois dernier
actifs_mois_dernier AS (
  SELECT DISTINCT uc.cohorte, e.user_id
  FROM events e
  JOIN user_cohorts uc ON uc.id = e.user_id
  WHERE strftime('%Y-%m', e.event_date) = strftime('%Y-%m', DATE('now', '-1 month'))
)
-- Résultat final
SELECT
  a.cohorte,
  COUNT(DISTINCT a.user_id) AS nb_actifs,
  cs.taille AS taille_cohorte,
  ROUND(COUNT(DISTINCT a.user_id) * 100.0 / cs.taille, 1) AS retention_pct
FROM actifs_mois_dernier a
JOIN cohort_sizes cs ON cs.cohorte = a.cohorte
GROUP BY a.cohorte, cs.taille
ORDER BY a.cohorte;
```

---

## CTEs Récursives

Les CTEs récursives permettent de parcourir des **structures hiérarchiques** (arbre d'organigramme, chemin dans un graphe).

```sql
-- Structure d'une CTE récursive
WITH RECURSIVE hierarchy AS (
  -- Cas de base (ancre) : point de départ
  SELECT id, nom, manager_id, 0 AS niveau
  FROM employes
  WHERE manager_id IS NULL  -- les top managers

  UNION ALL

  -- Cas récursif : on descend d'un niveau
  SELECT e.id, e.nom, e.manager_id, h.niveau + 1
  FROM employes e
  JOIN hierarchy h ON h.id = e.manager_id
)
SELECT niveau, nom FROM hierarchy ORDER BY niveau, nom;
```

```
Résultat :
niveau │ nom
───────┼──────────────
  0    │ Alice (CEO)
  1    │ Bob (VP Eng)
  1    │ Charlie (VP Sales)
  2    │ Diana (Lead Eng)
  2    │ Eve (Sales Rep)
  3    │ Frank (Junior)
```

---

## Bonnes pratiques CTEs

```sql
-- ✅ Une CTE = une étape logique bien nommée
WITH
commandes_2024 AS (
  SELECT * FROM commandes WHERE YEAR(date) = 2024
),
clients_actifs AS (
  SELECT DISTINCT client_id FROM commandes_2024
),
stats_clients AS (
  SELECT client_id, COUNT(*) AS nb_cmd, SUM(montant) AS ca
  FROM commandes_2024
  GROUP BY client_id
)
SELECT c.nom, s.nb_cmd, s.ca
FROM clients c
JOIN stats_clients s ON s.client_id = c.id
ORDER BY s.ca DESC;
```

> 💡 **Astuce de débogage :** Exécute chaque CTE indépendamment pour vérifier son résultat avant d'assembler.

---

## Comparaison : Sous-requête vs CTE

| Critère         | Sous-requête          | CTE                   |
|-----------------|-----------------------|-----------------------|
| Lisibilité      | Difficile (imbriqué)  | Excellente (linéaire) |
| Réutilisabilité | Non                   | Oui (plusieurs fois)  |
| Performance     | Similaire             | Similaire             |
| Récursivité     | Non                   | Oui (RECURSIVE)       |
| Débogage        | Difficile             | Facile (étape par étape) |

**Règle générale :** Dès qu'une sous-requête fait plus de 5 lignes ou est utilisée plusieurs fois → utilise une CTE.
$content$,
  6, 20, true
  FROM sql_course
  RETURNING id
)

SELECT 'SQL course created' AS status;


-- ─── COURSE 2: Machine Learning Fondamentaux ─────────────────────────────────
WITH ml_course AS (
  INSERT INTO courses (id, slug, title, description, category, level, is_published, is_premium, "order")
  VALUES (
    gen_random_uuid(),
    'machine-learning-fondamentaux',
    'Machine Learning Fondamentaux',
    'De la régression linéaire aux Random Forests. Comprends les algorithmes, implémente-les avec scikit-learn et évalue correctement tes modèles.',
    'machine_learning',
    'intermediate',
    true,
    false,
    2
  )
  RETURNING id
),

ml_l1 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), ml_course.id,
  'Introduction au Machine Learning',
$content$# Introduction au Machine Learning

## Qu'est-ce que le Machine Learning ?

Le Machine Learning (ML) est une branche de l'intelligence artificielle où les machines **apprennent à partir de données** plutôt que d'être explicitement programmées.

```
Programmation traditionnelle :
  Données + Règles → Programme → Résultats

Machine Learning :
  Données + Résultats → Algorithme → Règles (modèle)
```

---

## Les 3 grandes familles du ML

### 1. Apprentissage Supervisé

L'algorithme apprend à partir de données **étiquetées** (X → y).

```
Exemples d'entrée (X)          Label (y)
──────────────────────         ──────────
Email text + metadata    →     spam / not spam
Surface + localisation   →     prix de l'appartement
Photo de peau            →     benin / maligne
Historique client        →     va churner / non
```

**Tâches :**
- **Classification** : prédire une catégorie (spam, churn, diagnostic)
- **Régression** : prédire une valeur continue (prix, température, CA)

### 2. Apprentissage Non Supervisé

L'algorithme trouve des **structures cachées** dans des données non étiquetées.

```
Données sans label    →    Groupes naturels (clusters)
                      →    Dimensions réduites
                      →    Anomalies détectées
```

**Algorithmes :** K-Means, DBSCAN, PCA, Autoencoders

### 3. Apprentissage par Renforcement

Un agent apprend par **essai/erreur** en interagissant avec un environnement, maximisant une récompense.

**Exemples :** AlphaGo, trading algorithmique, robots

---

## Le workflow ML standard

```
1. Définir le problème          "Prédire le churn des clients"
         ↓
2. Collecter les données        Base clients : 10 000 lignes, 15 features
         ↓
3. Explorer et nettoyer         EDA, traitement des valeurs manquantes
         ↓
4. Feature Engineering          Créer de nouvelles features pertinentes
         ↓
5. Sélectionner un algorithme   RandomForest ? LogisticRegression ?
         ↓
6. Entraîner le modèle          model.fit(X_train, y_train)
         ↓
7. Évaluer les performances     AUC-ROC, accuracy, F1...
         ↓
8. Optimiser les hyperparamètres GridSearchCV, RandomizedSearch
         ↓
9. Déployer en production       API, batch scoring, monitoring
```

---

## Concepts fondamentaux

### Features vs Labels

```python
import pandas as pd

df = pd.DataFrame({
    "surface": [45, 80, 120, 35],          # Feature
    "nb_pieces": [2, 3, 5, 1],             # Feature
    "arrondissement": [75001, 75010, 75016, 75020],  # Feature
    "prix": [320000, 450000, 890000, 195000]  # Label (y)
})

X = df[["surface", "nb_pieces", "arrondissement"]]  # Features
y = df["prix"]  # Label à prédire
```

### Train / Test Split

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,     # 20% pour le test
    random_state=42    # Reproductibilité
)
# X_train : 80% des données → entraînement
# X_test  : 20% des données → évaluation (jamais vu pendant l'entraînement)
```

### Overfitting vs Underfitting

```
                    Précision
                    │
              ──────│──────── Courbe idéale
        Overfit     │     ● Train
             ●──────●──────── ○ Test
      ○       │
              │     ↑
              │   Sweet spot
              │
 Underfit     │
     ●        │
     ○        │
──────────────┼────────────────────────────→ Complexité du modèle
    Trop      │     Trop
    simple    │    complexe
```

**Underfitting :** Le modèle est trop simple, il ne capture pas les patterns.
**Overfitting :** Le modèle mémorise les données d'entraînement, ne généralise pas.

---

## Métriques d'évaluation

### Classification

| Métrique    | Formule                           | Interprétation                |
|-------------|-----------------------------------|-------------------------------|
| Accuracy    | (TP+TN) / Total                   | % de prédictions correctes    |
| Precision   | TP / (TP + FP)                    | Quand on dit "oui", c'est vrai |
| Recall      | TP / (TP + FN)                    | Parmi les vrais oui, combien détectés |
| F1 Score    | 2 × (P × R) / (P + R)            | Équilibre Precision/Recall    |
| AUC-ROC     | Aire sous la courbe ROC           | Capacité de discrimination     |

### Régression

| Métrique | Formule                              | Interprétation         |
|----------|--------------------------------------|------------------------|
| MSE      | mean((y - ŷ)²)                       | Erreur quadratique     |
| RMSE     | √MSE                                 | Erreur en unité de y   |
| MAE      | mean(|y - ŷ|)                        | Erreur absolue moyenne |
| R²       | 1 - SS_res/SS_tot                    | % variance expliquée   |

---

## Premier modèle avec scikit-learn

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

# Données
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraînement
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Évaluation
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(f"AUC-ROC: {roc_auc_score(y_test, y_proba):.3f}")
```
$content$,
  1, 20, false
  FROM ml_course
  RETURNING id
),

ml_l2 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), ml_course.id,
  'Préparation des données — Le secret des bons modèles',
$content$# Préparation des données — Le secret des bons modèles

> "Garbage in, garbage out" — Un mauvais jeu de données, quel que soit l'algorithme, donnera de mauvais résultats.

## Les étapes de préparation

```
Données brutes → EDA → Nettoyage → Encodage → Normalisation → Split → Modèle
```

---

## 1. Exploration Initiale (EDA)

```python
import pandas as pd
import numpy as np

df = pd.read_csv("clients.csv")

# Vue d'ensemble
print(df.shape)          # (10000, 15) → 10 000 lignes, 15 colonnes
print(df.dtypes)         # Types de chaque colonne
print(df.describe())     # Stats: mean, std, min, max, quartiles
print(df.isnull().sum()) # Valeurs manquantes par colonne

# Distributions
df["age"].hist(bins=30)
df["churn"].value_counts(normalize=True)  # Équilibre des classes
```

---

## 2. Gestion des Valeurs Manquantes

```python
# Identifier
missing = df.isnull().sum()
missing_pct = missing / len(df) * 100
print(missing_pct[missing_pct > 0])

# Stratégies selon le type et le contexte
# a) Supprimer (si < 5% de missing)
df.dropna(subset=["target"], inplace=True)

# b) Imputation par la médiane (numériques, robuste aux outliers)
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy="median")
df["age"] = imputer.fit_transform(df[["age"]])

# c) Imputation par le mode (catégorielles)
df["categorie"].fillna(df["categorie"].mode()[0], inplace=True)

# d) Imputation KNN (plus précise, plus lente)
from sklearn.impute import KNNImputer
knn_imp = KNNImputer(n_neighbors=5)
df_imputed = knn_imp.fit_transform(df)
```

---

## 3. Traitement des Outliers

```python
# Détection par IQR (Interquartile Range)
Q1 = df["montant"].quantile(0.25)
Q3 = df["montant"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

outliers = df[(df["montant"] < lower) | (df["montant"] > upper)]
print(f"{len(outliers)} outliers détectés ({len(outliers)/len(df)*100:.1f}%)")

# Traitement : capping (winsorisation)
df["montant"] = df["montant"].clip(lower, upper)

# Ou transformation log pour réduire l'asymétrie
import numpy as np
df["montant_log"] = np.log1p(df["montant"])  # log(1+x) pour gérer les zéros
```

---

## 4. Encodage des Variables Catégorielles

```python
# One-Hot Encoding (catégories nominales, peu de modalités)
pd.get_dummies(df, columns=["pays", "canal"], drop_first=True)

# Label Encoding (catégories ordinales : petite, moyenne, grande)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df["taille"] = le.fit_transform(df["taille"])  # petite→0, moyenne→1, grande→2

# Target Encoding (catégories avec beaucoup de modalités)
# Remplace la catégorie par la moyenne de la target dans ce groupe
target_means = df.groupby("ville")["churn"].mean()
df["ville_encoded"] = df["ville"].map(target_means)
```

---

## 5. Normalisation / Standardisation

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

# StandardScaler : μ=0, σ=1 (meilleur pour régression, SVM, réseaux de neurones)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)  # fit sur train, transform sur train+test

# MinMaxScaler : [0, 1] (pour réseaux de neurones, KNN)
scaler = MinMaxScaler()

# RobustScaler : robuste aux outliers (utilise IQR)
scaler = RobustScaler()

# ⚠️ Règle d'or : toujours fit sur X_train, transform sur X_train ET X_test
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)   # Pas fit_transform ici !
```

---

## 6. Feature Engineering

```python
# Créer de nouvelles features à partir des existantes
df["ratio_support"] = df["support_calls"] / (df["tenure"] + 1)
df["charges_par_produit"] = df["monthly_charges"] / df["num_products"]
df["est_client_recent"] = (df["tenure"] < 6).astype(int)

# Interactions entre features
df["tenure_x_charges"] = df["tenure"] * df["monthly_charges"]

# Extraction depuis les dates
df["date"] = pd.to_datetime(df["date"])
df["mois"] = df["date"].dt.month
df["jour_semaine"] = df["date"].dt.dayofweek
df["est_weekend"] = df["jour_semaine"].isin([5, 6]).astype(int)
```

---

## Pipeline scikit-learn

Un **Pipeline** enchaîne les étapes de preprocessing de manière propre et évite les data leaks :

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

# Définir les features par type
numeric_features = ["age", "montant", "tenure"]
categorical_features = ["pays", "canal"]

# Pipeline de preprocessing
preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numeric_features),
    ("cat", OneHotEncoder(drop="first"), categorical_features),
])

# Pipeline complet
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, random_state=42)),
])

# Entraîner et évaluer en une seule étape
pipeline.fit(X_train, y_train)
score = pipeline.score(X_test, y_test)
print(f"Accuracy : {score:.3f}")
```
$content$,
  2, 25, false
  FROM ml_course
  RETURNING id
)

SELECT 'ML course created' AS status;


-- ─── COURSE 3: Python & Pandas ───────────────────────────────────────────────
WITH pandas_course AS (
  INSERT INTO courses (id, slug, title, description, category, level, is_published, is_premium, "order")
  VALUES (
    gen_random_uuid(),
    'python-pandas-debutant',
    'Python & Pandas pour la Data',
    'Maîtrise Python et Pandas pour l''analyse de données. De la manipulation de DataFrames à l''analyse exploratoire avancée.',
    'data_engineering',
    'beginner',
    true,
    false,
    3
  )
  RETURNING id
),

pd_l1 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), pandas_course.id,
  'Introduction à Pandas — La bibliothèque data de Python',
$content$# Introduction à Pandas — La bibliothèque data de Python

## Pourquoi Pandas ?

**Pandas** est la bibliothèque Python incontournable pour la manipulation de données tabulaires. Elle est au cœur du workflow de tout Data Analyst/Scientist.

```python
import pandas as pd
import numpy as np

# Pandas = Excel en Python, mais 1000x plus puissant :
# - Gère des millions de lignes efficacement
# - S'intègre avec scikit-learn, matplotlib, SQL
# - Syntaxe expressive et lisible
```

---

## Les structures de données Pandas

### Series — Tableau 1D

```python
# Créer une Series
s = pd.Series([10, 20, 30, 40], index=["a", "b", "c", "d"])

print(s)
# a    10
# b    20
# c    30
# d    40

# Accès
print(s["b"])     # 20
print(s[s > 15])  # b 20, c 30, d 40

# Opérations vectorisées
print(s * 2)      # a 20, b 40, c 60, d 80
print(s.mean())   # 25.0
```

### DataFrame — Tableau 2D

```python
# Créer un DataFrame
df = pd.DataFrame({
    "nom": ["Alice", "Bob", "Charlie", "Diana"],
    "age": [28, 34, 25, 31],
    "salaire": [45000, 62000, 38000, 71000],
    "departement": ["Tech", "Finance", "Tech", "Marketing"]
})

print(df)
#       nom  age  salaire departement
# 0   Alice   28    45000        Tech
# 1     Bob   34    62000     Finance
# 2 Charlie   25    38000        Tech
# 3   Diana   31    71000   Marketing
```

---

## Accès aux données

```python
# Sélection de colonnes
df["nom"]                # Series
df[["nom", "salaire"]]   # DataFrame

# Sélection de lignes
df.iloc[0]               # Première ligne (index entier)
df.iloc[0:3]             # Lignes 0, 1, 2
df.loc[0]                # Ligne avec index 0
df.loc[0:2]              # Lignes index 0 à 2 (inclusif avec loc!)

# Sélection avec condition
df[df["age"] > 30]                           # Filtre booléen
df[df["departement"] == "Tech"]
df[(df["age"] > 25) & (df["salaire"] > 40000)]  # ET
df[(df["age"] < 26) | (df["salaire"] > 60000)]  # OU

# Accès à un élément précis
df.at[0, "nom"]      # "Alice" (accès rapide par index/colonne)
df.iat[0, 0]         # "Alice" (accès par position)
```

---

## Informations sur le DataFrame

```python
print(df.shape)          # (4, 4) → 4 lignes, 4 colonnes
print(df.dtypes)         # Types des colonnes
print(df.info())         # Résumé complet (types + valeurs non-null)
print(df.describe())     # Stats descriptives (mean, std, min, max...)
print(df.head(3))        # 3 premières lignes
print(df.tail(3))        # 3 dernières lignes
print(df.sample(3))      # 3 lignes aléatoires
print(df.nunique())      # Nombre de valeurs uniques par colonne
print(df.value_counts()) # Fréquence de chaque valeur (pour Series)
```

---

## Créer et modifier des colonnes

```python
# Nouvelle colonne calculée
df["salaire_mensuel"] = df["salaire"] / 12
df["senior"] = df["age"] >= 30

# Modifier avec apply (fonction custom)
df["grade"] = df["salaire"].apply(lambda x: "Senior" if x > 60000 else "Junior")

# map (correspondance dictionnaire)
dept_mapping = {"Tech": "T", "Finance": "F", "Marketing": "M"}
df["dept_code"] = df["departement"].map(dept_mapping)

# where (condition)
df["bonus"] = df["salaire"].where(df["senior"], df["salaire"] * 0.1)

# Renommer des colonnes
df.rename(columns={"nom": "name", "age": "âge"}, inplace=True)

# Supprimer des colonnes
df.drop(columns=["dept_code"], inplace=True)
```

---

## Lire et écrire des fichiers

```python
# Lire
df = pd.read_csv("data.csv", sep=";", encoding="utf-8")
df = pd.read_excel("rapport.xlsx", sheet_name="Ventes")
df = pd.read_json("data.json")
df = pd.read_sql("SELECT * FROM clients", connection)

# Écrire
df.to_csv("output.csv", index=False)
df.to_excel("rapport.xlsx", index=False)
df.to_parquet("data.parquet")  # Format optimisé pour la data

# Options utiles pour read_csv
df = pd.read_csv(
    "data.csv",
    sep=";",
    encoding="utf-8",
    parse_dates=["date_commande"],  # Convertit en datetime
    dtype={"montant": float},
    na_values=["N/A", "NULL", "-"],  # Valeurs à considérer comme NaN
    usecols=["id", "nom", "montant"],  # Colonnes à charger
    nrows=1000,  # Limiter pour exploration
)
```
$content$,
  1, 18, false
  FROM pandas_course
  RETURNING id
),

pd_l2 AS (
  INSERT INTO lessons (id, course_id, title, content, "order", duration_minutes, is_premium)
  SELECT gen_random_uuid(), pandas_course.id,
  'GroupBy et Agrégations — Résumer vos données',
$content$# GroupBy et Agrégations — Résumer vos données

## Le concept GroupBy

Le `groupby` de Pandas est l'équivalent du `GROUP BY` en SQL : il divise les données en groupes, applique une fonction à chaque groupe, et combine les résultats.

```
Split → Apply → Combine
  ↓       ↓         ↓
Groupe  Calcul   Résultat
```

---

## Agrégations simples

```python
import pandas as pd

df = pd.read_csv("ventes.csv")

# Grouper par une colonne
grouped = df.groupby("region")

# Agrégations courantes
grouped["montant"].sum()           # CA par région
grouped["montant"].mean()          # Panier moyen
grouped["montant"].count()         # Nombre de ventes
grouped["montant"].max()           # Vente max
grouped["client_id"].nunique()     # Clients uniques

# Plusieurs agrégations en une fois
result = grouped["montant"].agg(["sum", "mean", "count", "std"])

# Agrégations différentes par colonne
result = grouped.agg({
    "montant": ["sum", "mean"],
    "client_id": "nunique",
    "produit": "count"
})
```

---

## GroupBy multi-colonnes

```python
# Grouper par plusieurs colonnes
df.groupby(["region", "categorie"])["montant"].sum()

# Avec reset_index pour avoir un DataFrame propre
result = (df
    .groupby(["region", "categorie"])["montant"]
    .sum()
    .reset_index()
    .rename(columns={"montant": "ca_total"})
    .sort_values("ca_total", ascending=False)
)
```

---

## agg() — Agrégations personnalisées

```python
# Fonctions d'agrégation personnalisées
def coeff_variation(x):
    return x.std() / x.mean() * 100

result = df.groupby("region").agg(
    nb_ventes=("montant", "count"),
    ca_total=("montant", "sum"),
    panier_moyen=("montant", "mean"),
    variabilite=("montant", coeff_variation),
    p25=("montant", lambda x: x.quantile(0.25)),
    p75=("montant", lambda x: x.quantile(0.75)),
    nb_clients=("client_id", "nunique"),
)
print(result)
```

---

## transform() — Conserver le format original

`transform()` applique une fonction à chaque groupe mais **retourne une Series de même taille** que le DataFrame original.

```python
# Ajouter la moyenne du groupe sur chaque ligne (sans réduire)
df["ca_moyen_region"] = df.groupby("region")["montant"].transform("mean")
df["rang_dans_region"] = df.groupby("region")["montant"].transform(
    lambda x: x.rank(ascending=False)
)

# Utile pour normaliser par groupe
df["montant_normalized"] = (
    df["montant"] - df.groupby("region")["montant"].transform("mean")
) / df.groupby("region")["montant"].transform("std")
```

---

## Pivot Tables

```python
# Équivalent du tableau croisé dynamique Excel
pivot = df.pivot_table(
    values="montant",        # Valeur à agréger
    index="region",          # Lignes
    columns="trimestre",     # Colonnes
    aggfunc="sum",           # Fonction d'agrégation
    fill_value=0,            # Remplace NaN par 0
    margins=True,            # Ajoute ligne/colonne Total
    margins_name="Total"
)
print(pivot)
#              Q1      Q2      Q3      Q4    Total
# region
# Amérique  32000   38000   29000   45000  144000
# Asie      28000   31000   35000   42000  136000
# Europe    45000   52000   48000   61000  206000
# Total    105000  121000  112000  148000  486000
```

---

## Resample — Agrégation temporelle

```python
# Préparer les données temporelles
df["date"] = pd.to_datetime(df["date"])
df.set_index("date", inplace=True)

# Agrégations par période
daily = df["montant"].resample("D").sum()       # Par jour
weekly = df["montant"].resample("W").sum()      # Par semaine
monthly = df["montant"].resample("ME").sum()     # Par mois (fin de mois)
quarterly = df["montant"].resample("QE").sum()   # Par trimestre

# Avec plusieurs statistiques
stats = df["montant"].resample("ME").agg({
    "ca": "sum",
    "nb_ventes": "count",
    "panier_moyen": "mean"
})

# Rolling window (moyenne mobile)
df["moy_7j"] = df["montant"].rolling(window=7).mean()
df["moy_30j"] = df["montant"].rolling(window=30).mean()
```

---

## Cas pratique complet : Analyse des ventes

```python
import pandas as pd
import numpy as np

# Chargement
df = pd.read_csv("ventes.csv", parse_dates=["date"])

# Enrichissement
df["mois"] = df["date"].dt.to_period("M")
df["trimestre"] = df["date"].dt.to_period("Q")
df["ca_ligne"] = df["quantite"] * df["prix_unitaire"]

# Analyse complète
report = df.groupby(["trimestre", "categorie"]).agg(
    nb_commandes=("id", "count"),
    nb_clients=("client_id", "nunique"),
    ca_total=("ca_ligne", "sum"),
    panier_moyen=("ca_ligne", "mean"),
    retour_pct=("est_retour", "mean")
).round(2)

# Top produits par trimestre
top_products = (
    df.groupby(["trimestre", "produit"])["ca_ligne"]
    .sum()
    .groupby(level=0, group_keys=False)
    .nlargest(3)
    .reset_index()
)

print(top_products)
```
$content$,
  2, 22, false
  FROM pandas_course
  RETURNING id
)

SELECT 'Pandas course created' AS status;


-- ─── BADGES ──────────────────────────────────────────────────────────────────
INSERT INTO badges (id, name, description, icon, trigger, trigger_value)
VALUES
  (gen_random_uuid(), 'Premier Pas', 'Premier challenge résolu !', '🎯', 'first_solve', 1),
  (gen_random_uuid(), 'Semaine de Feu', '7 jours consécutifs actifs', '🔥', 'streak', 7),
  (gen_random_uuid(), 'Mois de Fer', '30 jours consécutifs actifs', '⚡', 'streak', 30),
  (gen_random_uuid(), 'Maître SQL', '10 challenges SQL résolus', '🗄️', 'category_master', 10),
  (gen_random_uuid(), 'Guru ML', '5 challenges ML résolus', '🤖', 'category_master', 5),
  (gen_random_uuid(), 'Analyste Confirmé', 'Atteindre 1200 ELO', '📊', 'elo_milestone', 1200),
  (gen_random_uuid(), 'Expert Data', 'Atteindre 1500 ELO', '🏆', 'elo_milestone', 1500),
  (gen_random_uuid(), 'Flash', 'Résoudre un challenge en moins de 500ms', '⚡', 'speed_solve', 500),
  (gen_random_uuid(), 'Perfectionniste', 'Score parfait sur un challenge ML', '💎', 'perfect_score', 1)
ON CONFLICT (name) DO NOTHING;
