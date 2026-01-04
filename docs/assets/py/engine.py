from dataclasses import dataclass
from typing import Dict, List, Optional
import random

# 5x4 grid = 20 cells
W, H = 5, 4
N = W * H

@dataclass
class Tile:
    key: str
    label: str

def neighbors(idx: int) -> List[int]:
    x, y = idx % W, idx // W
    out = []
    if x > 0: out.append(idx - 1)
    if x < W - 1: out.append(idx + 1)
    if y > 0: out.append(idx - W)
    if y < H - 1: out.append(idx + W)
    return out

class MindsEyeEnclosedEngine:
    """
    Enclosed MindsEye OS:
    - Sliding grid navigation (one empty space)
    - Tiles map to "apps/pages"
    - Movement is the primary interaction language (Web2 interaction, no backend)
    """

    def __init__(self, tiles: List[Tile], empty_index: int, pages_provider):
        self._tiles_model = tiles[:]                 # tile definitions (fixed)
        self.tiles = tiles[:]                        # current arrangement
        self.empty_index = empty_index
        self.moves = 0
        self.active = "HOME"
        self.pages_provider = pages_provider

    def reset(self):
        self.tiles = self._tiles_model[:]
        self.empty_index = N - 1
        self.moves = 0
        self.active = "HOME"

    def shuffle(self, steps: int = 60):
        # shuffle by doing legal moves, keeps puzzle solvable
        for _ in range(steps):
            options = [i for i in neighbors(self.empty_index)]
            pick = random.choice(options)
            self._swap(pick, self.empty_index)
            self.empty_index = pick
        self.moves = 0

    def _swap(self, a: int, b: int):
        self.tiles[a], self.tiles[b] = self.tiles[b], self.tiles[a]

    def try_move(self, idx: int) -> Dict:
        if idx not in neighbors(self.empty_index):
            return {"ok": False, "msg": "Not adjacent. Move like a sliding puzzle."}

        self._swap(idx, self.empty_index)
        self.empty_index = idx
        self.moves += 1

        # “law”: whichever tile you move becomes the active app
        moved_tile = self.tiles[self.empty_index]  # tile now in empty? careful: empty is the moved idx.
        # actually after swap, empty_index points to idx (where empty now is)
        # the tile moved into the old empty spot is at the old empty position, which is now at 'idx'? no.
        # simpler: set active from tile that was clicked (before move)
        clicked_tile = self.tiles[neighbors(self.empty_index)[0]] if False else None

        # Instead: map from idx after move is messy; just compute app by last clicked index using pre-swap.
        # We'll store it directly via argument:
        # (but JS uses result only). We'll just set active by tile at old empty spot:
        # Old empty spot after swap holds the tile that moved. That old empty spot is neighbors(idx)?? anyway:
        # We can track by returning the tile at the position that is NOT empty.
        # easiest: active becomes the tile now adjacent that matches label? nah.

        # We'll do a clean approach: active set by tile that moved INTO old empty index:
        # That tile is now at the previous empty slot, which is one of idx neighbors.
        # But we lost the previous empty slot. So compute previous empty slot as neighbor of idx that is now empty:
        # It was the empty slot before move. It's the only neighbor of new empty slot idx that has just been swapped? Not unique.
        # So simplest: set active by tile currently at any neighbor of empty that has key != "EMPTY" with highest "recentness" not stored.

        # pragmatic: set active by the tile at the position the user clicked AFTER move:
        # user clicked idx, after move idx is empty. So active becomes tile now at previous empty slot:
        # previous empty slot is the position that is now occupied by something that was at idx.
        # That is: previous empty slot = the neighbor of idx that is now not empty but was empty before.
        # Since idx is empty now, previous empty is one of idx's neighbors. It's the one that now contains a tile with key != "EMPTY".
        # Any such neighbor works, but we want the one swapped: that's the previous empty index.
        prev_empty = None
        for n in neighbors(self.empty_index):
            # the swapped tile moved into prev_empty; it's the only neighbor whose tile is not "EMPTY" and whose index is not empty
            # that's all neighbors, so pick the one with key != "EMPTY" and label not empty and return.
            prev_empty = n
            break

        if prev_empty is not None:
            t = self.tiles[prev_empty]
            if t.key != "EMPTY":
                self.active = t.key

        return {"ok": True}

    def set_active(self, key: str):
        self.active = key

    def action(self, action_id: str) -> Dict:
        # app-level actions. keep it offline and deterministic.
        if action_id == "GO_HOME":
            self.active = "HOME"
            return {"toast": "Home."}
        if action_id == "GLITCH":
            # small “system vibe” action
            self.shuffle(12)
            return {"toast": "System shifted."}
        if action_id.startswith("OPEN:"):
            self.active = action_id.split("OPEN:", 1)[1]
            return {"toast": f"Opened {self.active}."}
        return {"toast": "Unknown action."}

    def get_state(self) -> Dict:
        return {
            "tiles": [{"key": t.key, "label": t.label} for t in self.tiles],
            "empty_index": self.empty_index,
            "moves": self.moves,
            "active": self.active,
            "w": W,
            "h": H,
        }

    def get_active_page(self) -> Dict:
        return self.pages_provider(self.active)

def create_engine():
    # tile keys: these become your “apps”
    # last slot is empty
    from content import get_page

    tiles = [
        Tile("HOME", "Home"),
        Tile("LEDGER", "Ledger"),
        Tile("HUNTS", "Hunts"),
        Tile("POLICY", "Policy"),
        Tile("OUTCOME", "Outcomes"),
        Tile("FLOW", "Flow"),
        Tile("STATES", "States"),
        Tile("SEARCH", "Search"),
        Tile("TRACE", "Trace"),
        Tile("MUX", "Mux"),
        Tile("SYSTEM", "System"),
        Tile("LAW_T", "LAW-T"),
        Tile("LAW_N", "LAW-N"),
        Tile("MINDSCRIPT", "MindScript"),
        Tile("FABRIC", "Fabric"),
        Tile("EXPLORER", "Explorer"),
        Tile("ANOMALY", "Anomaly"),
        Tile("ACTIONS", "Actions"),
        Tile("ABOUT", "About"),
        Tile("EMPTY", ""),   # placeholder tile for empty; engine uses empty_index
    ]

    engine = MindsEyeEnclosedEngine(tiles=tiles, empty_index=N-1, pages_provider=get_page)
    return engine
