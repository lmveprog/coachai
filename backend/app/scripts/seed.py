"""
Script de seed — Popule la base avec des données initiales.
Usage: python -m app.scripts.seed
"""
import asyncio
import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.badge import Badge, BadgeTrigger
from app.models.challenge import Challenge, ChallengeCategory, ChallengeDifficulty, ChallengeType, ChallengeTag, ChallengeTestCase
from app.models.course import Course, Lesson, CourseCategory
import app.models  # noqa

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

BADGES = [
    dict(name="Premier Pas", description="Résoudre votre premier challenge", icon="🚀", trigger=BadgeTrigger.FIRST_SOLVE, trigger_value=1),
    dict(name="Semaine de Feu", description="7 jours consécutifs d'activité", icon="🔥", trigger=BadgeTrigger.STREAK, trigger_value=7),
    dict(name="Mois d'Acier", description="30 jours consécutifs d'activité", icon="⚡", trigger=BadgeTrigger.STREAK, trigger_value=30),
    dict(name="Analyste SQL", description="Résoudre 5 challenges SQL", icon="🗄️", trigger=BadgeTrigger.CATEGORY_MASTER, trigger_value=5),
    dict(name="Data Scientist", description="Résoudre 5 challenges Machine Learning", icon="🤖", trigger=BadgeTrigger.CATEGORY_MASTER, trigger_value=5),
    dict(name="Analyste ELO 1200", description="Atteindre 1200 ELO", icon="📈", trigger=BadgeTrigger.ELO_MILESTONE, trigger_value=1200),
    dict(name="Expert ELO 1500", description="Atteindre 1500 ELO", icon="🏆", trigger=BadgeTrigger.ELO_MILESTONE, trigger_value=1500),
    dict(name="Master ELO 1800", description="Atteindre 1800 ELO", icon="👑", trigger=BadgeTrigger.ELO_MILESTONE, trigger_value=1800),
    dict(name="Éclair", description="Résoudre un challenge en moins d'1 seconde", icon="⚡", trigger=BadgeTrigger.SPEED_SOLVE, trigger_value=1000),
    dict(name="Score Parfait", description="Obtenir 100/100 sur un challenge ML", icon="💯", trigger=BadgeTrigger.PERFECT_SCORE, trigger_value=1),
]

_SQL_EMPLOYEES = """CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Alice Martin', 'Engineering', 95000, NULL);
INSERT INTO employees VALUES (2, 'Bob Dupont', 'Engineering', 78000, 1);
INSERT INTO employees VALUES (3, 'Charlie Leroy', 'Marketing', 62000, NULL);
INSERT INTO employees VALUES (4, 'Diana Moreau', 'Engineering', 82000, 1);
INSERT INTO employees VALUES (5, 'Eve Bernard', 'Marketing', 58000, 3);
INSERT INTO employees VALUES (6, 'Frank Petit', 'HR', 55000, NULL);
INSERT INTO employees VALUES (7, 'Grace Simon', 'HR', 52000, 6);
INSERT INTO employees VALUES (8, 'Hugo Laurent', 'Marketing', 65000, 3);"""

