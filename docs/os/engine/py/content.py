import json

def card(title, body):
    return {"title": title, "body": body}

def page(key, title, subtitle, cards):
    return {"key": key, "title": title, "subtitle": subtitle, "cards": cards}

def get_page(key: str) -> dict:
    if key == "HOME":
        return page(
            "HOME",
            "MindsEye Enclosed OS",
            "Offline interactive system-document. No backend. No API.",
            [
                card("What this is", "A self-contained OS-like interface. Sliding grid movement is navigation."),
                card("Why it exists", "To simulate future ‘system videos’ and app streams without exposing private data."),
                card("How to use routes", "Try URL routes like #/LEDGER or #/MUX to jump instantly."),
                card("How to use tiles", "Move a tile into the empty slot. The moved tile becomes active."),
            ],
        )

    if key == "LEDGER":
        return page(
            "LEDGER",
            "Ledger (Offline Pack)",
            "Append-only memory simulation (seed pack).",
            [
                card("Rule", "No overwrites. Only append snapshots of system state."),
                card("Seed", "This demo ships with a local seed pack in /os/packs/ledger/ledger_seed.json"),
                card("Future", "Later you can record moves as events and export them as a dataset."),
            ],
        )

    if key == "MUX":
        return page(
            "MUX",
            "Mux (System Video Module)",
            "Placeholder module for system-video generation.",
            [
                card("Vision", "Instead of watching ‘content videos’, you watch ‘system videos’ generated from app activity."),
                card("Privacy", "Render patterns, not raw private logs. Abstract into safe telemetry."),
                card("Next", "We can animate state transitions + export frames as a “video ledger”."),
            ],
        )

    # Default page
    return page(
        key,
        f"{key}",
        "Module placeholder.",
        [
            card("Module", f"{key} exists as a node in the enclosed OS."),
            card("Add content", "Edit /os/engine/py/content.py or /os/worlds/*.json to expand worlds."),
        ],
    )
