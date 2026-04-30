# Architecture Notes

## Principles

- Session timing is derived from absolute timestamps, not decrementing counters.
- UI reads a computed snapshot and should not own timing logic.
- Voice playback reacts to session snapshots and scheduled events.
- Persisted state stores only the minimum needed to reconstruct a session.

## Feature layout

```text
src/
  app/
    navigation/
    providers/
    store/
  features/
    routines/
      components/
      screens/
      storage/
    session/
      engine/
      hooks/
      screens/
      store/
    voice/
      engine/
      hooks/
      screens/
      store/
    settings/
      screens/
      store/
  shared/
    components/
    constants/
    hooks/
    utils/
```

## Session flow

1. Convert a routine into a linear phase list.
2. Start a session with `startedAt`.
3. Compute the current phase from `now - startedAt - pausedDuration`.
4. Emit a `SessionSnapshot` for UI and audio consumers.
5. Persist enough state to restore after background transitions.

## Recovery policy

- Background: continue session and recalculate on resume.
- Process alive: restore from persisted session state.
- Force quit: treat in-progress session as ended for MVP.
