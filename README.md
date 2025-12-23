# 🎯 TradeVision — *Zero-Knowledge Trading Vision Engine*

TradeVision est un moteur d'analyse de marché institutionnel de pointe, propulsé par l'IA (Gemini 3 Pro), conçu pour transformer des captures d'écran de graphiques boursiers en plans de trading exploitables basés sur les concepts **SMC (Smart Money Concepts)** et **ICT**.

## 🚀 Vision & Philosophie
L'application repose sur le principe du **"Zero-Knowledge"** :
- **Anonymat Total** : Aucune donnée utilisateur sensible n'est stockée sur un serveur centralisé.
- **Vérification Manuelle** : Le système de licence Gold privilégie la confidentialité via une validation par ID de transaction.
- **Transparence des Risques** : Un algorithme de fiabilité floute automatiquement les données jugées trop spéculatives (< 65%).

## 🧠 Moteur d'Analyse (Gemini 3 Pro)
Le coeur du système utilise le modèle `gemini-3-pro-preview` avec une configuration spécifique :
- **Thinking Budget** : 4000 tokens alloués à la réflexion structurelle avant la génération du signal.
- **Température** : 0.1 pour garantir une rigueur analytique constante et éviter les hallucinations créatives.

## 📊 Logiques de Trading Intégrées

### 1. Setup A (Agressif - Liquidity Hunt)
Cible les points de retournement exacts.
- **Concept** : Achat/Vente du "Sweep" de liquidité.
- **Objectif** : Entrer sur le niveau de Stop-Loss du retail pour bénéficier de la contrepartie institutionnelle.

### 2. Setup B (Conservateur - Breakout/Confirmation)
Privilégie la sécurité de la structure.
- **Concept** : Entrée après une cassure de structure (BOS/CHoCH).
- **Objectif** : Confirmer que la tendance a effectivement tourné avant de s'engager.

## 🛠️ Stack Technique
- **Framework** : React 19 (ESM via esm.sh)
- **Styling** : Tailwind CSS (Design System Institutionnel / Dark Mode)
- **IA** : Google GenAI SDK (@google/genai)
- **Icons** : Lucide React
- **Font** : JetBrains Mono (Code) & Inter (UI)

## 🔒 Sécurité & Protection
- **Reliability Guard** : Si l'IA détecte une structure de marché confuse (probabilité < 65%), les niveaux de prix sont masqués par un flou gaussien. L'utilisateur doit manuellement "révéler" le setup pour accepter la responsabilité du risque.
- **Invalidation Rules** : Chaque analyse fournit des critères stricts d'annulation du biais et du setup.

## 📂 Structure du Projet
- `/components` : Composants UI atomiques et dashboards.
- `/services` : Logique de communication avec l'API Gemini.
- `/constants.ts` : Prompt Engineering et instructions système.
- `/types.ts` : Définitions strictes des interfaces de données.
- `/i18n.ts` : Support multi-langue (FR/EN).

---
*Note : TradeVision est un outil d'aide à la décision. Le trading comporte des risques de perte en capital. Vérifiez toujours les signaux sur vos propres graphiques.*
