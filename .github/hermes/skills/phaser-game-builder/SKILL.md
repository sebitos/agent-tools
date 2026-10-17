---
name: phaser-game-builder
description: |
  Phaser 3 game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging a Phaser 3 web game
  - Writing or reviewing TypeScript or JavaScript Phaser 3 code
  - Working with Phaser Scenes, GameObjects, Groups, and Tilemaps
  - Implementing physics with Phaser Arcade Physics or Matter.js
  - Using Phaser's asset loader (images, spritesheets, atlases, tilemaps, audio)
  - Implementing animations with the Phaser Animation Manager
  - Managing game state with the Scene Manager (start, stop, pause, resume, overlap)
  - Optimising Phaser performance (texture atlases, object pooling, camera culling)
  - Deploying a Phaser game to the web or wrapping it with Electron/Capacitor
  - Any task where the codebase imports from 'phaser' or contains Phaser.Game config
---

# Phaser Game Builder

Best practices and patterns for building games with Phaser 3 in TypeScript.

---

## Game Bootstrap

```typescript
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene }    from './scenes/GameScene';
import { UIScene }      from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,          // WebGL if available, fallback Canvas
    width: 1280,
    height: 720,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [PreloadScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

export default new Phaser.Game(config);
```

---

## Scene Lifecycle

Every Phaser Scene has a predictable lifecycle:

```
init(data?)   → preload()  → create()  → update(time, delta)
                                       → [pause / resume / sleep / wake]
                                       → shutdown()  → destroy()
```

| Method | Use for |
|--------|---------|
| `init(data)` | Receive data from previous scene; reset scene state |
| `preload()` | Queue assets for loading — runs before create |
| `create()` | Build the scene — create GameObjects, add physics, set up events |
| `update(time, delta)` | Per-frame logic — input, movement, AI |
| `shutdown()` | Remove event listeners; stop timers |

```typescript
export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        this.player  = this.physics.add.sprite(100, 400, 'player');
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.player.setCollideWorldBounds(true);
    }

    update(_time: number, _delta: number): void {
        this.handleInput();
    }

    private handleInput(): void {
        this.player.setVelocityX(0);

        if (this.cursors.left.isDown)       this.player.setVelocityX(-200);
        else if (this.cursors.right.isDown) this.player.setVelocityX(200);

        if (this.cursors.up.isDown && this.player.body!.blocked.down) {
            this.player.setVelocityY(-500);
        }
    }
}
```

---

## Asset Loading (PreloadScene)

Always load all assets in a dedicated PreloadScene:

```typescript
export class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'PreloadScene' }); }

    preload(): void {
        // Progress bar
        const bar = this.add.graphics();
        this.load.on('progress', (value: number) => {
            bar.clear()
               .fillStyle(0xffffff)
               .fillRect(100, 360, 1080 * value, 20);
        });

        // Sprites and atlases
        this.load.image('bg', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 48, frameHeight: 64
        });
        this.load.atlas('items', 'assets/items.png', 'assets/items.json');

        // Tilemaps
        this.load.tilemapTiledJSON('level1', 'assets/levels/level1.json');
        this.load.image('tiles', 'assets/tileset.png');

        // Audio
        this.load.audio('jump', 'assets/audio/jump.ogg');
        this.load.audio('music', 'assets/audio/theme.ogg');
    }

    create(): void {
        this.scene.start('GameScene');
    }
}
```

**Rules**:
- Use **texture atlases** instead of individual images — one GPU draw call per atlas
- Load audio as `.ogg` + `.mp3` fallback for cross-browser support
- Never call `this.load.*` in `create()` or `update()` — only in `preload()`

---

## Animations

```typescript
// Define in create() or in a dedicated AnimationManager service:
this.anims.create({
    key:       'player-run',
    frames:    this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
    frameRate: 12,
    repeat:    -1
});

this.anims.create({
    key:    'player-jump',
    frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
    frameRate: 10,
    repeat: 0
});

// Play:
this.player.anims.play('player-run', true); // true = ignore if already playing
```

---

## Arcade Physics

```typescript
// Static group (immovable — platforms, walls):
const platforms = this.physics.add.staticGroup();
platforms.create(400, 568, 'ground').refreshBody();

// Dynamic group (enemies):
const enemies = this.physics.add.group({
    classType: Enemy,
    runChildUpdate: true  // calls enemy.update() each frame
});

// Collider (stops overlap):
this.physics.add.collider(this.player, platforms);

// Overlap (trigger without stopping):
this.physics.add.overlap(
    this.player,
    this.coins,
    (_player, coin) => {
        (coin as Phaser.GameObjects.GameObject).destroy();
        this.score += 10;
    }
);
```

---

## Tilemaps

```typescript
create(): void {
    const map     = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('tileset', 'tiles')!;

    const ground  = map.createLayer('Ground', tileset, 0, 0)!;
    const hazards = map.createLayer('Hazards', tileset, 0, 0)!;

    // Enable collision for tiles with the 'collides' property set in Tiled:
    ground.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player, ground);

    // Object layers (spawn points from Tiled):
    map.getObjectLayer('Spawns')!.objects.forEach(obj => {
        if (obj.name === 'PlayerStart') {
            this.player.setPosition(obj.x!, obj.y!);
        }
    });
}
```

---

## Scene Management

```typescript
// Launch a UI scene overlaid on top of the game scene:
this.scene.launch('UIScene', { score: this.score });

// Pause/resume (update stops, render continues):
this.scene.pause('GameScene');
this.scene.resume('GameScene');

// Pass data between scenes:
this.scene.start('GameOverScene', { finalScore: this.score });

// In GameOverScene.init():
init(data: { finalScore: number }): void {
    this.finalScore = data.finalScore;
}
```

---

## Object Pooling (Groups)

```typescript
// Create pool in create():
this.bulletPool = this.physics.add.group({
    classType: Bullet,
    maxSize:   30,
    runChildUpdate: true
});

// Spawn from pool:
private shoot(): void {
    const bullet = this.bulletPool.get(
        this.player.x,
        this.player.y,
        'bullet'
    ) as Bullet | null;

    if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.fire(this.player.x, this.player.y);
    }
}

// In Bullet.update(): deactivate when off screen
update(): void {
    if (this.y < -50) {
        this.setActive(false).setVisible(false);
    }
}
```

---

## Performance Rules

| Rule | Reason |
|------|--------|
| Use texture atlases (`.json` + `.png`) | One draw call per atlas vs one per image |
| Use `Group` / `StaticGroup` over individual sprites | Batch-rendered by the renderer |
| Camera bounds — `camera.setBounds()` | Prevents rendering off-screen tiles |
| Use `setActive(false).setVisible(false)` for pooling | Avoids destroy/recreate GC pressure |
| Avoid `Phaser.Math` allocations in `update()` | Reuse `Vector2` objects; don't `new` inside loops |
| Use `this.time.addEvent()` for timers | Clean up automatically on scene shutdown |

---

## Deployment Checklist

- [ ] Set `debug: false` in Arcade physics config
- [ ] Enable `Phaser.AUTO` renderer (WebGL with Canvas fallback)
- [ ] Configure `Phaser.Scale.FIT` + `CENTER_BOTH` for responsive layout
- [ ] Bundle with Vite or webpack — configure chunk splitting for large asset sets
- [ ] Host assets on CDN; Phaser loads assets via XHR (requires HTTPS in production)
- [ ] Test on both desktop and mobile browsers
- [ ] Add touch input via `this.input.addPointer()` for mobile support
- [ ] Test audio — browsers require user interaction before playing audio
