# Gas Town ve Beads Komut Referansi

> `gt` ve `bd` icin temel ve sik kullanilan alt komutlarin tam `--help` referansi.
> Bu dokuman, komutlar gercekten calistirilarak uretilmistir.
> Tarih: 5 Nisan 2026
> Calistirilan dizin: `/Users/akrotesbot/gt/akos/polecats/brahmin/akos`

---

## Kapsam

Bu dosyada su komutlarin gercek `--help` ciktilari belgelenir:

- `gt --help`
- `gt sling --help`
- `gt convoy --help`
- `gt formula --help`
- `gt mol --help`
- `gt polecat --help`
- `gt hook --help`
- `gt nudge --help`
- `gt prime --help`
- `gt rig --help`
- `gt config --help`
- `gt directive --help`
- `gt mail --help`
- `gt dolt --help`
- `gt escalate --help`
- `bd --help`
- `bd create --help`
- `bd list --help`
- `bd show --help`
- `bd close --help`
- `bd dep --help`
- `bd label --help`
- `bd query --help`
- `bd search --help`

Not:

- Aciklayici basliklar ve kisa ozetler Turkcedir.
- Kod bloklari icindeki metinler komutlarin ham ciktilaridir.
- Ciktilar mevcut kurulum ve surume baglidir; ileride farkli olabilir.

---

## 1. `gt` ana komutu

`gt`, Gas Town icindeki rig, agent, iletisim, servis, tanilama ve is dagitimi komutlarini tek cati altinda toplar.

### `gt --help`

```text
Gas Town (gt) manages multi-agent workspaces called rigs.

It coordinates agent spawning, work distribution, and communication
across distributed teams of AI agents working on shared codebases.

Usage:
  gt [command]

Work Management:
  assign         Create a bead and hook it to a crew member
  bead           Bead management utilities
  cat            Display bead content
  changelog      Show completed work across rigs
  cleanup        Clean up orphaned Claude processes
  close          Close one or more beads
  commit         Git commit with automatic agent identity
  compact        Compact expired wisps (TTL-based cleanup)
  convoy         Track batches of work across rigs
  done           Signal work ready for merge queue
  forget         Remove a stored memory
  formula        Manage workflow formulas
  handoff        Hand off to a fresh session, work continues from hook
  hook           Show or attach work on a hook
  memories       List or search stored memories
  mol            Agent molecule workflow commands
  mountain       Activate Mountain-Eater: stage, label, and launch an epic
  mq             Merge queue operations
  orphans        Find lost polecat work
  prune-branches Remove stale local polecat tracking branches
  ready          Show work ready across town
  release        Release stuck in_progress issues back to pending
  remember       Store a persistent memory
  resume         Check for handoff messages
  scheduler      Manage dispatch scheduler
  show           Show details of a bead
  sling          Assign work to an agent (THE unified work dispatch command)
  synthesis      Manage convoy synthesis steps
  trail          Show recent agent activity
  unsling        Remove work from an agent's hook
  wl             Wasteland federation commands

Agent Management:
  agents         List Gas Town agent sessions
  boot           Manage Boot (Deacon watchdog)
  callbacks      Handle agent callbacks
  deacon         Manage the Deacon (town-level watchdog)
  dog            Manage dogs (cross-rig infrastructure workers)
  mayor          Manage the Mayor (Chief of Staff for cross-rig coordination)
  polecat        Manage polecats (persistent identity, ephemeral sessions)
  refinery       Manage the Refinery (merge queue processor)
  role           Show or manage agent role
  session        Manage polecat sessions
  signal         Claude Code hook signal handlers
  witness        Manage the Witness (per-rig polecat health monitor)

Communication:
  broadcast      Send a nudge message to all workers
  dnd            Toggle Do Not Disturb mode for notifications
  escalate       Escalation system for critical issues
  mail           Agent messaging system
  notify         Set notification level
  nudge          Send a synchronous message to any Gas Town worker
  peek           View recent output from a polecat or crew session

Services:
  daemon         Manage the Gas Town daemon
  dolt           Manage the Dolt SQL server
  down           Stop all Gas Town services
  estop          Emergency stop — freeze all agent work
  maintain       Run full Dolt maintenance (reap + flatten + gc)
  quota          Manage account quota rotation
  reaper         Wisp and issue cleanup operations (Dog-callable helpers)
  shutdown       Shutdown Gas Town with cleanup
  start          Start Gas Town or a crew workspace
  thaw           Resume from emergency stop — thaw all frozen agents
  up             Bring up all Gas Town services

Workspace:
  crew           Manage crew workers (persistent workspaces for humans)
  git-init       Initialize git repository for a Gas Town HQ
  init           Initialize current directory as a Gas Town rig
  install        Create a new Gas Town HQ (workspace)
  namepool       Manage polecat name pools
  rig            Manage rigs in the workspace
  worktree       Create worktree in another rig for cross-rig work

Configuration:
  account        Manage Claude Code accounts
  completion     Generate the autocompletion script for the specified shell
  config         Manage Gas Town configuration
  directive      Manage role directives
  disable        Disable Gas Town system-wide
  enable         Enable Gas Town system-wide
  hooks          Centralized hook management for Gas Town
  issue          Manage current issue for status line display
  plugin         Plugin management
  shell          Manage shell integration
  theme          View or set tmux theme for the current rig
  uninstall      Remove Gas Town from the system

Diagnostics:
  activity       Emit and view activity events
  audit          Query work history by actor
  checkpoint     Manage session checkpoints for crash recovery
  costs          Show costs for running Claude sessions
  dashboard      Start the convoy tracking web dashboard
  doctor         Run health checks on the workspace
  feed           Show real-time activity feed of gt events
  heartbeat      Update agent heartbeat state
  help           Help about any command
  info           Show Gas Town information and what's new
  log            View town activity log
  metrics        Show command usage statistics
  patrol         Patrol digest management
  prime          Output role context for current directory
  repair         Repair database identity and configuration issues
  seance         Talk to your predecessor sessions
  stale          Check if the gt binary is stale
  status         Show overall town status
  thanks         Thank the human contributors to Gas Town
  upgrade        Run post-install migration and sync workspace state
  version        Print version information
  vitals         Show unified health dashboard
  whoami         Show current identity for mail commands

Additional Commands:
  cycle          Cycle between sessions in the same group
  health         Show comprehensive system health
  krc            Key Record Chronicle - manage ephemeral data TTLs
  tap            Claude Code hook handlers
  town           Town-level operations
  warrant        Manage death warrants for stuck agents

Flags:
  -h, --help      help for gt
  -v, --version   version for gt

Use "gt [command] --help" for more information about a command.
```

## 2. `gt` is dagitimi ve takip komutlari

Bu grup, islerin agent'lara dagitilmasi, toplu takibi ve formula tabanli akislari kapsar.

### `gt sling --help`

