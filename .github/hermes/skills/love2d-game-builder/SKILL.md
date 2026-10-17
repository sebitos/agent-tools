---
name: love2d-game-builder
description: |
  LÖVE (Love2D) game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging a Love2D game
  - Writing or reviewing Lua code for Love2D (11.x)
  - Working with Love2D callbacks (love.load, love.update, love.draw)
  - Implementing physics with love.physics (Box2D wrapper)
  - Using love.graphics for 2D rendering (sprites, shapes, canvases)
  - Implementing audio with love.audio (sources, streaming, spatial audio)
  - Managing game state and scenes with a custom state machine
  - Working with love.filesystem for save data and asset loading
  - Optimising Love2D performance (SpriteBatches, Canvases, draw order)
  - Distributing a Love2D game as a .love file or fused executable
  - Any task where the codebase contains main.lua and conf.lua files
---

# Love2D Game Builder

Best practices and patterns for building games with LÖVE 11.x (Love2D) in Lua.

---

## Entry Points and Configuration

```lua
-- conf.lua — runs BEFORE love.load; configure the window here
function love.conf(t)
    t.identity        = "mygame"       -- save directory name
    t.version         = "11.5"
    t.window.title    = "My Game"
    t.window.width    = 1280
    t.window.height   = 720
    t.window.resizable = false
    t.window.vsync    = 1
    t.modules.joystick = true
    t.modules.physics  = true
end
```

```lua
-- main.lua — game entry point
function love.load()
    -- initialise everything here
end

function love.update(dt)
    -- per-frame logic; dt = delta time in seconds
end

function love.draw()
    -- rendering only; no logic
end

function love.keypressed(key, scancode, isrepeat)
    if key == "escape" then love.event.quit() end
end
```

**Rules**:
- All game logic goes in `love.update(dt)` — never in `love.draw()`
- `love.draw()` is called after `love.update()` in the same frame
- Always use `dt` (delta time) for movement — never hard-code per-frame values

---

## Delta Time Movement

```lua
-- BAD — frame-rate dependent:
player.x = player.x + 5

-- GOOD — frame-rate independent:
local SPEED = 200  -- pixels per second
player.x = player.x + SPEED * dt
```

---

## Scene / State Management

Love2D has no built-in scene system. Use a state table:

```lua
-- states/game.lua
local Game = {}

function Game:load()
    self.player = { x = 100, y = 300, speed = 200 }
end

function Game:update(dt)
    if love.keyboard.isDown("right") then
        self.player.x = self.player.x + self.player.speed * dt
    end
end

function Game:draw()
    love.graphics.rectangle("fill", self.player.x, self.player.y, 32, 48)
end

return Game
```

```lua
-- main.lua — scene manager
local states = {
    menu  = require("states.menu"),
    game  = require("states.game"),
    over  = require("states.gameover")
}
local current = "menu"

function love.load()
    states[current]:load()
end

function love.update(dt)
    states[current]:update(dt)
end

function love.draw()
    states[current]:draw()
end

-- Switch scene from anywhere:
function switchState(name, data)
    if states[current].unload then states[current]:unload() end
    current = name
    states[current]:load(data)
end
```

---

## Sprites and Images

```lua
function love.load()
    -- Load image once; reuse the Image object
    playerImage = love.graphics.newImage("assets/player.png")

    -- Quad for spritesheet animation
    local sw, sh = playerImage:getDimensions()
    local fw, fh = 48, 64       -- frame width and height
    frameQuads   = {}
    for row = 0, 3 do           -- 4 rows of animation
        frameQuads[row] = {}
        for col = 0, 7 do       -- 8 frames per row
            frameQuads[row][col] = love.graphics.newQuad(
                col * fw, row * fh, fw, fh, sw, sh
            )
        end
    end
end

function love.draw()
    -- Draw a quad from a spritesheet:
    love.graphics.draw(
        playerImage,
        frameQuads[animRow][animFrame],
        player.x, player.y
    )
end
```

---

## Animation Timer

```lua
function love.load()
    anim = {
        row      = 0,     -- animation row on spritesheet
        frame    = 0,     -- current frame index
        frames   = 8,     -- total frames in this animation
        fps      = 12,
        timer    = 0
    }
end

function love.update(dt)
    anim.timer = anim.timer + dt
    if anim.timer >= 1 / anim.fps then
        anim.timer = anim.timer - (1 / anim.fps)
        anim.frame = (anim.frame + 1) % anim.frames
    end
end
```

