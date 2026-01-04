def get_page(key: str) -> dict:
    # Everything here is offline content. You can evolve into a full lore/OS manual.
    if key == "HOME":
        return page(
            "HOME",
            "MindsEye Enclosed OS",
            "Interactive system-document. Movement is navigation. No backend.",
            [
                card("What this is", "A Web2-style interactive doc/game interface. It behaves like an OS launcher and a puzzle."),
                card("How to navigate", "Tap tiles next to the empty space. The system shifts and the active page updates."),
                card("Why this matters", "This simulates 'system video' interfaces without needing any live data."),
                card("Actions", "Try shifting the system.", actions=[{"label":"glitch", "action":"GLITCH"}]),
            ],
        )

    if key == "MUX":
        return page(
            "MUX",
            "Mux (Offline Module)",
            "This is the placeholder world for system-video rendering.",
            [
                card("Future", "In the full version, tiles will generate 'system videos' from internal state changes."),
                card("Now", "We simulate the behavior through motion + state rules, not external streaming."),
                card("Action", "Jump to Fabric.", actions=[{"label":"open fabric", "action":"OPEN:FABRIC"}]),
            ],
        )

    if key == "LEDGER":
        return page(
            "LEDGER",
            "Ledger",
            "A memory structure for recording state. (Offline simulation.)",
            [
                card("Rule", "No overwrites. Only append."),
                card("Vision", "Even UI navigation becomes recordable events."),
                card("Action", "Go Home.", actions=[{"label":"home", "action":"GO_HOME"}]),
            ],
        )

    # default
    return page(
        key,
        key,
        "Offline module placeholder.",
        [
            card("Module", f"{key} exists as a world node."),
            card("Note", "Add deeper content + laws in content.py."),
            card("Action", "Home.", actions=[{"label":"home", "action":"GO_HOME"}]),
        ],
    )

def page(key, title, subtitle, cards):
    return {"key": key, "title": title, "subtitle": subtitle, "cards": cards}

def card(title, body, actions=None):
    c = {"title": title, "body": body}
    if actions:
        c["actions"] = actions
    return c