```text
Sling work onto an agent's hook and start working immediately.

This is THE command for assigning work in Gas Town. It handles:
  - Existing agents (mayor, crew, witness, refinery)
  - Auto-spawning polecats when target is a rig
  - Dispatching to dogs (Deacon's helper workers)
  - Formula instantiation and wisp creation
  - Auto-convoy creation for dashboard visibility

Auto-Convoy:
  When slinging a single issue (not a formula), sling automatically creates
  a convoy to track the work unless --no-convoy is specified. This ensures
  all work appears in 'gt convoy list', even "swarm of one" assignments.

  gt sling gt-abc gastown              # Creates "Work: <issue-title>" convoy
  gt sling gt-abc gastown --no-convoy  # Skip auto-convoy creation

Merge Strategy (--merge):
  Controls how completed work lands. Stored on the auto-convoy.
  gt sling gt-abc gastown --merge=direct  # Push branch directly to main
  gt sling gt-abc gastown --merge=mr      # Merge queue (default)
  gt sling gt-abc gastown --merge=local   # Keep on feature branch

Target Resolution:
  gt sling gt-abc                       # Self (current agent)
  gt sling gt-abc crew                  # Crew worker in current rig
  gt sling gp-abc greenplace               # Auto-spawn polecat in rig
  gt sling gt-abc greenplace/Toast         # Specific polecat
  gt sling gt-abc gastown --crew mel    # Crew member mel in gastown
  gt sling gt-abc mayor                 # Mayor
  gt sling gt-abc deacon/dogs           # Auto-dispatch to idle dog
  gt sling gt-abc deacon/dogs/alpha     # Specific dog

Spawning Options (when target is a rig):
  gt sling gp-abc greenplace --create               # Create polecat if missing
  gt sling gp-abc greenplace --force                # Ignore unread mail
  gt sling gp-abc greenplace --account work         # Use specific Claude account

Natural Language Args:
  gt sling gt-abc --args "patch release"
  gt sling code-review --args "focus on security"

The --args string is stored in the bead and shown via gt prime. Since the
executor is an LLM, it interprets these instructions naturally.

Stdin Mode (for shell-quoting-safe multi-line content):
  echo "review for security issues" | gt sling gt-abc gastown --stdin
  gt sling gt-abc gastown --stdin <<'EOF'
  Focus on:
  1. SQL injection in query builders
  2. XSS in template rendering
  EOF

  # With --args on CLI, stdin goes to --message:
  echo "Extra context here" | gt sling gt-abc gastown --args "patch release" --stdin

Formula Slinging:
  gt sling mol-release mayor/           # Cook + wisp + attach + nudge
  gt sling towers-of-hanoi --var disks=3

Formula-on-Bead (--on flag):
  gt sling mol-review --on gt-abc       # Apply formula to existing work
  gt sling shiny --on gt-abc crew       # Apply formula, sling to crew

Compare:
  gt hook <bead>      # Just attach (no action)
  gt sling <bead>     # Attach + start now (keep context)
  gt handoff <bead>   # Attach + restart (fresh context)

The propulsion principle: if it's on your hook, YOU RUN IT.

Batch Slinging:
  gt sling gt-abc gt-def gt-ghi gastown   # Sling multiple beads to a rig
  gt sling gt-abc gt-def gastown --max-concurrent 3  # Limit concurrent spawns

  When multiple beads are provided with a rig target, each bead gets its own
  polecat. This parallelizes work dispatch without running gt sling N times.
  Use --max-concurrent to throttle spawn rate and prevent Dolt server overload.

Usage:
  gt sling <bead-or-formula> [target] [flags]
  gt sling [command]

Available Commands:
  respawn-reset Reset the respawn counter for a bead

Flags:
      --account string       Claude Code account handle to use
      --agent string         Override agent/runtime for this sling (e.g., claude, gemini, codex, or custom alias)
  -a, --args string          Natural language instructions for the executor (e.g., 'patch release')
      --base-branch string   Override base branch for polecat worktree (e.g., 'develop', 'release/v2')
      --create               Create polecat if it doesn't exist
      --crew string          Target a crew member in the specified rig (e.g., --crew mel with target gastown → gastown/crew/mel)
  -n, --dry-run              Show what would be done
      --force                Force spawn even if polecat has unread mail
      --formula string       Formula to apply (default: mol-polecat-work for polecat targets)
  -h, --help                 help for sling
      --hook-raw-bead        Hook raw bead without default formula (expert mode)
      --max-concurrent int   Limit concurrent polecat spawns in batch mode (0 = no limit)
      --merge string         Merge strategy: direct (push to main), mr (merge queue, default), local (keep on branch)
  -m, --message string       Context message for the work
      --no-boot              Skip rig boot after polecat spawn (avoids witness/refinery lock contention)
      --no-convoy            Skip auto-convoy creation for single-issue sling
      --no-merge             Skip merge queue on completion (keep work on feature branch for review)
      --on string            Apply formula to existing bead (implies wisp scaffolding)
      --owned                Mark auto-convoy as caller-managed lifecycle (no automatic witness/refinery registration)
      --ralph                Enable Ralph Wiggum loop mode (fresh context per step, for multi-step workflows)
      --review-only          Mark work as review-only: assignee evaluates and reports back, must NOT merge/commit/push
      --stdin                Read --message and/or --args from stdin (avoids shell quoting issues)
  -s, --subject string       Context subject for the work
      --var stringArray      Formula variable (key=value), can be repeated

Use "gt sling [command] --help" for more information about a command.
```

### `gt convoy --help`

```text
Manage convoys - the primary unit for tracking batched work.

A convoy is a persistent tracking unit that monitors related issues across
rigs. When you kick off work (even a single issue), a convoy tracks it so
you can see when it lands and what was included.

WHAT IS A CONVOY:
  - Persistent tracking unit with an ID (hq-*)
  - Tracks issues across rigs (frontend+backend, beads+gastown, etc.)
  - Auto-closes when all tracked issues complete → notifies subscribers
  - Can be reopened by adding more issues

WHAT IS A SWARM:
  - Ephemeral: "the workers currently assigned to a convoy's issues"
  - No separate ID - uses the convoy ID
  - Dissolves when work completes

TRACKING SEMANTICS:
  - 'tracks' relation is non-blocking (tracked issues don't block convoy)
  - Cross-prefix capable (convoy in hq-* tracks issues in gt-*, bd-*)
  - Landed: all tracked issues closed → notification sent to subscribers

COMMANDS:
  create    Create a convoy tracking specified issues
  add       Add issues to an existing convoy (reopens if closed)
  close     Close a convoy (verifies all items done, or use --force)
  land      Land an owned convoy (cleanup worktrees, close convoy)
  status    Show convoy progress, tracked issues, and active workers
  list      List convoys (the dashboard view)
  watch     Subscribe to convoy completion notifications
  unwatch   Unsubscribe from convoy completion notifications

Usage:
  gt convoy [flags]
  gt convoy [command]

Available Commands:
  add         Add issues to an existing convoy
  check       Check and auto-close completed convoys
  close       Close a convoy
  create      Create a new convoy
  land        Land an owned convoy (cleanup worktrees, close convoy)
  launch      Launch a staged convoy: transition to open and dispatch Wave 1
  list        List convoys
  stage       Stage a convoy: analyze dependencies, compute waves, create staged convoy
  status      Show convoy status
  stranded    Find stranded convoys (ready work, stuck, or empty) needing attention
  unwatch     Unsubscribe from convoy completion notifications
  watch       Subscribe to convoy completion notifications

Flags:
  -h, --help          help for convoy
  -i, --interactive   Interactive tree view

Use "gt convoy [command] --help" for more information about a command.
```