---

## Collision Detection (AABB)

Love2D has no built-in collision for non-physics objects. Use AABB:

```lua
local function aabb(a, b)
    return a.x < b.x + b.w
       and a.x + a.w > b.x
       and a.y < b.y + b.h
       and a.y + a.h > b.y
end

-- Usage:
if aabb(player, enemy) then
    player.hp = player.hp - enemy.damage
end
```

---

## love.physics (Box2D Wrapper)

For games requiring realistic physics:

```lua
function love.load()
    world  = love.physics.newWorld(0, 800, true)  -- gravity Y

    -- Ground
    groundBody  = love.physics.newBody(world, 400, 560, "static")
    groundShape = love.physics.newRectangleShape(800, 20)
    groundFix   = love.physics.newFixture(groundBody, groundShape)

    -- Player
    playerBody  = love.physics.newBody(world, 100, 100, "dynamic")
    playerBody:setFixedRotation(true)             -- prevent spinning
    playerShape = love.physics.newRectangleShape(32, 64)
    playerFix   = love.physics.newFixture(playerBody, playerShape)
    playerFix:setRestitution(0)                   -- no bounce
end

function love.update(dt)
    world:update(dt)

    -- Move by setting linear velocity:
    local vx = 0
    if love.keyboard.isDown("right") then vx =  300 end
    if love.keyboard.isDown("left")  then vx = -300 end
    playerBody:setLinearVelocity(vx, select(2, playerBody:getLinearVelocity()))
end

function love.draw()
    love.graphics.rectangle(
        "fill",
        playerBody:getX() - 16,
        playerBody:getY() - 32,
        32, 64
    )
end
```

---

## Audio

```lua
function love.load()
    -- Static source — short SFX loaded into memory
    sfxJump = love.audio.newSource("assets/audio/jump.ogg", "static")

    -- Stream source — music played from disk
    music   = love.audio.newSource("assets/audio/theme.ogg", "stream")
    music:setLooping(true)
    music:setVolume(0.6)
    music:play()
end

-- Play SFX (clone to allow overlapping plays):
function playSound(source)
    local clone = source:clone()
    clone:play()
end

-- Usage:
playSound(sfxJump)
```

---

## Save Data (love.filesystem)

```lua
local SAVE_PATH = "save.lua"

function saveGame(data)
    local serialised = "return " .. serpent.block(data)  -- use serpent library
    love.filesystem.write(SAVE_PATH, serialised)
end

function loadGame()
    if love.filesystem.getInfo(SAVE_PATH) then
        local chunk = love.filesystem.load(SAVE_PATH)
        return chunk()
    end
    return nil
end
```

**Note**: Love2D saves to OS-specific app data (`%APPDATA%\LOVE\<identity>` on Windows). Never rely on relative paths for save data.

---

## Performance Rules

| Rule | Reason |
|------|--------|
| Use `SpriteBatch` for many identical sprites | One draw call instead of N |
| Cache `love.graphics.newImage()` — load once in `love.load()` | Image loading is slow; never load in `update` or `draw` |
| Use `Canvas` for static backgrounds | Pre-render once; draw canvas every frame |
| Set `love.graphics.setDefaultFilter("nearest", "nearest")` for pixel art | Prevents blurring pixel sprites |
| Batch color/transform changes between draws | Each `love.graphics.setColor()` call is a state change |

```lua
-- SpriteBatch example:
batch = love.graphics.newSpriteBatch(tileImage, 1000)

-- Fill once or on map change:
batch:clear()
for _, tile in ipairs(tiles) do
    batch:add(tileQuads[tile.id], tile.x * 32, tile.y * 32)
end

-- Draw every frame (single draw call):
love.graphics.draw(batch, 0, 0)
```

---

## Distribution Checklist

- [ ] `conf.lua` has correct `t.version` matching installed Love2D
- [ ] All asset paths use forward slashes (`/`) — Love2D on Windows still requires `/`
- [ ] `love.filesystem.getIdentity()` set to your game name (controls save location)
- [ ] Ship a `.love` file (zip renamed) for cross-platform distribution
- [ ] Fuse with Love2D binary for Windows `.exe` distribution: `copy /b love.exe+game.love game.exe`
- [ ] Test with `love.graphics.setDefaultFilter("nearest")` for pixel art games
- [ ] Profile with `love.timer.getFPS()` overlay; target 60 FPS