CHALLENGES = [
    {
        "slug": "sql-select-basics",
        "title": "Sélection de base en SQL",
        "description": """## Objectif
Sélectionne le **nom** et l'**âge** de tous les utilisateurs dont l'âge est supérieur à 18 ans, triés par âge croissant.

## Schéma
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    email TEXT
);
```

## Données
| name    | age | 
|---------|-----|
| Alice   | 25  |
| Bob     | 30  |
| Charlie | 22  |
| Dave    | 15  |
| Eve     | 17  |

## Sortie attendue
```
name,age
Charlie,22
Alice,25
Bob,30
```
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 20,
        "time_limit_seconds": 10,
        "starter_code": "SELECT name, age FROM users WHERE age > 18 ORDER BY age ASC;",
        "tags": ["select", "where", "order by"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, email TEXT);\nINSERT INTO users VALUES (1, 'Alice', 25, 'alice@test.com');\nINSERT INTO users VALUES (2, 'Bob', 30, 'bob@test.com');\nINSERT INTO users VALUES (3, 'Charlie', 22, 'charlie@test.com');\nINSERT INTO users VALUES (4, 'Dave', 15, 'dave@test.com');\nINSERT INTO users VALUES (5, 'Eve', 17, 'eve@test.com');", "expected_output": "name,age\nCharlie,22\nAlice,25\nBob,30", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "sql-aggregation",
        "title": "Agrégation et GROUP BY",
        "description": """## Objectif
Calcule le **chiffre d'affaires total par catégorie**, trié par CA décroissant.

## Schéma
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    product_category TEXT,
    amount REAL,
    created_at TEXT
);
```

## Sortie attendue
```
category,total_revenue
Electronics,15000.0
Clothing,8500.0
Books,3200.0
```
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 40,
        "time_limit_seconds": 10,
        "starter_code": "SELECT product_category AS category, SUM(amount) AS total_revenue\nFROM orders\nGROUP BY product_category\nORDER BY total_revenue DESC;",
        "tags": ["group by", "sum", "aggregation"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE orders (id INTEGER PRIMARY KEY, product_category TEXT, amount REAL, created_at TEXT);\nINSERT INTO orders VALUES (1, 'Electronics', 5000.0, '2024-01-01');\nINSERT INTO orders VALUES (2, 'Electronics', 5000.0, '2024-01-02');\nINSERT INTO orders VALUES (3, 'Electronics', 5000.0, '2024-01-03');\nINSERT INTO orders VALUES (4, 'Clothing', 3000.0, '2024-01-01');\nINSERT INTO orders VALUES (5, 'Clothing', 3000.0, '2024-01-02');\nINSERT INTO orders VALUES (6, 'Clothing', 2500.0, '2024-01-03');\nINSERT INTO orders VALUES (7, 'Books', 1000.0, '2024-01-01');\nINSERT INTO orders VALUES (8, 'Books', 1200.0, '2024-01-02');\nINSERT INTO orders VALUES (9, 'Books', 1000.0, '2024-01-03');", "expected_output": "category,total_revenue\nElectronics,15000.0\nClothing,8500.0\nBooks,3200.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "sql-joins",
        "title": "Jointures SQL",
        "description": """## Objectif
Utilise une **JOIN** pour calculer le total des achats par client.

Sélectionne le **nom**, le **nombre de commandes** et le **montant total** (arrondi à 2 décimales), trié par montant décroissant.

## Schéma
```sql
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, product TEXT);
```

## Sortie attendue
```
name,total_orders,total_spent
Bob,1,299.0
Alice,2,170.49
Charlie,2,40.0
```
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 45,
        "time_limit_seconds": 10,
        "starter_code": "SELECT u.name, COUNT(o.id) AS total_orders, ROUND(SUM(o.amount), 2) AS total_spent\nFROM users u\nJOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY total_spent DESC;",
        "tags": ["join", "group by", "aggregate"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);\nINSERT INTO users VALUES (1, 'Alice', 'alice@test.com');\nINSERT INTO users VALUES (2, 'Bob', 'bob@test.com');\nINSERT INTO users VALUES (3, 'Charlie', 'charlie@test.com');\nCREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, product TEXT);\nINSERT INTO orders VALUES (1, 1, 120.50, 'Laptop');\nINSERT INTO orders VALUES (2, 1, 49.99, 'Book');\nINSERT INTO orders VALUES (3, 2, 299.00, 'Phone');\nINSERT INTO orders VALUES (4, 3, 15.00, 'Pen');\nINSERT INTO orders VALUES (5, 3, 25.00, 'Notebook');", "expected_output": "name,total_orders,total_spent\nBob,1,299.0\nAlice,2,170.49\nCharlie,2,40.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "sql-window-functions",
        "title": "Fonctions Fenêtre — Ranking",
        "description": """## Objectif
Utilise `RANK() OVER (PARTITION BY ...)` pour classer les employés par salaire au sein de chaque département.

## Colonnes attendues
```
name, department, salary, dept_rank
```

Trié par `department ASC`, puis `dept_rank ASC`.

## Exemple de sortie
```
name,department,salary,dept_rank
Alice Martin,Engineering,95000.0,1
Diana Moreau,Engineering,82000.0,2
...
```
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.HARD,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 80,
        "time_limit_seconds": 10,
        "starter_code": "SELECT\n    name,\n    department,\n    salary,\n    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees\nORDER BY department ASC, dept_rank ASC;",
        "tags": ["window functions", "rank", "partition by"],
        "evaluation_config": {},
        "test_cases": [{"input_data": _SQL_EMPLOYEES, "expected_output": "name,department,salary,dept_rank\nAlice Martin,Engineering,95000.0,1\nDiana Moreau,Engineering,82000.0,2\nBob Dupont,Engineering,78000.0,3\nFrank Petit,HR,55000.0,1\nGrace Simon,HR,52000.0,2\nHugo Laurent,Marketing,65000.0,1\nCharlie Leroy,Marketing,62000.0,2\nEve Bernard,Marketing,58000.0,3", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "python-fizzbuzz",
        "title": "FizzBuzz",
        "description": """## Objectif
Affiche les nombres de **1 à 20** en remplaçant :
- Multiples de **3** → `Fizz`
- Multiples de **5** → `Buzz`
- Multiples de **3 et 5** → `FizzBuzz`

## Sortie attendue (extrait)
```
1
2
Fizz
4
Buzz
...
FizzBuzz
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 15,
        "time_limit_seconds": 10,
        "starter_code": "for i in range(1, 21):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n",
        "tags": ["python", "loops", "conditions"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "python-fibonacci",
        "title": "Suite de Fibonacci",
        "description": """## Objectif
Affiche les **10 premiers termes** de la suite de Fibonacci, un par ligne.

`F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)`

## Sortie attendue
```
0
1
1
2
3
5
8
13
21
34
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 15,
        "time_limit_seconds": 10,
        "starter_code": "a, b = 0, 1\nfor _ in range(10):\n    print(a)\n    a, b = b, a + b\n",
        "tags": ["python", "fibonacci", "loops"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "0\n1\n1\n2\n3\n5\n8\n13\n21\n34", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "python-list-comprehension",
        "title": "Compréhension de liste",
        "description": """## Objectif
Calcule la **somme des carrés des nombres pairs** de 1 à 10 avec une compréhension de liste.

## Calcul
Pairs : 2, 4, 6, 8, 10 → Carrés : 4, 16, 36, 64, 100 → **Somme = 220**

## Sortie attendue
```
220
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 15,
        "time_limit_seconds": 10,
        "starter_code": "numbers = list(range(1, 11))\nresult = [x**2 for x in numbers if x % 2 == 0]\nprint(sum(result))\n",
        "tags": ["python", "list comprehension", "filter"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "220", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "pandas-data-cleaning",
        "title": "Nettoyage de données avec Pandas",
        "description": """## Objectif
Supprime les lignes contenant des valeurs manquantes et affiche le **nombre de lignes restantes**.

## Dataset initial (10 lignes)
Certaines lignes ont des `None`/`NaN` dans `name`, `age` ou `score`.

## Sortie attendue
```
7
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 20,
        "time_limit_seconds": 15,
        "starter_code": "import pandas as pd\nimport numpy as np\n\ndata = {\n    'name': ['Alice', 'Bob', None, 'Diana', 'Eve', 'Frank', None, 'Henry', 'Iris', 'Jack'],\n    'age': [25, 30, 22, None, 28, 35, 29, None, 31, 27],\n    'score': [88, 92, 75, 95, None, 82, 90, 78, None, 88]\n}\ndf = pd.DataFrame(data)\n\ndf_clean = df.dropna()\nprint(len(df_clean))\n",
        "tags": ["pandas", "dropna", "data cleaning"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "7", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "pandas-groupby",
        "title": "GroupBy et Agrégation Pandas",
        "description": """## Objectif
Groupe un DataFrame par `category`, calcule la somme de `value`, et affiche au format `CATEGORIE:TOTAL`.

## Dataset
```python
category: ['A','B','A','C','B','A','C','B']
value:     [10, 20, 30, 15, 25, 40, 35, 30]
```

## Sortie attendue
```
A:80
B:75
C:50
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 20,
        "time_limit_seconds": 15,
        "starter_code": "import pandas as pd\n\ndata = {\n    'category': ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'B'],\n    'value': [10, 20, 30, 15, 25, 40, 35, 30]\n}\ndf = pd.DataFrame(data)\n\nresult = df.groupby('category')['value'].sum().sort_index()\nfor cat, total in result.items():\n    print(f\"{cat}:{total}\")\n",
        "tags": ["pandas", "groupby", "aggregation"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "A:80\nB:75\nC:50", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-iris-classifier",
        "title": "Classification Iris",
        "description": """## Objectif
Entraîne un **RandomForestClassifier** sur Iris et affiche l'accuracy arrondie à 2 décimales.

## Instructions
1. `load_iris(return_X_y=True)`
2. `train_test_split(test_size=0.2, random_state=42)`
3. `RandomForestClassifier(random_state=42)`
4. `print(round(accuracy, 2))`

## Sortie attendue
```
1.0
```

Le dataset Iris est très propre et séparable — une Random Forest atteint 100% sur ce split.
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 30,
        "time_limit_seconds": 60,
        "starter_code": "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nclf = RandomForestClassifier(random_state=42)\nclf.fit(X_train, y_train)\n\naccuracy = clf.score(X_test, y_test)\nprint(round(accuracy, 2))\n",
        "tags": ["sklearn", "classification", "iris", "random forest"],
        "evaluation_config": {"metric": "exact_output"},
        "test_cases": [{"input_data": None, "expected_output": "1.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-linear-regression",
        "title": "Régression Linéaire : Prix des maisons",
        "description": """## Objectif
Prédit le prix médian des maisons (California Housing) avec une régression linéaire.

## Instructions
1. `fetch_california_housing(return_X_y=True)`
2. Split 80/20 avec `random_state=0`
3. Normalise avec `StandardScaler`
4. `LinearRegression`
5. Affiche le **R² arrondi à 2 décimales**

## Sortie attendue
```
0.61
```
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 50,
        "time_limit_seconds": 60,
        "starter_code": "from sklearn.datasets import fetch_california_housing\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\n\nX, y = fetch_california_housing(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)\n\nscaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\nr2 = model.score(X_test, y_test)\nprint(round(r2, 2))\n",
        "tags": ["sklearn", "regression", "linear regression", "r2 score"],
        "evaluation_config": {"metric": "exact_output"},
        "test_cases": [{"input_data": None, "expected_output": "0.61", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-knn-classifier",
        "title": "K-Nearest Neighbors",
        "description": """## Objectif
Implémente un **KNeighborsClassifier** sur Iris avec k=5.

## Instructions
1. `load_iris(return_X_y=True)`
2. Split 80/20 avec `random_state=42`
3. `KNeighborsClassifier(n_neighbors=5)`
4. Affiche l'accuracy arrondie à 2 décimales

## Sortie attendue
```
1.0
```
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 30,
        "time_limit_seconds": 30,
        "starter_code": "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nknn = KNeighborsClassifier(n_neighbors=5)\nknn.fit(X_train, y_train)\n\naccuracy = knn.score(X_test, y_test)\nprint(round(accuracy, 2))\n",
        "tags": ["sklearn", "knn", "classification"],
        "evaluation_config": {"metric": "exact_output"},
        "test_cases": [{"input_data": None, "expected_output": "1.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    # ─── Nouveaux challenges v2 ────────────────────────────────────────────────
    {
        "slug": "sql-jointure-clients",
        "title": "Commandes par client (LEFT JOIN)",
        "description": """## Contexte
Boutique en ligne — tables `clients` et `commandes`.

## Objectif
Pour chaque client, affiche `nom`, `nb_commandes`, `total_depense` (arrondi à 2 décimales).
Inclus les clients **sans commande** (nb_commandes = 0).
Trie par `total_depense` **DESC**.

## Structure
```sql
clients(id, nom, email)
commandes(id, client_id, montant, date_cmd)
```

> 💡 `LEFT JOIN` + `COALESCE` + `GROUP BY`
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.EASY,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 35,
        "time_limit_seconds": 30,
        "starter_code": "SELECT c.nom, COUNT(o.id) AS nb_commandes,\n  COALESCE(ROUND(SUM(o.montant), 2), 0) AS total_depense\nFROM clients c\nLEFT JOIN commandes o ON c.id = o.client_id\nGROUP BY c.id, c.nom\nORDER BY total_depense DESC;",
        "tags": ["LEFT JOIN", "COALESCE", "GROUP BY"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT, email TEXT);\nINSERT INTO clients VALUES (1,'Alice Martin','alice@mail.com'),(2,'Bob Dupont','bob@mail.com'),(3,'Claire Petit','claire@mail.com'),(4,'David Moreau','david@mail.com');\nCREATE TABLE commandes (id INTEGER PRIMARY KEY, client_id INTEGER, montant REAL, date_cmd TEXT);\nINSERT INTO commandes VALUES (1,1,150.0,'2024-01-10'),(2,1,89.5,'2024-01-22'),(3,2,340.0,'2024-02-05'),(4,2,120.0,'2024-02-18'),(5,3,55.0,'2024-03-01');", "expected_output": "nom,nb_commandes,total_depense\nBob Dupont,2,460.0\nAlice Martin,2,239.5\nClaire Petit,1,55.0\nDavid Moreau,0,0.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "sql-window-rank-vendeurs",
        "title": "Classement des vendeurs par région",
        "description": """## Contexte
Classe chaque vendeur dans sa région selon son CA.

## Objectif
Retourne `vendeur`, `region`, `ca`, `rang` (RANK par région).
Trie par `region` ASC, `rang` ASC.

> 💡 `RANK() OVER (PARTITION BY region ORDER BY ca DESC)`
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 45,
        "time_limit_seconds": 30,
        "starter_code": "SELECT vendeur, region, ca,\n  RANK() OVER (PARTITION BY region ORDER BY ca DESC) AS rang\nFROM ventes_rep\nORDER BY region ASC, rang ASC;",
        "tags": ["Window Functions", "RANK", "PARTITION BY"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE ventes_rep (vendeur TEXT, region TEXT, ca INTEGER);\nINSERT INTO ventes_rep VALUES ('Sophie L.','Nord',85000),('Marc D.','Nord',92000),('Luc B.','Nord',85000),('Julie P.','Sud',78000),('Emma R.','Sud',95000),('Paul T.','Sud',61000),('Ana C.','Est',70000),('Tom V.','Est',88000);", "expected_output": "vendeur,region,ca,rang\nAna C.,Est,70000,2\nTom V.,Est,88000,1\nLuc B.,Nord,85000,2\nMarc D.,Nord,92000,1\nSophie L.,Nord,85000,2\nEmma R.,Sud,95000,1\nJulie P.,Sud,78000,2\nPaul T.,Sud,61000,3", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "sql-subquery-above-avg",
        "title": "Produits au-dessus de la moyenne",
        "description": """## Contexte
Catalogue produits avec catégories et prix.

## Objectif
Retourne `nom`, `categorie`, `prix`, `prix_moyen_cat` pour les produits dont le prix est **supérieur à la moyenne de leur catégorie**.
Trie par `categorie` ASC, `prix` DESC.

> 💡 JOIN sur une sous-requête `GROUP BY`
""",
        "category": ChallengeCategory.SQL,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 52,
        "time_limit_seconds": 30,
        "starter_code": "SELECT p.nom, p.categorie, p.prix,\n  ROUND(avg_cat.prix_moyen, 2) AS prix_moyen_cat\nFROM produits p\nJOIN (\n  SELECT categorie, AVG(prix) AS prix_moyen\n  FROM produits GROUP BY categorie\n) avg_cat ON p.categorie = avg_cat.categorie\nWHERE p.prix > avg_cat.prix_moyen\nORDER BY p.categorie ASC, p.prix DESC;",
        "tags": ["Sous-requête", "AVG", "JOIN"],
        "evaluation_config": {},
        "test_cases": [{"input_data": "CREATE TABLE produits (id INTEGER PRIMARY KEY, nom TEXT, categorie TEXT, prix REAL);\nINSERT INTO produits VALUES (1,'MacBook Pro','Informatique',2499),(2,'Dell XPS','Informatique',1299),(3,'ASUS VivoBook','Informatique',699),(4,'iPhone 15','Téléphonie',999),(5,'Samsung S24','Téléphonie',899),(6,'Xiaomi 14','Téléphonie',499),(7,'Sony WH-1000XM5','Audio',349),(8,'AirPods Pro','Audio',279),(9,'Bose QC45','Audio',329);", "expected_output": "nom,categorie,prix,prix_moyen_cat\nSony WH-1000XM5,Audio,349,319.0\nMacBook Pro,Informatique,2499,1499.0\niPhone 15,Téléphonie,999,799.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "pandas-merge-join",
        "title": "Enrichissement de données avec merge",
        "description": """## Objectif
Merge `commandes` et `produits` sur `produit_id`, calcule `ca_ligne = quantite * prix_unitaire`, puis agrège par `categorie` :
- `nb_commandes`, `ca_total`, `panier_moyen` (arrondi à 2 décimales)

Trie par `ca_total` DESC.

```python
print(result.to_csv(index=False))
```
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 50,
        "time_limit_seconds": 30,
        "starter_code": "import pandas as pd\n\ncommandes = pd.DataFrame({'commande_id':[1,2,3,4,5,6,7,8],'produit_id':[101,102,101,103,102,104,103,101],'quantite':[2,1,3,1,2,1,4,1]})\nproduits = pd.DataFrame({'produit_id':[101,102,103,104],'nom':['Laptop','Souris','Clavier','Écran'],'categorie':['Informatique','Accessoires','Accessoires','Informatique'],'prix_unitaire':[899.0,29.0,79.0,299.0]})\n\ndf = pd.merge(commandes, produits, on='produit_id')\ndf['ca_ligne'] = df['quantite'] * df['prix_unitaire']\nresult = df.groupby('categorie').agg(nb_commandes=('commande_id','count'),ca_total=('ca_ligne','sum'),panier_moyen=('ca_ligne','mean')).round(2).reset_index().sort_values('ca_total',ascending=False)\nprint(result.to_csv(index=False))",
        "tags": ["pandas", "merge", "groupby", "agg"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "categorie,nb_commandes,ca_total,panier_moyen\nInformatique,4,4194.0,1048.5\nAccessoires,4,524.0,131.0", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "pandas-time-series-rolling",
        "title": "Moyenne mobile et variation",
        "description": """## Objectif
À partir du DataFrame `trafic` (14 jours de visites) :
1. Convertis `date` en datetime et définis comme index
2. Calcule `ma_7j` = rolling(7).mean() arrondi à 1 décimale
3. Calcule `pct_change` = pct_change() arrondi à 3 décimales
4. Garde seulement les lignes avec `ma_7j` non-NaN
5. Affiche `print(result[['visites','ma_7j','pct_change']].to_csv())`
""",
        "category": ChallengeCategory.DATA_ENGINEERING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 55,
        "time_limit_seconds": 30,
        "starter_code": "import pandas as pd\nimport numpy as np\n\ndates = pd.date_range('2024-01-01', periods=14, freq='D')\nvisites = [1200,1350,980,1100,1420,1680,1250,1300,1180,1450,1600,1380,1290,1510]\ndf = pd.DataFrame({'date': dates, 'visites': visites})\n\ndf['date'] = pd.to_datetime(df['date'])\ndf = df.set_index('date')\ndf['ma_7j'] = df['visites'].rolling(7).mean().round(1)\ndf['pct_change'] = df['visites'].pct_change().round(3)\nresult = df.dropna(subset=['ma_7j'])\nprint(result[['visites','ma_7j','pct_change']].to_csv())",
        "tags": ["pandas", "rolling", "Séries temporelles", "pct_change"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "date,visites,ma_7j,pct_change\n2024-01-07,1250,1282.9,0.256\n2024-01-08,1300,1282.9,0.04\n2024-01-09,1180,1311.4,-0.092\n2024-01-10,1450,1337.1,0.229\n2024-01-11,1600,1351.4,0.103\n2024-01-12,1380,1394.3,-0.138\n2024-01-13,1290,1350.0,-0.065\n2024-01-14,1510,1387.1,0.171", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-random-forest-churn",
        "title": "Prédiction du churn avec Random Forest",
        "description": """## Objectif
Entraîne un `RandomForestClassifier` pour prédire le churn client.

**Données** : `anciennete`, `montant_mensuel`, `nb_tickets`, `plan_encoded`, `nb_produits`

1. `train_test_split(test_size=0.2, random_state=42)`
2. `RandomForestClassifier(n_estimators=100, random_state=42)`
3. Affiche :
```
Accuracy: {score}
AUC-ROC: {auc}
```
Les deux valeurs arrondies à 4 décimales. AUC-ROC ≥ **0.80**
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 60,
        "time_limit_seconds": 60,
        "starter_code": "import numpy as np\nimport pandas as pd\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import roc_auc_score\n\nnp.random.seed(42)\nn = 500\ndf = pd.DataFrame({\n    'anciennete': np.random.randint(1, 60, n),\n    'montant_mensuel': np.random.uniform(10, 200, n),\n    'nb_tickets': np.random.randint(0, 20, n),\n    'plan_encoded': np.random.randint(0, 3, n),\n    'nb_produits': np.random.randint(1, 6, n),\n})\ndf['churn'] = ((df['nb_tickets'] / df['anciennete'] > 0.3) | (df['montant_mensuel'] < 25)).astype(int)\n\nX = df.drop('churn', axis=1)\ny = df['churn']\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\nacc = model.score(X_test, y_test)\nauc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])\nprint(f'Accuracy: {acc:.4f}')\nprint(f'AUC-ROC: {auc:.4f}')",
        "tags": ["Random Forest", "Churn", "AUC-ROC", "classification"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "Accuracy: 0.8900\nAUC-ROC: 0.9432", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-feature-importance",
        "title": "Feature Importance & sélection de variables",
        "description": """## Objectif
1. Entraîne un `GradientBoostingClassifier(random_state=42)` sur le dataset breast cancer
2. Affiche les **3 features les plus importantes** (par importance décroissante) :
```
top_features:
{feature_1}: {importance_1:.4f}
{feature_2}: {importance_2:.4f}
{feature_3}: {importance_3:.4f}
Test accuracy: {accuracy:.4f}
```
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 58,
        "time_limit_seconds": 60,
        "starter_code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split\nimport numpy as np\n\ndata = load_breast_cancer()\nX, y = data.data, data.target\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = GradientBoostingClassifier(random_state=42)\nmodel.fit(X_train, y_train)\n\n# Top 3 features\nimportances = model.feature_importances_\nindices = np.argsort(importances)[::-1][:3]\nprint('top_features:')\nfor i in indices:\n    print(f'{data.feature_names[i]}: {importances[i]:.4f}')\nprint(f'Test accuracy: {model.score(X_test, y_test):.4f}')",
        "tags": ["Feature Importance", "GradientBoosting", "sklearn"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "top_features:\nworst concave points: 0.3215\nworst area: 0.1543\nworst radius: 0.0978\nTest accuracy: 0.9737", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-kmeans-elbow",
        "title": "K-Means et méthode du coude",
        "description": """## Objectif
Trouve le nombre optimal de clusters avec la **méthode du coude** (inertia).

1. Teste K de 2 à 8 sur le dataset `make_blobs(n_samples=300, centers=4, random_state=42)`
2. Pour chaque K, affiche `K={k}: inertia={inertia:.2f}`
3. Entraîne le modèle final avec `n_clusters=4`
4. Affiche `Silhouette score: {score:.4f}` (doit être ≥ **0.65**)
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 55,
        "time_limit_seconds": 60,
        "starter_code": "from sklearn.datasets import make_blobs\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nimport numpy as np\n\nX, _ = make_blobs(n_samples=300, centers=4, random_state=42, cluster_std=0.8)\n\nfor k in range(2, 9):\n    km = KMeans(n_clusters=k, random_state=42, n_init=10)\n    km.fit(X)\n    print(f'K={k}: inertia={km.inertia_:.2f}')\n\nfinal_model = KMeans(n_clusters=4, random_state=42, n_init=10)\nlabels = final_model.fit_predict(X)\nprint(f'Silhouette score: {silhouette_score(X, labels):.4f}')",
        "tags": ["K-Means", "Clustering", "Silhouette", "Elbow method"],
        "evaluation_config": {},
        "test_cases": [{"input_data": None, "expected_output": "K=2: inertia=1423.45\nK=3: inertia=742.18\nK=4: inertia=248.37\nK=5: inertia=203.91\nK=6: inertia=175.62\nK=7: inertia=152.44\nK=8: inertia=138.29\nSilhouette score: 0.7834", "is_hidden": False, "points": 100, "order": 0}],
    },
    {
        "slug": "ml-cross-validation",
        "title": "Validation Croisée",
        "description": """## Objectif
Évalue un Random Forest par **cross-validation 5-fold** sur Iris.

## Instructions
1. `load_iris(return_X_y=True)`
2. `RandomForestClassifier(random_state=42)`
3. `cross_val_score(clf, X, y, cv=5, scoring='accuracy')`
4. Affiche la **moyenne arrondie à 2 décimales**

## Sortie attendue
```
0.97
```
""",
        "category": ChallengeCategory.MACHINE_LEARNING,
        "difficulty": ChallengeDifficulty.MEDIUM,
        "challenge_type": ChallengeType.CODE,
        "elo_reward": 45,
        "time_limit_seconds": 60,
        "starter_code": "from sklearn.datasets import load_iris\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\nimport numpy as np\n\nX, y = load_iris(return_X_y=True)\n\nclf = RandomForestClassifier(random_state=42)\nscores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')\n\nprint(round(scores.mean(), 2))\n",
        "tags": ["sklearn", "cross validation", "random forest"],
        "evaluation_config": {"metric": "exact_output"},
        "test_cases": [{"input_data": None, "expected_output": "0.97", "is_hidden": False, "points": 100, "order": 0}],
    },
]

COURSES = [
    {
        "slug": "sql-pour-data-analysts",
        "title": "SQL pour Data Analysts",
        "description": "Maîtrise le SQL de zéro à expert. Requêtes, jointures, fenêtres, optimisation.",
        "category": CourseCategory.SQL,
        "level": "beginner",
        "order": 1,
        "lessons": [
            {"title": "Introduction au SQL", "order": 0, "duration_minutes": 10, "content": """# Introduction au SQL

Le SQL est le langage universel des bases de données relationnelles.

## Structure de base

```sql
SELECT colonne1, colonne2
FROM ma_table
WHERE condition
ORDER BY colonne1 ASC
LIMIT 10;
```

| Clause | Rôle |
|--------|------|
| `SELECT` | Colonnes à afficher |
| `FROM` | Table source |
| `WHERE` | Filtre les lignes |
| `ORDER BY` | Trie les résultats |
| `LIMIT` | Limite le nombre de résultats |

## Exemple

```sql
-- Les 5 employés les mieux payés
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;
```

## 💡 Challenge

Pratique avec **"Sélection de base en SQL"** !
"""},
            {"title": "WHERE et filtres", "order": 1, "duration_minutes": 15, "content": """# WHERE et filtres

## Opérateurs

| Opérateur | Exemple |
|-----------|---------|
| `=` | `age = 25` |
| `!=` | `status != 'inactive'` |
| `>`, `<`, `>=`, `<=` | `salary > 50000` |
| `BETWEEN` | `age BETWEEN 20 AND 30` |
| `IN` | `city IN ('Paris', 'Lyon')` |
| `LIKE` | `name LIKE 'Al%'` |
| `IS NULL` | `email IS NULL` |

## Combinaisons

```sql
WHERE condition1 AND condition2
WHERE condition1 OR condition2
WHERE NOT condition
```

## NULL — cas spécial

```sql
-- ❌ Ne fonctionne pas
WHERE email = NULL

-- ✅ Correct
WHERE email IS NULL
```
"""},
            {"title": "GROUP BY et agrégations", "order": 2, "duration_minutes": 20, "content": """# GROUP BY et agrégations

## Fonctions d'agrégation

| Fonction | Description |
|----------|-------------|
| `COUNT(*)` | Nombre de lignes |
| `SUM(col)` | Somme |
| `AVG(col)` | Moyenne |
| `MIN(col)` | Minimum |
| `MAX(col)` | Maximum |

## Exemple

```sql
SELECT category, COUNT(*) AS nb, SUM(amount) AS total
FROM orders
GROUP BY category
ORDER BY total DESC;
```

## HAVING — filtrer les groupes

```sql
-- Catégories avec CA > 10000
SELECT category, SUM(amount) AS total
FROM orders
GROUP BY category
HAVING total > 10000;
```

> `WHERE` filtre **avant** le groupement, `HAVING` **après**.

## 💡 Challenge

Pratique avec **"Agrégation et GROUP BY"** !
"""},
            {"title": "Jointures SQL", "order": 3, "duration_minutes": 25, "content": """# Jointures SQL (JOIN)

## Types de jointures

### INNER JOIN — Intersection
```sql
SELECT u.name, o.product
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### LEFT JOIN — Toutes les lignes de gauche
```sql
-- Tous les utilisateurs, même sans commande
SELECT u.name, COUNT(o.id) AS nb_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name;
```

## Exemple complet — Rapport client

```sql
SELECT
    u.name,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;
```

## 💡 Challenge

Pratique avec **"Jointures SQL"** !
"""},
        ],
    },
    {
        "slug": "machine-learning-fondamentaux",
        "title": "Machine Learning — Les fondamentaux",
        "description": "De la théorie à la pratique : régression, classification, évaluation de modèles avec scikit-learn.",
        "category": CourseCategory.MACHINE_LEARNING,
        "level": "beginner",
        "order": 2,
        "lessons": [
            {"title": "C'est quoi le Machine Learning ?", "order": 0, "duration_minutes": 12, "content": """# C'est quoi le Machine Learning ?

## Les 3 types d'apprentissage

| Type | Description | Exemples |
|------|-------------|---------|
| **Supervisé** | Données étiquetées | Classification, Régression |
| **Non supervisé** | Sans étiquettes | Clustering, PCA |
| **Par renforcement** | Essais/récompenses | Jeux, Robotique |

## Le pipeline ML

```
Données → EDA → Prétraitement → Entraînement → Évaluation → Déploiement
```

## Overfitting vs Underfitting

| Problème | Description | Solution |
|----------|-------------|----------|
| **Overfitting** | Mémorise, généralise mal | Régularisation, + données |
| **Underfitting** | Trop simple | Modèle + complexe |

## L'API sklearn

```python
model.fit(X_train, y_train)   # Entraîner
model.predict(X_test)          # Prédire
model.score(X_test, y_test)    # Évaluer
```
"""},
            {"title": "Régression Linéaire", "order": 1, "duration_minutes": 20, "content": """# Régression Linéaire

Prédit une **valeur continue** en minimisant l'erreur quadratique.

## Pourquoi normaliser ?

Sans normalisation, les features avec de grandes valeurs dominent. `StandardScaler` centre et réduit.

```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)  # fit + transform
X_test = scaler.transform(X_test)        # seulement transform !
```

> ⚠️ Ne jamais `fit` sur le test set — c'est une fuite de données !

## Code complet

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
model = LinearRegression()
model.fit(X_train, y_train)
print(f"R² = {model.score(X_test, y_test):.3f}")
```

## Métriques

| Métrique | Interprétation |
|----------|----------------|
| **R²** | 1=parfait, 0=baseline |
| **RMSE** | Erreur quadratique moyenne |
| **MAE** | Erreur absolue moyenne |

## 💡 Challenge

Pratique avec **"Régression Linéaire : Prix des maisons"** !
"""},
            {"title": "Classification avec Random Forest", "order": 2, "duration_minutes": 25, "content": """# Random Forest

Algorithme **ensemble** : combine plusieurs arbres de décision.

## Principe — Bagging

1. Tire N échantillons aléatoires (bootstrap)
2. Entraîne un arbre sur chaque échantillon
3. **Vote majoritaire** pour prédire

## Code

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

print(f"Accuracy: {clf.score(X_test, y_test):.3f}")
print(classification_report(y_test, clf.predict(X_test)))

# Importance des features
for feat, imp in zip(feature_names, clf.feature_importances_):
    print(f"{feat}: {imp:.3f}")
```

## Métriques de classification

- **Accuracy** : bon pour classes équilibrées
- **F1-score** : équilibre précision/rappel, idéal pour classes déséquilibrées
- **ROC-AUC** : performance globale du classifieur

## 💡 Challenge

Pratique avec **"Classification Iris"** !
"""},
            {"title": "Validation Croisée", "order": 3, "duration_minutes": 15, "content": """# Validation Croisée

Un seul split peut être biaisé. La cross-validation donne une estimation plus robuste.

## K-Fold

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
print(f"Mean: {scores.mean():.3f} ± {scores.std():.3f}")
```

## Grid Search + CV

```python
from sklearn.model_selection import GridSearchCV

param_grid = {'n_estimators': [50, 100], 'max_depth': [None, 5]}
grid = GridSearchCV(RandomForestClassifier(), param_grid, cv=5)
grid.fit(X_train, y_train)
print(f"Best params: {grid.best_params_}")
```

## 💡 Challenge

Pratique avec **"Validation Croisée"** !
"""},
        ],
    },
    {
        "slug": "python-numpy-fondamentaux",
        "title": "Python & NumPy : Analyse de données",
        "description": "Maîtrise Python et NumPy pour les calculs scientifiques, de la vectorisation aux générateurs de données pour le ML.",
        "category": CourseCategory.DATA_ENGINEERING,
        "level": "beginner",
        "order": 4,
        "lessons": [
            {"title": "Python pour la data : les fondamentaux", "order": 0, "duration_minutes": 20, "content": """# Python pour la data : les fondamentaux

## Types essentiels

```python
# Listes
notes = [14, 17, 12, 19]
doubles = [n * 2 for n in notes]           # list comprehension
sup15 = [n for n in notes if n > 15]       # filtre

# Dictionnaires
stats = {"moyenne": 15.5, "max": 19, "min": 12}

# f-strings
print(f"Moyenne : {stats['moyenne']:.2f}")   # "Moyenne : 15.50"
```

## Fonctions

```python
def calculer_stats(data: list) -> dict:
    return {
        "n": len(data),
        "mean": sum(data) / len(data),
        "min": min(data),
        "max": max(data)
    }
```

## 💡 Challenge

Pratique avec **"FizzBuzz"** ou **"Compréhension de liste"** !
"""},
            {"title": "NumPy : calcul vectorisé", "order": 1, "duration_minutes": 18, "content": """# NumPy : calcul vectorisé

## Arrays et opérations

```python
import numpy as np

# Création
a = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((3, 4))
range_arr = np.arange(0, 10, 2)     # [0, 2, 4, 6, 8]

# Opérations vectorisées (100x plus vite qu'une boucle)
prix = np.array([100, 250, 80, 320, 150])
ca = prix * np.array([5, 2, 10, 1, 4])  # [500, 500, 800, 320, 600]
prix_chers = prix[prix > 200]            # filtrage booléen
```

## Statistiques

```python
print(f"Moyenne : {prix.mean():.2f}")    # 180.00
print(f"Std : {prix.std():.2f}")         # 90.33
print(f"Percentile 75 : {np.percentile(prix, 75)}")
```

## Broadcasting

```python
# Normalisation Z-score
z = (data - data.mean()) / data.std()
```
"""},
            {"title": "Génération de données pour le ML", "order": 2, "duration_minutes": 15, "content": """# Génération de données pour le ML

## Reproductibilité

```python
import numpy as np
np.random.seed(42)  # toujours fixer la graine !
```

## Distributions

```python
# Normale (pour salaires, erreurs de mesure)
salaires = np.random.normal(loc=50000, scale=10000, size=1000)

# Uniforme (pour features normalisées)
features = np.random.uniform(0, 1, size=(100, 5))

# Entiers (pour catégories)
ages = np.random.randint(18, 65, size=200)

# Choix pondéré
classes = np.random.choice([0, 1], size=1000, p=[0.7, 0.3])
# 70% classe 0, 30% classe 1 → dataset déséquilibré
```

## Données synthétiques pour la régression

```python
n = 500
X = np.random.uniform(20, 150, n)       # surface m²
noise = np.random.normal(0, 15000, n)   # bruit
y = X * 6500 + noise                    # prix
```

## Matrices

```python
# Data matrix (100 observations, 4 features)
X = np.random.randn(100, 4)
print(X.shape)    # (100, 4)
print(X.mean(axis=0))  # moyenne par feature
```
"""},
            {"title": "NumPy avancé : reshape, broadcasting, masques", "order": 3, "duration_minutes": 20, "content": """# NumPy avancé

## Reshape

```python
arr = np.arange(24)
cube = arr.reshape(2, 3, 4)     # 3D !
matrice = arr.reshape(6, 4)
plat = matrice.flatten()
```

## Indexing avancé

```python
data = np.array([3, 7, 2, 9, 1, 5, 8, 4])

# Masque booléen
masque = data > 5
print(data[masque])   # [7, 9, 8]

# Indices triés
idx = np.argsort(data)[::-1]   # indices tri décroissant
print(data[idx])               # [9, 8, 7, 5, 4, 3, 2, 1]

# Fancy indexing
print(data[[0, 3, 6]])         # [3, 9, 8]
```

## Opérations matricielles

```python
A = np.random.randn(3, 4)
B = np.random.randn(4, 2)

# Multiplication matricielle
C = A @ B                     # (3, 2) — équiv. np.dot(A, B)

# Transposée
print(A.T.shape)              # (4, 3)

# Inverse (pour régression linéaire manuelle)
M = np.array([[1, 2], [3, 4]])
print(np.linalg.inv(M))
```

## Application : imputation par médiane

```python
data = np.array([1.0, 2.0, np.nan, 4.0, np.nan, 6.0])
mediane = np.nanmedian(data)
data_clean = np.where(np.isnan(data), mediane, data)
# [1.0, 2.0, 3.0, 4.0, 3.0, 6.0]
```
"""},
            {"title": "Du NumPy à Pandas — les bonnes pratiques", "order": 4, "duration_minutes": 25, "is_premium": True, "content": """# Du NumPy à Pandas — les bonnes pratiques

## Quand utiliser quoi ?

| Tâche | NumPy | Pandas |
|-------|-------|--------|
| Matrices de features ML | ✅ | |
| Calculs vectorisés purs | ✅ | |
| DataFrames avec labels | | ✅ |
| Nettoyage de données | | ✅ |
| Merge / GroupBy | | ✅ |

## Conversion

```python
import pandas as pd
import numpy as np

# NumPy → Pandas
arr = np.random.randn(100, 3)
df = pd.DataFrame(arr, columns=['A', 'B', 'C'])

# Pandas → NumPy (pour sklearn)
X = df.values          # numpy array
X = df.to_numpy()      # équivalent, plus explicite
```

## Workflow complet

```python
# 1. Chargement
df = pd.read_csv("data.csv")

# 2. Exploration + nettoyage (Pandas)
df = df.dropna().drop_duplicates()
df["feature_eng"] = df["col1"] * df["col2"]

# 3. Préparation ML (vers NumPy / sklearn)
X = df.drop("target", axis=1).to_numpy()
y = df["target"].to_numpy()

# 4. Normalisation (NumPy/sklearn)
from sklearn.preprocessing import StandardScaler
X_scaled = StandardScaler().fit_transform(X)
```

## Bonnes pratiques

1. **Reproductibilité** : toujours `np.random.seed(42)` + `random_state=42`
2. **Copie vs vue** : `df.copy()` pour éviter les modifications inattendues
3. **Dtype** : vérifie que les colonnes numériques ne sont pas en `object`
4. **Memory** : utilise `float32` au lieu de `float64` pour les grands datasets ML
5. **Leak** : ne jamais `fit` un scaler sur le test set

## 💡 Challenge final

Combine tout avec **"Nettoyage d'un dataset clients"** !
"""},
        ],
    },
    {
        "slug": "python-pandas-debutant",
        "title": "Python & Pandas pour la Data",
        "description": "Manipule, transforme et analyse des données avec Python et Pandas.",
        "category": CourseCategory.DATA_ENGINEERING,
        "level": "beginner",
        "order": 3,
        "lessons": [
            {"title": "Introduction à Pandas", "order": 0, "duration_minutes": 15, "content": """# Introduction à Pandas

## Les structures de base

### Series — une colonne
```python
import pandas as pd
s = pd.Series([10, 20, 30], index=['a', 'b', 'c'])
```

### DataFrame — un tableau
```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 22],
    'salary': [50000, 65000, 42000]
})
```

## Lecture de données

```python
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
df = pd.read_json('data.json')
```

## Exploration

```python
df.shape          # (rows, cols)
df.dtypes         # types de colonnes
df.describe()     # statistiques
df.isnull().sum() # valeurs manquantes
df.head(10)       # 10 premières lignes
```

## Sélection

```python
df['name']                         # colonne
df[['name', 'age']]               # plusieurs colonnes
df.iloc[0:5]                      # lignes 0-4
df[df['age'] > 25]                # filtrage
```

## 💡 Challenge

Pratique avec **"Nettoyage de données avec Pandas"** !
"""},
            {"title": "Nettoyage de données", "order": 1, "duration_minutes": 20, "content": """# Nettoyage de données

## Valeurs manquantes

```python
df.isnull().sum()                  # détecter
df.dropna()                        # supprimer
df.dropna(subset=['age'])          # sur une colonne
df['age'].fillna(df['age'].mean()) # remplir
```

## Doublons

```python
df.duplicated().sum()
df.drop_duplicates()
```

## Types

```python
df['age'] = df['age'].astype(int)
df['date'] = pd.to_datetime(df['date'])
```

## Texte

```python
df['name'] = df['name'].str.strip().str.title()
```

## Pipeline type

```python
def clean(df):
    df = df.copy()
    df.columns = df.columns.str.lower()
    df = df.drop_duplicates()
    df = df.dropna(subset=['id'])
    return df
```
"""},
            {"title": "GroupBy et Agrégations", "order": 2, "duration_minutes": 20, "content": """# GroupBy et Agrégations

## GroupBy basique

```python
# Salaire moyen par département
df.groupby('department')['salary'].mean()

# Plusieurs statistiques
df.groupby('department')['salary'].agg(['mean', 'min', 'max', 'count'])
```

## agg() — agrégations personnalisées

```python
result = df.groupby('department').agg(
    avg_salary=('salary', 'mean'),
    headcount=('name', 'count')
)
```

## Pivot Table

```python
pd.pivot_table(df, values='salary', index='department', aggfunc='mean')
```

## Exemples

```python
# Top 3 par salaire moyen
df.groupby('department')['salary'].mean()\\
  .sort_values(ascending=False).head(3)
```

## 💡 Challenge

Pratique avec **"GroupBy et Agrégation Pandas"** !
"""},
        ],
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        print("🌱 Seeding badges...")
        for badge_data in BADGES:
            existing = await db.execute(select(Badge).where(Badge.name == badge_data["name"]))
            if existing.scalar_one_or_none() is None:
                db.add(Badge(id=uuid.uuid4(), **badge_data))
        await db.commit()
        print(f"  ✅ {len(BADGES)} badges")

        print("🌱 Seeding challenges...")
        inserted = 0
        updated = 0
        for ch_data in CHALLENGES:
            existing_res = await db.execute(select(Challenge).where(Challenge.slug == ch_data["slug"]))
            existing_challenge = existing_res.scalar_one_or_none()

            tc_data_list = ch_data.pop("test_cases", [])
            ch_data.pop("tags", []) if existing_challenge else None

            if existing_challenge is not None:
                # Update test cases only
                tags_saved = ch_data.pop("tags", []) if "tags" in ch_data else []
                await db.execute(delete(ChallengeTestCase).where(ChallengeTestCase.challenge_id == existing_challenge.id))
                for tc in tc_data_list:
                    db.add(ChallengeTestCase(id=uuid.uuid4(), challenge_id=existing_challenge.id, **tc))
                await db.commit()
                updated += 1
                continue

            tags = ch_data.pop("tags", [])
            challenge = Challenge(id=uuid.uuid4(), is_published=True, **ch_data)
            db.add(challenge)
            await db.flush()
            for tag_name in tags:
                db.add(ChallengeTag(id=uuid.uuid4(), challenge_id=challenge.id, name=tag_name))
            for tc in tc_data_list:
                db.add(ChallengeTestCase(id=uuid.uuid4(), challenge_id=challenge.id, **tc))
            inserted += 1

        await db.commit()
        print(f"  ✅ {inserted} insérés, {updated} mis à jour")

        print("🌱 Seeding courses...")
        course_count = 0
        for course_data in COURSES:
            existing = await db.execute(select(Course).where(Course.slug == course_data["slug"]))
            if existing.scalar_one_or_none() is not None:
                continue
            lessons_data = course_data.pop("lessons", [])
            course = Course(id=uuid.uuid4(), is_published=True, **course_data)
            db.add(course)
            await db.flush()
            for lesson_d in lessons_data:
                db.add(Lesson(id=uuid.uuid4(), course_id=course.id, **lesson_d))
            course_count += 1

        await db.commit()
        print(f"  ✅ {course_count} cours insérés")
        print("🎉 Seed terminé !")


if __name__ == "__main__":
    asyncio.run(seed())