### `gt formula --help`

```text
Manage workflow formulas - reusable molecule templates.

Formulas are TOML/JSON files that define workflows with steps, variables,
and composition rules. They can be "poured" to create molecules or "wisped"
for ephemeral patrol cycles.

Commands:
  list    List available formulas from all search paths
  show    Display formula details (steps, variables, composition)
  run     Execute a formula (pour and dispatch)
  create  Create a new formula template

Search paths (in order):
  1. .beads/formulas/ (project)
  2. ~/.beads/formulas/ (user)
  3. $GT_ROOT/.beads/formulas/ (orchestrator)

Examples:
  gt formula list                    # List all formulas
  gt formula show shiny              # Show formula details
  gt formula run shiny --pr=123      # Run formula on PR #123
  gt formula create my-workflow      # Create new formula template

Usage:
  gt formula [flags]
  gt formula [command]

Aliases:
  formula, formulas

Available Commands:
  create      Create a new formula template
  list        List available formulas
  overlay     Manage formula overlays
  run         Execute a formula
  show        Display formula details

Flags:
  -h, --help   help for formula

Use "gt formula [command] --help" for more information about a command.
```

### `gt mol --help`

```text
Agent-specific molecule workflow operations.

These commands operate on YOUR hook and YOUR attached molecules.
Use 'gt hook' to see what's on your hook (alias for 'gt mol status').

VIEWING YOUR WORK:
  gt hook              Show what's on your hook
  gt mol current       Show what you should be working on
  gt mol progress      Show execution progress

WORKING ON STEPS:
  gt mol step done     Complete current step (auto-continues)

LIFECYCLE:
  gt mol attach        Attach molecule to your hook
  gt mol detach        Detach molecule from your hook
  gt mol burn          Discard attached molecule (no record)
  gt mol squash        Compress to digest (permanent record)

TO DISPATCH WORK (with molecules):
  gt sling mol-xxx target   # Pour formula + sling to agent
  gt formulas               # List available formulas

Usage:
  gt mol [flags]
  gt mol [command]

Aliases:
  mol, molecule

Available Commands:
  attach           Attach a molecule to a pinned bead
  attach-from-mail Attach a molecule from a mail message
  attachment       Show attachment status of a pinned bead
  await-signal     Wait for activity feed signal with timeout (alias: gt mol step await-signal)
  burn             Burn current molecule without creating a digest
  current          Show what agent should be working on
  dag              Visualize molecule dependency DAG
  detach           Detach molecule from a pinned bead
  progress         Show progress through a molecule's steps
  squash           Compress molecule into a digest
  status           Show what's on an agent's hook
  step             Molecule step operations

Flags:
  -h, --help   help for mol

Use "gt mol [command] --help" for more information about a command.
```

### `gt polecat --help`

```text
Manage polecat lifecycle in rigs.

Polecats have PERSISTENT IDENTITY but EPHEMERAL SESSIONS. Each polecat has
a permanent agent bead and CV chain that accumulates work history across
assignments. Sessions and sandboxes are ephemeral — spawned for specific
tasks, cleaned up on completion — but the identity persists.

A polecat is either:
  - Working: Actively doing assigned work
  - Stalled: Session crashed mid-work (needs Witness intervention)
  - Zombie: Finished but gt done failed (needs cleanup)
  - Nuked: Session ended, identity persists (ready for next assignment)

Self-cleaning model: When work completes, the polecat runs 'gt done',
which pushes the branch, submits to the merge queue, and exits. The
Witness then nukes the sandbox. The polecat's identity (agent bead)
persists with agent_state=nuked, preserving work history.

Session vs sandbox: The Claude session cycles frequently (handoffs,
compaction). The git worktree (sandbox) persists until nuke. Work
survives session restarts.

Cats build features. Dogs clean up messes.

Usage:
  gt polecat [flags]
  gt polecat [command]

Aliases:
  polecat, polecats

Available Commands:
  check-recovery Check if polecat needs recovery vs safe to nuke
  gc             Garbage collect stale polecat branches
  git-state      Show git state for pre-kill verification
  identity       Manage polecat identities
  list           List polecats in a rig
  nuke           Completely destroy a polecat (session, worktree, branch, agent bead)
  pool-init      Initialize a persistent polecat pool for a rig
  prune          Prune stale polecat branches (local and remote)
  remove         Remove polecats from a rig
  stale          Detect stale polecats that may need cleanup
  status         Show detailed status for a polecat

Flags:
  -h, --help   help for polecat

Use "gt polecat [command] --help" for more information about a command.
```

### `gt hook --help`

```text
Show what's on your hook, or attach new work.

With no arguments, shows your current hook status (alias for 'gt mol status').
With a bead ID, attaches that work to your hook.
With a bead ID and target, attaches work to another agent's hook.

The hook is the "durability primitive" - work on your hook survives session
restarts, context compaction, and handoffs. When you restart (via gt handoff),
your SessionStart hook finds the attached work and you continue from where
you left off.

Examples:
  gt hook                                    # Show what's on my hook
  gt hook status                             # Same as above
  gt hook gt-abc                             # Attach issue gt-abc to your hook
  gt hook gt-abc -s "Fix the bug"            # With subject for handoff mail
  gt hook gt-abc gastown/crew/max            # Attach gt-abc to max's hook

Related commands:
  gt sling <bead>    # Hook + start now (keep context)
  gt handoff <bead>  # Hook + restart (fresh context)
  gt unsling         # Remove work from hook

Usage:
  gt hook [bead-id] [target] [flags]
  gt hook [command]

Aliases:
  hook, work

Available Commands:
  attach      Attach work to a hook
  clear       Clear your hook (alias for 'gt unhook')
  detach      Detach work from a hook
  show        Show what's on an agent's hook (compact)
  status      Show what's on your hook

Flags:
      --clear            Clear your hook (alias for 'gt unhook')
  -n, --dry-run          Show what would be done
  -f, --force            Replace existing incomplete hooked bead
  -h, --help             help for hook
      --json             Output as JSON (for status)
  -m, --message string   Message for handoff mail (optional)
  -s, --subject string   Subject for handoff mail (optional)

Use "gt hook [command] --help" for more information about a command.
```

## 3. `gt` iletisim ve context komutlari

Bu komutlar agent'lar arasi mesajlasma, rolden context uretme ve operator yonlendirmeleri icin kullanilir.

### `gt nudge --help`

