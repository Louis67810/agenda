# Architecture — Application d'Organisation Personnelle

> Document de conception complet. Rédigé avant tout développement.

---

## 1. Stack Technique

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI + Server Components |
| Styling | Tailwind CSS + shadcn/ui | Design system |
| Backend | Next.js API Routes | Logique métier |
| Base de données | Supabase (PostgreSQL) | Données persistantes |
| Auth | Supabase Auth | Connexion / sessions |
| Temps réel | Supabase Realtime | Agenda live |
| Déploiement | Vercel | Hosting + CI/CD |
| Intégration 1 | Google Calendar API | Import créneaux Google |
| Intégration 2 | École Directe (API non officielle) | Import emploi du temps |

---

## 2. Structure des Menus

```
/ (Dashboard — vue d'ensemble du jour)
├── /agenda                  → Calendrier hebdo/mensuel avec tâches planifiées
├── /taches
│   ├── /taches              → Vue globale de toutes les tâches
│   ├── /taches/objectifs    → Tâches liées à des objectifs (arbre Objectif > Catégorie > Sous-cat > Tâche)
│   └── /taches/todo         → Todos simples sans objectif
├── /objectifs               → Gestion des objectifs, progression
├── /habitudes               → Suivi des habitudes + streaks
├── /performances            → Statistiques, graphiques, score global
├── /recap                   → Récap de fin de journée (formulaire obligatoire)
├── /parametres
│   ├── /parametres/compte   → Profil utilisateur
│   ├── /parametres/points   → Configuration du système de points
│   ├── /parametres/integrations → Google Calendar, École Directe
│   └── /parametres/habitudes → Configuration des habitudes
└── /login                   → Authentification
```

---

## 3. Structure de la Base de Données (Supabase / PostgreSQL)

### Table `users`
```sql
id              uuid PRIMARY KEY (auth.users)
email           text
full_name       text
avatar_url      text
points_total    integer DEFAULT 0
created_at      timestamptz
-- Config points (configurable par l'utilisateur)
points_task_base        integer DEFAULT 10   -- points par étoile d'importance
points_habit_base       integer DEFAULT 5
penalty_task_missed     integer DEFAULT 15
penalty_duration_unjustified integer DEFAULT 8
bonus_objective_multiplier float DEFAULT 1.5
```

### Table `blocked_slots`
> Créneaux indisponibles (cours, sport, récurrents, Google Calendar)
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users
title       text                    -- "Cours Maths", "Sport"
source      text                    -- 'manual' | 'google_calendar' | 'ecole_directe' | 'recurring'
start_time  timestamptz
end_time    timestamptz
is_recurring boolean DEFAULT false
recurrence_rule text               -- format iCal RRULE ex: "FREQ=WEEKLY;BYDAY=MO"
external_id text                   -- ID Google Calendar si importé
```

### Table `objectives`
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users
title       text
description text
importance  integer CHECK (importance BETWEEN 1 AND 5)
color       text                    -- couleur hex pour le UI
deadline    date
status      text DEFAULT 'active'   -- 'active' | 'completed' | 'archived'
created_at  timestamptz
```

### Table `categories`
```sql
id              uuid PRIMARY KEY
objective_id    uuid REFERENCES objectives ON DELETE CASCADE
title           text
position        integer             -- ordre d'affichage
```

### Table `subcategories`
```sql
id              uuid PRIMARY KEY
category_id     uuid REFERENCES categories ON DELETE CASCADE
title           text
position        integer
```

### Table `tasks`
```sql
id                  uuid PRIMARY KEY
user_id             uuid REFERENCES users
subcategory_id      uuid REFERENCES subcategories ON DELETE SET NULL  -- NULL si todo simple
objective_id        uuid                                               -- dénormalisé pour perf
title               text
description         text
estimated_duration  integer             -- en minutes
actual_duration     integer             -- mis à jour en fin de tâche
importance          integer CHECK (importance BETWEEN 1 AND 5)
deadline            timestamptz
status              text DEFAULT 'todo' -- 'todo' | 'in_progress' | 'done' | 'missed'
points_value        integer             -- calculé à la création : importance × points_task_base
is_simple_todo      boolean DEFAULT false
scheduled_start     timestamptz         -- planifié par l'algo
scheduled_end       timestamptz
created_at          timestamptz
completed_at        timestamptz
```

