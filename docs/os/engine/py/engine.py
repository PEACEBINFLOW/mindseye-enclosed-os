from dataclasses import dataclass
from typing import Dict, List
import random

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
    def __init__(self, tiles: List[Tile], empty_index: int, pages_provider):
        self._tiles_model = tiles[:]
        self.tiles = tiles[:]
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
        for _ in range(steps):
            pick = random.choice(neighbors(self.empty_index))
            self.tiles[pick], self.tiles[self.empty_index] = self.tiles[self.empty_index], self.tiles[pick]
            self.empty_index = pick
        self.moves = 0

    def try_move(self, idx: int) -> Dict:
        if idx not in neighbors(self.empty_index):
            return {"ok": False, "msg": "Not adjacent. Slide into the empty slot."}

        old_empty = self.empty_index
        self.tiles[idx], self.tiles[self.empty_index] = self.tiles[self.empty_index], self.tiles[idx]
        self.empty_index = idx
        self.moves += 1

        moved_tile = self.tiles[old_empty]
        if moved_tile.key != "EMPTY":
            self.active = moved_tile.key

        return {"ok": True}

    def set_active(self, key: str):
        self.active = key

    def get_state(self) -> Dict:
        return {
            "tiles": [{"key": t.key, "label": t.label} for t in self.tiles],
            "empty_index": self.empty_index,
            "moves": self.moves,
            "active": self.active,
            "w": W,
            "h": H
        }

    def get_active_page(self) -> Dict:
        return self.pages_provider(self.active)

def create_engine():
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
        Tile("EMPTY", ""),
    ]

    return MindsEyeEnclosedEngine(tiles=tiles, empty_index=N-1, pages_provider=get_page)