```text
Universal messaging API for Gas Town worker-to-worker communication.

Delivers a message to any worker's Claude Code session: polecats, crew,
witness, refinery, mayor, or deacon.

Delivery modes (--mode):
  wait-idle  Wait for agent to become idle (prompt visible), then deliver
             directly. Falls back to queue on timeout. If both idle-wait and
             queue fail, falls back to immediate delivery as a last resort.
             This is the default — it avoids interrupting active tool calls.
  queue      Write to a file queue; agent picks up via hook at next turn
             boundary. Zero interruption. Use for non-urgent coordination.
  immediate  Send directly via tmux send-keys. Interrupts in-flight work
             but guarantees immediate delivery. Use only when you need to
             break through (e.g., stuck agent, emergency).

Queue and wait-idle modes require a drain mechanism. Claude agents drain
via UserPromptSubmit hook; other agents use a background nudge-poller
that periodically drains and injects via tmux. If neither is available,
use --mode=immediate.

This is the ONLY way to send messages to Claude sessions.
Do not use raw tmux send-keys elsewhere.

Role shortcuts (expand to session names):
  mayor     Maps to gt-mayor
  deacon    Maps to gt-deacon
  witness   Maps to gt-<rig>-witness (uses current rig)
  refinery  Maps to gt-<rig>-refinery (uses current rig)

Channel syntax:
  channel:<name>  Nudges all members of a named channel defined in
                  ~/gt/config/messaging.json under "nudge_channels".
                  Patterns like "gastown/polecats/*" are expanded.

DND (Do Not Disturb):
  If the target has DND enabled (gt dnd on), the nudge is skipped.
  Use --force to override DND and send anyway.

Examples:
  gt nudge greenplace/furiosa "Check your mail and start working"
  gt nudge greenplace/alpha -m "What's your status?"
  gt nudge mayor "Status update requested"
  gt nudge witness "Check polecat health"
  gt nudge deacon session-started
  gt nudge channel:workers "New priority work available"

  # Use --stdin for messages with special characters or formatting:
  gt nudge gastown/alpha --stdin <<'EOF'
  Status update:
  - Task 1: complete
  - Task 2: in progress
  EOF

Usage:
  gt nudge <target> [message] [flags]

Flags:
  -f, --force             Send even if target has DND enabled
  -h, --help              help for nudge
      --if-fresh          Only send if caller's tmux session is <60s old (suppresses compaction nudges)
  -m, --message string    Message to send
      --mode string       Delivery mode: wait-idle (default), queue, or immediate (default "wait-idle")
      --priority string   Queue priority: normal (default) or urgent (default "normal")
      --stdin             Read message from stdin (avoids shell quoting issues)
```

### `gt prime --help`

```text
Detect the agent role from the current directory and output context.

Role detection:
  - Town root → Neutral (no role inferred; use GT_ROLE)
  - mayor/ or <rig>/mayor/ → Mayor context
  - <rig>/witness/rig/ → Witness context
  - <rig>/refinery/rig/ → Refinery context
  - <rig>/polecats/<name>/ → Polecat context

This command is typically used in shell prompts or agent initialization.

HOOK MODE (--hook):
  When called as an LLM runtime hook, use --hook to enable session ID handling,
  agent-ready signaling, and session persistence.

  Session ID resolution (first match wins):
    1. GT_SESSION_ID env var
    2. CLAUDE_SESSION_ID env var
    3. Persisted .runtime/session_id (from prior SessionStart)
    4. Stdin JSON (Claude Code format)
    5. Auto-generated UUID

  Source resolution: GT_HOOK_SOURCE env var, then stdin JSON "source" field.

  Claude Code integration (in .claude/settings.json):
    "SessionStart": [{"hooks": [{"type": "command", "command": "gt prime --hook"}]}]
    Claude sends JSON on stdin: {"session_id":"uuid","source":"startup|resume|compact"}

  Gemini CLI / other runtimes (in .gemini/settings.json):
    "SessionStart": "export GT_SESSION_ID=$(uuidgen) GT_HOOK_SOURCE=startup && gt prime --hook"
    "PreCompress":  "export GT_HOOK_SOURCE=compact && gt prime --hook"
    Set GT_SESSION_ID + GT_HOOK_SOURCE as env vars to skip the stdin read entirely.

Usage:
  gt prime [flags]

Flags:
      --dry-run   Show what would be injected without side effects (no marker removal, no bd prime, no mail)
      --explain   Show why each section was included
  -h, --help      help for prime
      --hook      Hook mode: read session ID from stdin JSON (for LLM runtime hooks)
      --json      Output state as JSON (requires --state)
      --state     Show detected session state only (normal/post-handoff/crash/autonomous)
```

### `gt directive --help`

```text
Manage operator-provided role directives.

Directives are markdown files that customize agent behavior per role.
They are injected at prime time and override formula defaults where
they conflict.

Subcommands:
  show    Display the active directive for a role
  edit    Open a directive in $EDITOR (creates if needed)
  list    List all directive files

File layout:
  Town-level: <townRoot>/directives/<role>.md
  Rig-level:  <townRoot>/<rig>/directives/<role>.md

Resolution: Town and rig directives are concatenated (town first, rig last).
Rig-level content gets the last word.

Examples:
  gt directive show polecat             # Show active polecat directive
  gt directive show witness --rig sky   # Show witness directive for sky rig
  gt directive edit crew                # Edit crew directive (rig-level)
  gt directive list                     # List all directive files

Usage:
  gt directive [flags]
  gt directive [command]

Aliases:
  directive, directives

Available Commands:
  edit        Edit directive for a role
  list        List all directive files
  show        Show active directive for a role

Flags:
  -h, --help   help for directive

Use "gt directive [command] --help" for more information about a command.
```

### `gt mail --help`

```text
Send and receive messages between agents.

The mail system allows Mayor, polecats, and the Refinery to communicate.
Messages are stored in beads as issues with type=message.

MAIL ROUTING:
  ┌─────────────────────────────────────────────────────┐
  │                    Town (.beads/)                   │
  │  ┌─────────────────────────────────────────────┐   │
  │  │                 Mayor Inbox                 │   │
  │  │  └── mayor/                                 │   │
  │  └─────────────────────────────────────────────┘   │
  │                                                     │
  │  ┌─────────────────────────────────────────────┐   │
  │  │           gastown/ (rig mailboxes)          │   │
  │  │  ├── witness      ← greenplace/witness         │   │
  │  │  ├── refinery     ← greenplace/refinery        │   │
  │  │  ├── Toast        ← greenplace/Toast           │   │
  │  │  └── crew/max     ← greenplace/crew/max        │   │
  │  └─────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────┘

ADDRESS FORMATS:
  mayor/              → Mayor inbox
  <rig>/witness       → Rig's Witness
  <rig>/refinery      → Rig's Refinery
  <rig>/<polecat>     → Polecat (e.g., greenplace/Toast)
  <rig>/crew/<name>   → Crew worker (e.g., greenplace/crew/max)
  --human             → Special: human overseer

COMMANDS:
  inbox     View your inbox
  send      Send a message
  read      Read a specific message
  mark      Mark messages read/unread

Usage:
  gt mail [flags]
  gt mail [command]

Available Commands:
  announces   List or read announce channels
  archive     Archive messages
  channel     Manage and view beads-native channels
  check       Check for new mail (for hooks)
  claim       Claim a message from a queue
  clear       Clear all messages from an inbox
  delete      Delete messages
  directory   List all valid mail recipient addresses
  drain       Bulk-archive stale protocol messages
  group       Manage mail groups
  hook        Attach mail to your hook (alias for 'gt hook attach')
  inbox       Check inbox
  mark-read   Mark messages as read without archiving
  mark-unread Mark messages as unread
  peek        Show preview of first unread message
  queue       Manage mail queues
  read        Read a message
  release     Release a claimed queue message
  reply       Reply to a message
  search      Search messages by content
  send        Send a message
  thread      View a message thread

Flags:
  -h, --help   help for mail

Use "gt mail [command] --help" for more information about a command.
```