### Table `task_duration_adjustments`
> Quand l'utilisateur augmente la durée d'une tâche en cours
```sql
id          uuid PRIMARY KEY
task_id     uuid REFERENCES tasks ON DELETE CASCADE
user_id     uuid REFERENCES users
added_minutes integer
justification text
verdict     text                -- 'justified' | 'unjustified' | 'pending'
created_at  timestamptz
```

### Table `habits`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
title           text            -- "Marcher 10 000 pas"
description     text
icon            text            -- emoji ou nom d'icône
frequency       text            -- 'daily' | 'weekly' | json pour jours spécifiques
target_value    float           -- optionnel (ex: 10000 pour les pas)
unit            text            -- optionnel (ex: "pas", "pages")
points_value    integer         -- points gagnés si accomplie
is_active       boolean DEFAULT true
created_at      timestamptz
```

### Table `habit_logs`
> Une entrée par habitude par jour
```sql
id          uuid PRIMARY KEY
habit_id    uuid REFERENCES habits ON DELETE CASCADE
user_id     uuid REFERENCES users
log_date    date
done        boolean DEFAULT false
value       float               -- valeur réelle (ex: 8500 pas)
note        text
created_at  timestamptz
UNIQUE(habit_id, log_date)
```

### Table `day_recap`
> Récap obligatoire de fin de journée
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
recap_date      date
day_score       integer CHECK (day_score BETWEEN 1 AND 10)
mood            text            -- 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
mood_note       text            -- texte libre
tasks_reviewed  boolean DEFAULT false
habits_reviewed boolean DEFAULT false
submitted_at    timestamptz
UNIQUE(user_id, recap_date)
```

### Table `points_log`
> Historique de chaque gain/perte de points
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users
amount      integer             -- positif ou négatif
reason      text                -- 'task_done' | 'habit_done' | 'task_missed' | 'penalty_duration' | 'objective_bonus'
reference_id uuid               -- ID de la tâche / habitude concernée
reference_type text             -- 'task' | 'habit' | 'objective'
created_at  timestamptz
```

---

## 4. Logique de Planification Automatique

### Principe général
L'algorithme tourne à chaque fois que :
- Une nouvelle tâche est créée ou modifiée
- Un créneau bloqué est ajouté/modifié
- Un import Google Calendar / École Directe est effectué

### Algorithme (pseudo-code)

```
function planifyTasks(userId):
  1. Récupérer tous les blocked_slots des 30 prochains jours
  2. Calculer les plages libres (free_slots) en soustrayant les blocked_slots
     → Respecter aussi les heures de nuit (ex: 22h–8h non planifiables)
     → Configurable dans les paramètres (heures de travail)
  3. Récupérer toutes les tâches status='todo' ou 'in_progress'
  4. Calculer le score de priorité pour chaque tâche :
       score = (importance × 3) + urgency_bonus(deadline) + (1 / estimated_duration)
       urgency_bonus = si deadline dans 24h → +10 | 48h → +6 | 7j → +2 | sinon 0
  5. Trier les tâches par score décroissant
  6. Pour chaque tâche :
       a. Trouver le premier free_slot avec durée >= estimated_duration
       b. Assigner scheduled_start / scheduled_end
       c. Retirer cette plage du free_slots disponibles
  7. Sauvegarder les nouvelles valeurs scheduled_start/end
  8. Notifier l'utilisateur si des tâches n'ont pas pu être planifiées
