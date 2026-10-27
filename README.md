# Sonance

A social app built with Expo and Supabase. Users post text, images and video, follow each other, like and comment, and get notified. AI features handle moderation, caption and tag generation, semantic search and a personalised feed.

## Features

- **Auth and profiles**: email sign-up and login, editable profile, an Instagram-style profile grid, and profiles for other users
- **Posts**: rich text, image and video posts with likes, comments, share and delete
- **Follows**: follow and unfollow users, with a Following feed
- **Feeds**: Latest, For you and Following. Your own posts never appear in them
- **Notifications**: likes, comments and follows, with an unread badge on the Alerts tab
- **Theming**: light and dark mode with a toggle on the home screen
- **Polish**: Inter font, skeleton loaders, haptics and a like animation
- **AI**: see [AI features](#ai-features)

## Tech stack

- Expo SDK 57, Expo Router (file-based routing), React Native 0.86, React 19
- Supabase: Auth, Postgres (with pgvector), Row Level Security, Realtime, Storage and Edge Functions
- Groq, Google Gemini and OpenAI for AI (all optional free tiers)

## Getting started

1. Install dependencies

    ```bash
    npm install
    ```

2. Create a `.env` file from the example and fill in your Supabase project values

    ```bash
    cp .env.example .env
    ```

    | Variable                   | Description                                     |
    | -------------------------- | ----------------------------------------------- |
    | `EXPO_PUBLIC_SUPABASE_URL` | Your project URL                                |
    | `EXPO_PUBLIC_SUPABASE_KEY` | Your project's public (anon or publishable) key |

3. Start the app

    ```bash
    npx expo start
    ```

    Then open it in an emulator, a simulator, a development build, Expo Go, or press `w` for the web.

Linting: `npm run lint`

## Project structure

```
src/
  app/                 Routes (Expo Router)
    (main)/            Signed-in screens: home, search, newPost, notifications,
                       profile, userProfile, postDetails, editProfile
    welcome, login, signUp
  components/          PostCard, ProfileView, BottomNav, Skeleton, AppText, ...
  contexts/            AuthContext, ThemeContext
  constants/           theme (light and dark palettes), fonts
  helpers/             common utilities, haptics
services/              Supabase calls: posts, users, follows, notifications, images, AI
lib/supabase.js        Supabase client
supabase/functions/ai  Edge function for moderation, captions and embeddings
```

Use `AppText` (`src/components/AppText.jsx`) instead of React Native's `Text` so the app font applies. Read colours from `useThemedStyles` or `useTheme` rather than hard-coding them, so dark mode keeps working.

## Backend setup

The database schema lives in the Supabase project, not in this repository, so a new project has to be set up by hand.

**Tables** (all have Row Level Security enabled): `users`, `posts`, `postLikes`, `comments`, `notifications`, `follows`.

- `posts` has `tags text[]` and `embedding vector(384)`
- `users` has `"tagScores" jsonb`
- `follows` has `follower_id` and `following_id`, with the pair as the primary key

**Functions and triggers**

| Name                                        | Purpose                                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `match_posts(query_embedding, match_count)` | Nearest posts by embedding, used by search                                                                      |
| `recommended_posts(uid, lim)`               | Other users' posts ranked by the viewer's tag scores                                                            |
| `following_posts(uid, lim)`                 | Posts from people the viewer follows                                                                            |
| `bump_tag_scores()`                         | Trigger `on_like_change` on `postLikes` that raises or lowers the liker's tag scores                            |
| `handle_new_user()`                         | Trigger `on_auth_user_created` on `auth.users` that creates the `users` row (id and name) when someone signs up |

**Storage**: a public bucket named `uploads`, with `postImages`, `postVideos` and `profiles` folders.

**Realtime**: `posts`, `comments` and `notifications` are in the `supabase_realtime` publication.

## AI features

All AI calls go through one edge function, `ai`, which requires a signed-in user.

| Feature           | How it works                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moderation        | Text and images are checked with OpenAI `omni-moderation-latest` before a post is saved, and comment text before it is posted. If the check fails to run, the content is allowed. |
| Captions and tags | Groq (`qwen/qwen3.8-27b`, vision) with Gemini (`gemini-3.8-flash`) as the fallback. Tags come from a fixed list of 12.                                                            |
| Semantic search   | Text is embedded with Supabase's built-in `gte-small` model and matched with pgvector.                                                                                            |
| For you feed      | Liking a post raises your score for its tags. The feed ranks other users' posts by those scores.                                                                                  |

### Deploying the edge function

Set the secrets, then deploy. JWT verification is off because the function checks the caller itself.

```bash
supabase secrets set OPENAI_API_KEY=... GROQ_API_KEY=... GEMINI_API_KEY=...
supabase functions deploy ai --no-verify-jwt
```