### `gt escalate --help`

```text
Create and manage escalations for critical issues.

The escalation system provides severity-based routing for issues that need
human or mayor attention. Escalations are tracked as beads with gt:escalation label.

SEVERITY LEVELS:
  critical  (P0) Immediate attention required
  high      (P1) Urgent, needs attention soon
  medium    (P2) Standard escalation (default)
  low       (P3) Informational, can wait

WORKFLOW:
  1. Agent encounters blocking issue
  2. Runs: gt escalate "Description" --severity high --reason "details"
  3. Escalation is routed based on settings/escalation.json
  4. Recipient acknowledges with: gt escalate ack <id>
  5. After resolution: gt escalate close <id> --reason "fixed"

CONFIGURATION:
  Routing is configured in ~/gt/settings/escalation.json:
  - routes: Map severity to action lists (bead, mail:mayor, email:human, sms:human)
  - contacts: Human email/SMS for external notifications
  - stale_threshold: When unacked escalations are re-escalated (default: 4h)
  - max_reescalations: How many times to bump severity (default: 2)

Examples:
  gt escalate "Build failing" --severity critical --reason "CI blocked"
  gt escalate "Need API credentials" --severity high --source "plugin:rebuild-gt"
  gt escalate "Code review requested" --reason "PR #123 ready"
  gt escalate list                          # Show open escalations
  gt escalate ack hq-abc123                 # Acknowledge
  gt escalate close hq-abc123 --reason "Fixed in commit abc"
  gt escalate stale                         # Re-escalate stale escalations

Usage:
  gt escalate [description] [flags]
  gt escalate [command]

Available Commands:
  ack         Acknowledge an escalation
  close       Close a resolved escalation
  list        List open escalations
  show        Show details of an escalation
  stale       Re-escalate stale unacknowledged escalations

Flags:
  -n, --dry-run           Show what would be done without executing
  -h, --help              help for escalate
      --json              Output as JSON
  -r, --reason string     Detailed reason for escalation
      --related string    Related bead ID (task, bug, etc.)
  -s, --severity string   Severity level: critical, high, medium, low (default "medium")
      --source string     Source identifier (e.g., plugin:rebuild-gt, patrol:deacon)
      --stdin             Read reason from stdin (avoids shell quoting issues)

Use "gt escalate [command] --help" for more information about a command.
```

## 4. `gt` workspace, rig ve konfigurasyon komutlari

Bu bolum, rig yapisini, merkezi ayarlari ve altyapi servislerini yoneten komutlari kapsar.

### `gt rig --help`

```text
Manage rigs (project containers) in the Gas Town workspace.

A rig is a container for managing a project and its agents:
  - refinery/rig/  Canonical main clone (Refinery's working copy)
  - mayor/rig/     Mayor's working clone for this rig
  - crew/<name>/   Human workspace(s)
  - witness/       Witness agent (no clone)
  - polecats/      Worker directories
  - .beads/        Rig-level issue tracking

Usage:
  gt rig [flags]
  gt rig [command]

Available Commands:
  add         Add a new rig to the workspace
  boot        Start witness and refinery for a rig
  config      View and manage rig configuration
  dock        Dock a rig (global, persistent shutdown)
  list        List all rigs in the workspace
  park        Park one or more rigs (stops agents, daemon won't auto-restart)
  reboot      Restart witness and refinery for a rig
  remove      Remove a rig from the registry (does not delete files)
  reset       Reset rig state (handoff content, mail, stale issues)
  restart     Restart one or more rigs (stop then start)
  settings    View and manage rig settings
  shutdown    Gracefully stop all rig agents
  start       Start witness and refinery on patrol for one or more rigs
  status      Show detailed status for a specific rig
  stop        Stop one or more rigs (shutdown semantics)
  undock      Undock a rig (remove global docked status)
  unpark      Unpark one or more rigs (allow daemon to auto-restart agents)

Flags:
  -h, --help   help for rig

Use "gt rig [command] --help" for more information about a command.
```

### `gt config --help`

```text
Manage Gas Town configuration settings.

This command allows you to view and modify configuration settings
for your Gas Town workspace, including agent aliases and defaults.

Commands:
  gt config agent list              List all agents (built-in and custom)
  gt config agent get <name>         Show agent configuration
  gt config agent set <name> <cmd>   Set custom agent command
  gt config agent remove <name>      Remove custom agent
  gt config default-agent [name]     Get or set default agent
  gt config default-agent list       List available agents

Usage:
  gt config [flags]
  gt config [command]

Available Commands:
  agent              Manage agent configuration
  agent-email-domain Get or set agent email domain
  cost-tier          Get or set cost optimization tier
  default-agent      Get or set default agent
  get                Get a configuration value
  set                Set a configuration value

Flags:
  -h, --help   help for config

Use "gt config [command] --help" for more information about a command.
```

### `gt dolt --help`

```text
Manage the Dolt SQL server for Gas Town beads.

The Dolt server provides multi-client access to all rig databases,
avoiding the single-writer limitation of embedded Dolt mode.

Server configuration:
  - Port: 3307 (avoids conflict with MySQL on 3306)
  - User: root (default Dolt user, no password for localhost)
  - Data directory: .dolt-data/ (contains all rig databases)

Each rig (hq, gastown, beads) has its own database subdirectory.

Usage:
  gt dolt [flags]
  gt dolt [command]

Available Commands:
  cleanup        Remove orphaned databases from .dolt-data/
  dump           Dump Dolt server goroutine stacks for debugging
  fix-metadata   Update metadata.json in all rig .beads directories
  flatten        Flatten database history to a single commit (NUCLEAR OPTION)
  init           Initialize and repair Dolt workspace configuration
  init-rig       Initialize a new rig database
  kill-imposters Kill dolt servers hijacking this workspace's port
  list           List available rig databases
  logs           View Dolt server logs
  migrate        Migrate existing dolt databases to centralized data directory
  migrate-wisps  Migrate agent beads from issues to wisps table
  pull           Pull Dolt databases from remotes
  rebase         Surgical compaction: squash old commits, keep recent ones
  recover        Detect and recover from Dolt read-only state
  restart        Restart the Dolt server (kills imposters)
  rollback       Restore .beads directories from a migration backup
  sql            Open Dolt SQL shell
  start          Start the Dolt server
  status         Show Dolt server status
  stop           Stop the Dolt server
  sync           Push Dolt databases to DoltHub remotes

Flags:
  -h, --help   help for dolt

Use "gt dolt [command] --help" for more information about a command.
```

## 5. `bd` ana komutu

`bd`, bead tabanli hafif issue tracker katmanidir. Gorevler, bagimliliklar, sorgular ve issue metadata'si burada yonetilir.

### `bd --help`