```

### Règles additionnelles
- Une tâche avec deadline passée reste visible mais marquée "en retard"
- Les tâches `in_progress` gardent leur créneau actuel (pas re-planifiées)
- L'utilisateur peut forcer un créneau manuellement (drag & drop sur l'agenda)
- Si créneau forcé manuellement → flag `manually_scheduled = true` → pas touché par l'algo

---

## 5. Système de Points

### Gains
| Action | Points |
|---|---|
| Tâche terminée | `importance × points_task_base` (défaut : importance × 10) |
| Habitude accomplie | `habit.points_value` (configurable par habitude) |
| Objectif complété (100%) | Somme des points des tâches × `bonus_objective_multiplier` |
| Note de journée ≥ 8 | +5 points bonus |

### Pertes (pénalités)
| Action | Points perdus |
|---|---|
| Tâche marquée "missed" | `penalty_task_missed` (défaut : 15) |
| Augmentation durée non justifiée | `penalty_duration_unjustified` (défaut : 8) |
| Récap de journée non soumis | -5 points le lendemain matin |

### Configuration utilisateur
Tous les multiplicateurs sont configurables dans `/parametres/points` :
- Points de base par tâche (par étoile d'importance)
- Points de base par habitude
- Pénalités (tâche ratée, durée injustifiée)
- Bonus objectif complété

---

## 6. Récap de Fin de Journée

### Déclenchement
- Notification à 21h (configurable)
- Badge rouge sur l'icône "Récap" si non soumis
- Si non soumis à minuit → pénalité automatique de -5 points

### Formulaire (étapes)

**Étape 1 — Tâches du jour**
- Liste de toutes les tâches planifiées ce jour
- Pour chaque tâche : "Terminée ✓" / "Non terminée ✗" / "Reportée →"
- Pour chaque tâche avec augmentation de durée : champ "justification" + verdict (oui/non)

**Étape 2 — Habitudes**
- Checklist de toutes les habitudes actives du jour
- Pour les habitudes avec valeur cible : champ numérique (ex: "8 500 pas")

**Étape 3 — Bilan de journée**
- Note globale de la journée : slider 1–10
- Ressenti : choix parmi 5 humeurs + note libre optionnelle

**Étape 4 — Résumé des points**
- Affichage récapitulatif : points gagnés / perdus aujourd'hui
- Nouveau total

---

## 7. Statistiques & Graphiques (/performances)

### Vue globale
- Score total (grand chiffre en évidence)
- Progression sur 7 jours / 30 jours / tout le temps
- Taux de complétion des tâches (%)
- Taux de complétion des habitudes (%)

### Graphiques
| Graphique | Type | Description |
|---|---|---|
| Score global | Ligne | Évolution du score total dans le temps |
| Tâches terminées | Barres | Nb tâches terminées par semaine |
| Habitudes | Multi-lignes | Taux de complétion par habitude |
| Streak habitudes | Jauge / nombre | Nombre de jours consécutifs |
| Calendrier mood | Heatmap | Couleur par note de journée (vert = 10, rouge = 1) |
| Progression objectifs | Barres horizontales | % tâches terminées par objectif |
| Répartition temps | Donut | Temps passé par catégorie d'objectif |

---

## 8. Connexion Google Calendar

### Flow d'authentification
1. Utilisateur clique "Connecter Google Calendar" dans `/parametres/integrations`
2. Redirect vers Google OAuth (scope : `https://www.googleapis.com/auth/calendar.readonly`)
3. Callback → Supabase stocke le `access_token` et `refresh_token` dans la table `user_integrations`
4. Import initial : récupération des événements des 30 prochains jours
5. Sync automatique : webhook Google Calendar OU polling toutes les heures via Vercel Cron

