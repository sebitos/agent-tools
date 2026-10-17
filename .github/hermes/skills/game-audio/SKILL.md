---
name: game-audio
description: |
  Game audio design, implementation, and integration guidance. Use this skill when:
  - Designing a game's audio architecture (music system, SFX, VO pipeline)
  - Implementing adaptive or dynamic music systems
  - Designing and implementing spatial audio and 3D sound
  - Creating audio feedback for game mechanics (hit sounds, UI sounds, ambient audio)
  - Implementing audio using FMOD, Wwise, or engine-native audio
  - Writing bark systems and dialogue playback logic
  - Designing audio feedback loops for game feel (juice)
  - Planning audio mix priorities and ducking rules
  - Implementing audio pooling and performance optimizations
  - Reviewing or critiquing a game's audio experience
---

# Game Audio Design

Patterns and implementation guidance for creating immersive, purposeful game audio.

---

## Core Principle: Audio is Feedback

> Every sound should tell the player something they need to know or feel.

Audio serves three functions:
1. **Information** — communicates game state (health low, enemy nearby, reload needed)
2. **Reinforcement** — validates player actions (hit confirmed, item collected, door opened)
3. **Atmosphere** — establishes world, tone, and emotional context

**Rule**: A missing sound is a missing response. Players feel audio absence as broken feedback.

---

## Audio Architecture

### The Four Audio Layers

```
Layer 1: Music         — Emotional tone, pacing, tension/relief arc
Layer 2: Ambience      — World texture, environmental presence
Layer 3: SFX           — Action feedback, gameplay events
Layer 4: Voice / Barks — Characters, narrative, context
```

**Priority order for mixing**: Voice > SFX > Ambience > Music  
When tracks compete, duck lower layers to preserve intelligibility.

### Adaptive Music System

Reactive music changes based on game state:

```
States:
  Exploration  → low-tension ambient music
  Alert        → tension stinger + heightened underscore
  Combat       → full battle track
  Victory      → resolution sting + return to exploration
  Death        → silence or minor chord sting
```

```csharp
// Engine-agnostic pattern for adaptive music
public enum MusicState { Exploration, Alert, Combat, Victory, Death }

public class AdaptiveMusicController {
    private MusicState _current = MusicState.Exploration;
    
    public void TransitionTo(MusicState newState) {
        if (_current == newState) return;
        _current = newState;
        audioSystem.CrossfadeTo(GetTrack(newState), fadeDuration: 1.5f);
    }
}
```

**Implementation options**:
- **Crossfade** — fade out old track, fade in new (simple; audible seam)
- **Vertical layering** — mute/unmute instrument layers on the same track (seamless)
- **Horizontal re-sequencing** — jump to a different section of the same piece at a transition point (musical; complex to implement)
- **FMOD/Wwise** — use a dedicated audio middleware for all of the above

---

## Game Feel Audio (Juice)

Every core action needs an audio signature:

| Action | Primary SFX | Secondary | Music Response |
|--------|-------------|-----------|----------------|
| Attack | Impact/swing | Hit confirmation or miss | Combat layer activates |
| Take damage | Pain grunt + impact | Low health tone if critical | Tension stinger |
| Kill enemy | Death SFX + body drop | Optional kill-count chime | — |
| Collect item | Pickup chime | Optional rarity-scaled pitch | — |
| Level up | Fanfare sting | UI chime | Brief pause of combat music |
| Die | Death sound + silence | Somber chord | Music stops |

### Pitch Variation

Avoid robotic repetition — randomise pitch slightly on every repeated sound:

```csharp
// Randomise pitch ±10% to prevent repetition fatigue
audioSource.pitch = Random.Range(0.9f, 1.1f);
audioSource.PlayOneShot(clip);
```

### Layered Impact Sounds

Important hits should have multiple layers playing simultaneously:
1. **Attack layer** — the physical strike (sword, gunshot)
2. **Body layer** — flesh/armour impact
3. **Reaction layer** — enemy vocal (pain grunt, death cry)

---

## Spatial Audio

### 3D Sound Implementation

```csharp
// Unity example — position a sound in 3D space
AudioSource audioSource;
audioSource.spatialBlend = 1.0f;  // 0 = 2D, 1 = 3D
audioSource.minDistance = 5f;     // Full volume within this radius
audioSource.maxDistance = 50f;    // Inaudible beyond this radius
audioSource.rolloffMode = AudioRolloffMode.Logarithmic;  // Natural falloff
```

### Sound Occlusion

Muffle sounds when walls are between source and listener:

```csharp
// Pseudocode — raycast-based occlusion
bool hasLineOfSight = Physics.Raycast(listenerPos, sourcePos);
float lowPassCutoff = hasLineOfSight ? 22000f : 800f;  // Muffle when occluded
audioSource.SetLowPassFilter(lowPassCutoff);
```

### Directional Audio Rules

- Footsteps, enemy barks, and environmental hazards **must** be spatialized in 3D games
- Music and UI audio should be **non-spatialized** (2D)
- Dialogue can be 2D unless character is far away (then blend toward 3D)

---

## Bark System (Dialogue)

Barks are short, context-triggered character lines.

### Bark Data Structure

```yaml
bark_group: enemy_spotted_player
speaker: palace_guard
lines:
  - "Intruder! Sound the alarm!"
  - "There! Don't let them escape!"
  - "Hey — you're not supposed to be here!"
  - "Guards! We have a breach!"
  - "Stop right there!"
priority: 2          # Higher number = higher priority in the mix
cooldown_seconds: 8  # Minimum time before this bark plays again
max_plays_per_session: 3  # Prevent repetition exhaustion
interrupt_lower_priority: true
```

### Bark Priority System

```
Priority 1 (lowest):  Ambient flavour barks ("nice weather today...")
Priority 2:           Tactical barks (spotted, lost player, etc.)
Priority 3:           Combat barks (attacking, hurt, dying)
Priority 4 (highest): Critical story barks (scripted, non-interruptible)
```

### Bark Implementation Rules

- A speaker should never interrupt themselves
- Two characters should not bark the same line within 5 seconds
- Critical story barks should duck all lower-priority barks
- Voice lines should be accompanied by an appropriate animation trigger

---

## Audio Performance

### Audio Pooling

Reuse audio sources instead of creating/destroying them:

```csharp
// Pseudocode audio pool
public class AudioPool {
    private Queue<AudioSource> _pool = new();
    
    public AudioSource Get() {
        return _pool.Count > 0 ? _pool.Dequeue() : CreateNew();
    }
    
    public void Return(AudioSource source) {
        source.Stop();
        _pool.Enqueue(source);
    }
}
```

### Voice Over Streaming

- **Short SFX** (< 1 second): Load into memory (PCM)
- **Medium SFX** (1–5 seconds): Load on demand; keep in cache
- **Long music / VO** (> 5 seconds): **Stream from disk** — never load full file into memory

### Audio Budget Guidelines

| Category | Simultaneous Voices | Notes |
|----------|--------------------|----|
| Music | 1–2 (crossfading) | Never more than 2 music tracks simultaneously |
| Ambience layers | 3–6 | Per zone |
| SFX | 16–32 | Engine-managed voice limit |
| VO / Barks | 1–2 per speaker | Priority system handles conflicts |

---

## Music Composition Guidelines

### Emotional Arc Mapping

Map your game's emotional arc to music states:

```
Zone 1 (tutorial): Gentle, sparse, major key, slow tempo
Zone 2 (first challenge): Adds percussion, minor elements, moderate tempo
Zone 3 (midgame): Fuller arrangement, harmonic tension, dynamic swells
Boss fight: Maximum intensity; dissonance; urgent tempo
Post-boss: Resolution; reprised themes; emotional payoff
Final area: Epic; combines all themes; full orchestration
```

### Leitmotif System

A **leitmotif** is a musical theme associated with a character, faction, or concept.

```
Hero theme:    Major key, strings, noble
Villain theme: Minor key, low brass, slow
Faction A:     Pentatonic scale, percussion-heavy
Villain twist reveal: Play hero theme in minor key → signals corruption
```

**Rule**: Reprise and transform leitmotifs at narrative turning points — the player recognises the connection before they consciously understand why.

### Looping Music Rules

- All loops must be musically clean at the **loop point** (resolve to a note that leads back to the start)
- Avoid loops shorter than **30 seconds** — players notice repetition quickly
- Add **variation layers** that activate/deactivate to extend perceived variety

---

## Audio Review Checklist

- [ ] Does every core player action have a unique audio response?
- [ ] Are repeated sounds pitch-varied to avoid robotic repetition?
- [ ] Does the music react meaningfully to combat state changes?
- [ ] Are all 3D sound sources correctly spatialized?
- [ ] Is voice/bark priority configured to prevent important lines being cut off?
- [ ] Are long audio files streamed rather than fully loaded into memory?
- [ ] Does the mix duck music/ambience when voice lines play?
- [ ] Are there at least 5 unique lines per common bark trigger?
- [ ] Does the audio tell the player what they need to know without the visual?