```text
Issues chained together like beads. A lightweight issue tracker with first-class dependency support.

Usage:
  bd [flags]
  bd [command]

Working With Issues:
  assign          Assign an issue to someone
  children        List child beads of a parent
  close           Close one or more issues
  comment         Add a comment to an issue
  comments        View or manage comments on an issue
  create          Create a new issue (or batch from markdown/graph JSON)
  create-form     Create a new issue using an interactive form
  delete          Delete one or more issues and clean up references
  edit            Edit an issue field in $EDITOR
  gate            Manage async coordination gates
  label           Manage issue labels
  link            Link two issues with a dependency
  list            List issues
  merge-slot      Manage merge-slot gates for serialized conflict resolution
  note            Append a note to an issue
  priority        Set the priority of an issue
  promote         Promote a wisp to a permanent bead
  q               Quick capture: create issue and output only ID
  query           Query issues using a simple query language
  reopen          Reopen one or more closed issues
  search          Search issues by text query
  set-state       Set operational state (creates event + updates label)
  show            Show issue details
  state           Query the current value of a state dimension
  tag             Add a label to an issue
  todo            Manage TODO items (convenience wrapper for task issues)
  update          Update one or more issues

Views & Reports:
  count           Count issues matching filters
  diff            Show changes between two commits or branches
  find-duplicates Find semantically similar issues using text analysis or AI
  history         Show version history for an issue
  lint            Check issues for missing template sections
  stale           Show stale issues (not updated recently)
  status          Show issue database overview and statistics
  statuses        List valid issue statuses
  types           List valid issue types

Dependencies & Structure:
  dep             Manage dependencies
  duplicate       Mark an issue as a duplicate of another
  duplicates      Find and optionally merge duplicate issues
  epic            Epic management commands
  graph           Display issue dependency graph
  supersede       Mark an issue as superseded by a newer one
  swarm           Swarm management for structured epics

Sync & Data:
  backup          Back up your beads database
  branch          List or create branches
  export          Export issues to JSONL format
  federation      Manage peer-to-peer federation with other workspaces
  import          Import issues from a JSONL file into the database
  restore         Restore full history of a compacted issue from Dolt history
  vc              Version control operations

Setup & Configuration:
  bootstrap       Non-destructive database setup for fresh clones and recovery
  config          Manage configuration settings
  context         Show effective backend identity and repository context
  dolt            Configure Dolt database settings
  forget          Remove a persistent memory
  hooks           Manage git hooks for beads integration
  human           Show essential commands for human users
  info            Show database information
  init            Initialize bd in the current directory
  kv              Key-value store commands
  memories        List or search persistent memories
  onboard         Display minimal snippet for agent instructions file
  prime           Output AI-optimized workflow context
  quickstart      Quick start guide for bd
  recall          Retrieve a specific memory
  remember        Store a persistent memory
  setup           Setup integration with AI editors
  where           Show active beads location

Maintenance:
  compact         Squash old Dolt commits to reduce history size
  doctor          Check and fix beads installation health (start here)
  flatten         Squash all Dolt history into a single commit
  gc              Garbage collect: decay old issues, compact Dolt commits, run Dolt GC
  migrate         Database migration commands
  preflight       Show PR readiness checklist
  purge           Delete closed ephemeral beads to reclaim space
  rename-prefix   Rename the issue prefix for all issues in the database
  rules           Audit and compact Claude rules
  sql             Execute raw SQL against the beads database
  upgrade         Check and manage bd version upgrades
  worktree        Manage git worktrees for parallel development

Integrations & Advanced:
  admin           Administrative commands for database maintenance
  jira            Jira integration commands
  linear          Linear integration commands
  repo            Manage multiple repository configuration

Additional Commands:
  ado             Azure DevOps integration commands
  audit           Record and label agent interactions (append-only JSONL)
  blocked         Show blocked issues
  completion      Generate the autocompletion script for the specified shell
  cook            Compile a formula into a proto (ephemeral by default)
  defer           Defer one or more issues for later
  formula         Manage workflow formulas
  github          GitHub integration commands
  gitlab          GitLab integration commands
  help            Help about any command
  mail            Delegate to mail provider (e.g., gt mail)
  mol             Molecule commands (work templates)
  notion          Notion integration commands
  orphans         Identify orphaned issues (referenced in commits but still open)
  ready           Show ready work (open, no active blockers)
  rename          Rename an issue ID
  ship            Publish a capability for cross-project dependencies
  undefer         Undefer one or more issues (restore to open)
  version         Print version information

Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
  -h, --help                      help for bd
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
  -V, --version                   Print version information

Use "bd [command] --help" for more information about a command.
```

## 6. `bd` issue olusturma, listeleme ve inceleme komutlari

Bu bolum, issue olusturma ve goruntuleme is akisini kapsar.

### `bd create --help`

```text
Create a new issue (or batch from markdown/graph JSON)

Usage:
  bd create [title] [flags]

Aliases:
  create, new

Flags:
      --acceptance string       Acceptance criteria
      --append-notes string     Append to existing notes (with newline separator)
  -a, --assignee string         Assignee
      --body-file string        Read description from file (use - for stdin)
      --context string          Additional context for the issue
      --defer string            Defer until date (issue hidden from bd ready until then). Same formats as --due
      --deps strings            Dependencies in format 'type:id' or 'id' (e.g., 'discovered-from:bd-20,blocks:bd-15' or 'bd-20')
  -d, --description string      Issue description
      --design string           Design notes
      --design-file string      Read design from file (use - for stdin)
      --dry-run                 Preview what would be created without actually creating
      --due string              Due date/time. Formats: +6h, +1d, +2w, tomorrow, next monday, 2025-01-15
      --ephemeral               Create as ephemeral (short-lived, subject to TTL compaction)
  -e, --estimate int            Time estimate in minutes (e.g., 60 for 1 hour)
      --event-actor string      Entity URI who caused this event (requires --type=event)
      --event-category string   Event category (e.g., patrol.muted, agent.started) (requires --type=event)
      --event-payload string    Event-specific JSON data (requires --type=event)
      --event-target string     Entity URI or bead ID affected (requires --type=event)
      --external-ref string     External reference (e.g., 'gh-9', 'jira-ABC')
  -f, --file string             Create multiple issues from markdown file
      --force                   Force creation even if prefix doesn't match database prefix
      --graph string            Create a graph of issues with dependencies from JSON plan file
  -h, --help                    help for create
      --id string               Explicit issue ID (e.g., 'bd-42' for partitioning)
  -l, --labels strings          Labels (comma-separated)
      --metadata string         Set custom metadata (JSON string or @file.json to read from file)
      --mol-type string         Molecule type: swarm (multi-agent), patrol (recurring ops), work (default)
      --no-history              Skip Dolt commit history without making GC-eligible (for permanent agent beads)
      --no-inherit-labels       Don't inherit labels from parent issue
      --notes string            Additional notes
      --parent string           Parent issue ID for hierarchical child (e.g., 'bd-a3f8e9')
  -p, --priority string         Priority (0-4 or P0-P4, 0=highest) (default "2")
      --repo string             Target repository for issue (overrides auto-routing)
      --silent                  Output only the issue ID (for scripting)
      --skills string           Required skills for this issue
      --spec-id string          Link to specification document
      --stdin                   Read description from stdin (alias for --body-file -)
      --title string            Issue title (alternative to positional argument)
  -t, --type string             Issue type (bug|feature|task|epic|chore|decision); custom types require types.custom config; aliases: enhancement/feat→feature, dec/adr→decision (default "task")
      --validate                Validate description contains required sections for issue type
      --waits-for string        Spawner issue ID to wait for (creates waits-for dependency for fanout gate)
      --waits-for-gate string   Gate type: all-children (wait for all) or any-children (wait for first) (default "all-children")
      --wisp-type string        Wisp type for TTL-based compaction: heartbeat, ping, patrol, gc_report, recovery, error, escalation

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```