### Table `user_integrations`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
provider        text        -- 'google_calendar' | 'ecole_directe'
access_token    text        -- chiffré
refresh_token   text        -- chiffré
token_expiry    timestamptz
metadata        jsonb       -- calendars sélectionnés, etc.
last_synced_at  timestamptz
```

### Mapping Google Calendar → blocked_slots
- Chaque événement Google importé → une entrée dans `blocked_slots` avec `source = 'google_calendar'` et `external_id = event.id`
- Mise à jour : si `external_id` existe déjà → UPDATE, sinon INSERT
- Suppression d'un événement Google → DELETE dans `blocked_slots`

---

## 9. Parcours Utilisateur Complet

### Première utilisation
```
1. Inscription (email ou Google)
2. Onboarding (5 étapes) :
   a. Nom + photo
   b. Connecter Google Calendar (optionnel)
   c. Créer son premier objectif
   d. Créer ses premières habitudes
   e. Configurer ses heures de travail disponibles
3. Redirection vers le Dashboard
```

### Usage quotidien
```
Matin :
  → Dashboard : voir les tâches planifiées du jour + habitudes à faire
  → Agenda : visualiser la journée

Journée :
  → Marquer les tâches "en cours" quand on commence
  → Augmenter la durée si nécessaire (avec justification)
  → Marquer les tâches "terminées"
  → Cocher les habitudes au fil de la journée

Soir (21h) :
  → Notification de récap
  → Remplir le formulaire de récap (tâches + habitudes + note + humeur)
  → Voir les points gagnés / perdus
```

---

## 10. Logique Globale entre les Entités

```
Objectif
  └── Catégories (Design, Développement...)
        └── Sous-catégories (Hero Section, SEO...)
              └── Tâches (Créer le design, Écrire le texte...)
                    └── Planification automatique dans l'Agenda
                          └── Récap de journée → Points → Performances

Habitudes ────────────────────────────────┘ Récap → Points → Performances

Blocked Slots (Google Cal + École Directe + Récurrents)
  └── Contraintes pour l'algorithme de planification

Points Log
  └── Historique de tout → Graphiques Performances
```

---

## 11. Idées d'Amélioration

### Court terme
- **Mode Focus** : Timer Pomodoro intégré directement à une tâche (25min travail / 5min pause)
- **Drag & drop** sur l'agenda pour repositionner manuellement les tâches
- **Tâches récurrentes** : ex. "Réviser les maths chaque dimanche"
- **Tags** sur les tâches pour filtrer rapidement

### Moyen terme
- **Notifications push** : rappel tâche imminente, récap du soir, deadline approche
- **IA de re-planification** : si retard détecté, propose automatiquement de re-planifier
- **Mode semaine chargée** : réduit automatiquement les habitudes non critiques
- **Export PDF** : rapport hebdomadaire avec stats et progression

### Long terme
- **Système de badges** : "7 jours streak", "Premier objectif complété", "100 tâches faites"
- **Partage d'objectifs** : accountability partner peut voir ta progression
- **Intégration Notion** : sync bidirectionnel avec des bases Notion
- **Application mobile** (React Native) avec les mêmes données Supabase

---

## 12. Structure de Dossiers du Projet

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  (Dashboard)
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── agenda/
│   │   └── page.tsx
│   ├── taches/
│   │   ├── page.tsx
│   │   ├── objectifs/page.tsx
│   │   └── todo/page.tsx
│   ├── objectifs/
│   │   └── page.tsx
│   ├── habitudes/
│   │   └── page.tsx
│   ├── performances/
│   │   └── page.tsx
│   ├── recap/
│   │   └── page.tsx
│   ├── parametres/
│   │   ├── page.tsx
│   │   ├── compte/page.tsx
│   │   ├── points/page.tsx
│   │   └── integrations/page.tsx
│   └── api/
│       ├── auth/callback/route.ts
│       ├── tasks/route.ts
│       ├── habits/route.ts
│       ├── recap/route.ts
│       ├── planify/route.ts       (algo de planification)
│       ├── google/sync/route.ts
│       └── points/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── agenda/
│   ├── tasks/
│   ├── habits/
│   ├── recap/
│   └── ui/                       (shadcn/ui components)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── planifier.ts              (algorithme de planification)
│   ├── points.ts                 (calcul des points)
│   └── types.ts                  (TypeScript types)
├── middleware.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```