### `bd list --help`

```text
List issues

Usage:
  bd list [flags]

Flags:
      --all                          Show all issues including closed (overrides default filter)
  -a, --assignee string              Filter by assignee
      --closed-after string          Filter issues closed after date (YYYY-MM-DD or RFC3339)
      --closed-before string         Filter issues closed before date (YYYY-MM-DD or RFC3339)
      --created-after string         Filter issues created after date (YYYY-MM-DD or RFC3339)
      --created-before string        Filter issues created before date (YYYY-MM-DD or RFC3339)
      --defer-after string           Filter issues deferred after date (supports relative: +6h, tomorrow)
      --defer-before string          Filter issues deferred before date (supports relative: +6h, tomorrow)
      --deferred                     Show only issues with defer_until set
      --desc-contains string         Filter by description substring (case-insensitive)
      --due-after string             Filter issues due after date (supports relative: +6h, tomorrow)
      --due-before string            Filter issues due before date (supports relative: +6h, tomorrow)
      --empty-description            Filter issues with empty or missing description
      --exclude-type strings         Exclude issue types from results (comma-separated or repeatable, e.g., --exclude-type=convoy,epic)
      --flat                         Disable tree format and use legacy flat list output
      --format string                Output format: 'digraph' (for golang.org/x/tools/cmd/digraph), 'dot' (Graphviz), or Go template
      --has-metadata-key string      Filter issues that have this metadata key set
  -h, --help                         help for list
      --id string                    Filter by specific issue IDs (comma-separated, e.g., bd-1,bd-5,bd-10)
      --include-gates                Include gate issues in output (normally hidden)
      --include-infra                Include infrastructure beads (agent/rig/role/message) in output
      --include-templates            Include template molecules in output
  -l, --label strings                Filter by labels (AND: must have ALL). Can combine with --label-any
      --label-any strings            Filter by labels (OR: must have AT LEAST ONE). Can combine with --label
      --label-pattern string         Filter by label glob pattern (e.g., 'tech-*' matches tech-debt, tech-legacy)
      --label-regex string           Filter by label regex pattern (e.g., 'tech-(debt|legacy)')
  -n, --limit int                    Limit results (default 50, use 0 for unlimited) (default 50)
      --long                         Show detailed multi-line output for each issue
      --metadata-field stringArray   Filter by metadata field (key=value, repeatable)
      --mol-type string              Filter by molecule type: swarm, patrol, or work
      --no-assignee                  Filter issues with no assignee
      --no-labels                    Filter issues with no labels
      --no-pager                     Disable pager output
      --no-parent                    Exclude child issues (show only top-level issues)
      --no-pinned                    Exclude pinned issues
      --notes-contains string        Filter by notes substring (case-insensitive)
      --overdue                      Show only issues with due_at in the past (not closed)
      --parent string                Filter by parent issue ID (shows children of specified issue)
      --pinned                       Show only pinned issues
      --pretty                       Display issues in a tree format with status/priority symbols
  -p, --priority string              Priority (0-4 or P0-P4, 0=highest)
      --priority-max string          Filter by maximum priority (inclusive, 0-4 or P0-P4)
      --priority-min string          Filter by minimum priority (inclusive, 0-4 or P0-P4)
      --ready                        Show only ready issues (status=open, excludes hooked/in_progress/blocked/deferred)
  -r, --reverse                      Reverse sort order
      --sort string                  Sort by field: priority, created, updated, closed, status, id, title, type, assignee
      --spec string                  Filter by spec_id prefix
  -s, --status string                Filter by stored status (open, in_progress, blocked, deferred, closed). Comma-separated for multiple: --status open,in_progress
      --title string                 Filter by title text (case-insensitive substring match)
      --title-contains string        Filter by title substring (case-insensitive)
      --tree                         Hierarchical tree format (default: true; use --flat to disable) (default true)
  -t, --type string                  Filter by type (bug, feature, task, epic, chore, decision, merge-request, molecule, gate, convoy). Aliases: mr→merge-request, feat→feature, mol→molecule, dec/adr→decision
      --updated-after string         Filter issues updated after date (YYYY-MM-DD or RFC3339)
      --updated-before string        Filter issues updated before date (YYYY-MM-DD or RFC3339)
  -w, --watch                        Watch for changes and auto-update display (implies --pretty)
      --wisp-type string             Filter by wisp type: heartbeat, ping, patrol, gc_report, recovery, error, escalation

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```

### `bd show --help`

```text
Show issue details

Usage:
  bd show [id...] [--id=<id>...] [--current] [flags]

Aliases:
  show, view

Flags:
      --as-of string     Show issue as it existed at a specific commit hash or branch (requires Dolt)
      --children         Show only the children of this issue
      --current          Show the currently active issue (in-progress, hooked, or last touched)
  -h, --help             help for show
      --id stringArray   Issue ID (use for IDs that look like flags, e.g., --id=gt--xyz)
      --local-time       Show timestamps in local time instead of UTC
      --long             Show all available fields (extended metadata, agent identity, gate fields, etc.)
      --refs             Show issues that reference this issue (reverse lookup)
      --short            Show compact one-line output per issue
      --thread           Show full conversation thread (for messages)
  -w, --watch            Watch for changes and auto-refresh display

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```

### `bd close --help`

```text
Close one or more issues.

If no issue ID is provided, closes the last touched issue (from most recent
create, update, show, or close operation).

Usage:
  bd close [id...] [flags]

Aliases:
  close, done

Flags:
      --claim-next       Automatically claim the next highest priority available issue
      --continue         Auto-advance to next step in molecule
  -f, --force            Force close pinned issues or unsatisfied gates
  -h, --help             help for close
      --no-auto          With --continue, show next step but don't claim it
  -r, --reason string    Reason for closing
      --session string   Claude Code session ID (or set CLAUDE_SESSION_ID env var)
      --suggest-next     Show newly unblocked issues after closing

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```

## 7. `bd` bagimlilik, etiket ve sorgu komutlari

Bu bolum, issue'ler arasi iliski kurma, etiketleme ve arama/sorgulama islerini kapsar.

### `bd dep --help`

```text
Manage dependencies between issues.

When called with an issue ID and --blocks flag, creates a blocking dependency:
  bd dep <blocker-id> --blocks <blocked-id>

This is equivalent to:
  bd dep add <blocked-id> <blocker-id>

Examples:
  bd dep bd-xyz --blocks bd-abc    # bd-xyz blocks bd-abc
  bd dep add bd-abc bd-xyz         # Same as above (bd-abc depends on bd-xyz)

Usage:
  bd dep [issue-id] [flags]
  bd dep [command]

Available Commands:
  add         Add a dependency
  cycles      Detect dependency cycles
  list        List dependencies or dependents of one or more issues
  relate      Create a bidirectional relates_to link between issues
  remove      Remove a dependency
  tree        Show dependency tree
  unrelate    Remove a relates_to link between issues

Flags:
  -b, --blocks string   Issue ID that this issue blocks (shorthand for: bd dep add <blocked> <blocker>)
  -h, --help            help for dep

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output

Use "bd dep [command] --help" for more information about a command.
```

### `bd label --help`

```text
Manage issue labels

Usage:
  bd label [command]

Available Commands:
  add         Add a label to one or more issues
  list        List labels for an issue
  list-all    List all unique labels in the database
  propagate   Propagate a label from a parent issue to all its children
  remove      Remove a label from one or more issues

Flags:
  -h, --help   help for label

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output

Use "bd label [command] --help" for more information about a command.
```

### `bd query --help`

```text
Query issues using a simple query language that supports compound filters,
boolean operators, and date-relative expressions.

The query language enables complex filtering that would otherwise require
multiple flags or piping through jq.

Syntax:
  field=value       Equality comparison
  field!=value      Inequality comparison
  field>value       Greater than
  field>=value      Greater than or equal
  field<value       Less than
  field<=value      Less than or equal

Boolean operators (case-insensitive):
  expr AND expr     Both conditions must match
  expr OR expr      Either condition can match
  NOT expr          Negates the condition
  (expr)            Grouping with parentheses

Supported fields:
  status            Stored status (open, in_progress, blocked, deferred, closed). Note: dependency-blocked issues stay "open"; use 'bd blocked' to find them
  priority          Priority level (0-4)
  type              Issue type (bug, feature, task, epic, chore, decision)
  assignee          Assigned user (use "none" for unassigned)
  owner             Issue owner
  label             Issue label (use "none" for unlabeled)
  title             Search in title (contains)
  description       Search in description (contains, "none" for empty)
  notes             Search in notes (contains)
  created           Creation date/time
  updated           Last update date/time
  closed            Close date/time
  id                Issue ID (supports wildcards: bd-*)
  spec              Spec ID (supports wildcards)
  pinned            Boolean (true/false)
  ephemeral         Boolean (true/false)
  template          Boolean (true/false)
  parent            Parent issue ID
  mol_type          Molecule type (swarm, patrol, work)

Date values:
  Relative durations: 7d (7 days ago), 24h (24 hours ago), 2w (2 weeks ago)
  Absolute dates: 2025-01-15, 2025-01-15T10:00:00Z
  Natural language: tomorrow, "next monday", "in 3 days"

Examples:
  bd query "status=open AND priority>1"
  bd query "status=open AND priority<=2 AND updated>7d"
  bd query "(status=open OR status=blocked) AND priority<2"
  bd query "type=bug AND label=urgent"
  bd query "NOT status=closed"
  bd query "assignee=none AND type=task"
  bd query "created>30d AND status!=closed"
  bd query "label=frontend OR label=backend"
  bd query "title=authentication AND priority=0"

Usage:
  bd query [expression] [flags]

Flags:
  -a, --all           Include closed issues (default: exclude closed)
  -h, --help          help for query
  -n, --limit int     Limit results (default: 50, 0 = unlimited) (default 50)
      --long          Show detailed multi-line output for each issue
      --parse-only    Only parse the query and show the AST (for debugging)
  -r, --reverse       Reverse sort order
      --sort string   Sort by field: priority, created, updated, closed, status, id, title, type, assignee

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```

### `bd search --help`

```text
Search issues across title and ID (excludes closed issues by default).

ID-like queries (e.g., "bd-123", "hq-319") use fast exact/prefix matching.
Text queries search titles. Use --desc-contains for description search.
Use --status all to include closed issues.

Examples:
  bd search "authentication bug"
  bd search "login" --status open
  bd search "database" --label backend --limit 10
  bd search --query "performance" --assignee alice
  bd search "bd-5q" # Search by partial ID (fast prefix match)
  bd search "security" --priority-min 0 --priority-max 2
  bd search "bug" --created-after 2025-01-01
  bd search "refactor" --status all  # Include closed issues
  bd search "bug" --sort priority
  bd search "task" --sort created --reverse
  bd search "api" --desc-contains "endpoint"
  bd search "cleanup" --no-assignee --no-labels

Usage:
  bd search [query] [flags]

Flags:
  -a, --assignee string              Filter by assignee
      --closed-after string          Filter issues closed after date (YYYY-MM-DD or RFC3339)
      --closed-before string         Filter issues closed before date (YYYY-MM-DD or RFC3339)
      --created-after string         Filter issues created after date (YYYY-MM-DD or RFC3339)
      --created-before string        Filter issues created before date (YYYY-MM-DD or RFC3339)
      --desc-contains string         Filter by description substring (case-insensitive)
      --empty-description            Filter issues with empty or missing description
      --external-contains string     Filter by external ref substring (case-insensitive)
      --has-metadata-key string      Filter issues that have this metadata key set
  -h, --help                         help for search
  -l, --label strings                Filter by labels (AND: must have ALL)
      --label-any strings            Filter by labels (OR: must have AT LEAST ONE)
  -n, --limit int                    Limit results (default: 50) (default 50)
      --long                         Show detailed multi-line output for each issue
      --metadata-field stringArray   Filter by metadata field (key=value, repeatable)
      --no-assignee                  Filter issues with no assignee
      --no-labels                    Filter issues with no labels
      --notes-contains string        Filter by notes substring (case-insensitive)
      --priority-max string          Filter by maximum priority (inclusive, 0-4 or P0-P4)
      --priority-min string          Filter by minimum priority (inclusive, 0-4 or P0-P4)
      --query string                 Search query (alternative to positional argument)
  -r, --reverse                      Reverse sort order
      --sort string                  Sort by field: priority, created, updated, closed, status, id, title, type, assignee
  -s, --status string                Filter by stored status (open, in_progress, blocked, deferred, closed, all). Default excludes closed; use 'all' to include closed. Note: dependency-blocked issues use 'bd blocked'
  -t, --type string                  Filter by type (bug, feature, task, epic, chore, decision, merge-request, molecule, gate)
      --updated-after string         Filter issues updated after date (YYYY-MM-DD or RFC3339)
      --updated-before string        Filter issues updated before date (YYYY-MM-DD or RFC3339)

Global Flags:
      --actor string              Actor name for audit trail (default: $BEADS_ACTOR, git user.name, $USER)
      --db string                 Database path (default: auto-discover .beads/*.db)
      --dolt-auto-commit string   Dolt auto-commit policy (off|on|batch). 'on': commit after each write. 'batch': defer commits to bd dolt commit; uncommitted changes persist in the working set until then. SIGTERM/SIGHUP flush pending batch commits. Default: off. Override via config key dolt.auto-commit
      --json                      Output in JSON format
      --profile                   Generate CPU profile for performance analysis
  -q, --quiet                     Suppress non-essential output (errors only)
      --readonly                  Read-only mode: block write operations (for worker sandboxes)
      --sandbox                   Sandbox mode: disables auto-sync
  -v, --verbose                   Enable verbose/debug output
```
