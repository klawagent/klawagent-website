---
title: "We Built a 3-Layer Memory System for Our AI Agent"
description: "Most AI agents forget everything between conversations. We built a memory system that keeps context — decisions, lessons, state — so your agent gets smarter."
date: 2026-02-24
author: KlawAgent Team
image: /blog-images/three-layer-memory-system.png
draft: false
---

Most AI agents have a hard problem: they forget everything between conversations. You explain something on Monday, and on Tuesday it's gone. They start fresh every session with no memory of what happened yesterday, last week, or last month.

That's not useful for a real business. We needed an agent that remembers.

We just built a three-layer memory system for our internal AI agent (Rusty), and it's already changing how we work. Here's what we did and why it matters for any business running AI agents.

## The Problem: Context Doesn't Survive Sessions

Here's what happens with most AI agent setups:

1. You have a conversation about a project
2. The agent learns useful things
3. Session ends
4. **Everything is lost**

The next day, you either re-explain everything, or the agent makes mistakes because it doesn't remember what you decided yesterday.

For a small business, this is a dealbreaker. You can't have an agent that needs constant hand-holding.

## The Solution: Three Layers That Reinforce Each Other

We built a memory architecture with three distinct layers, each serving a different purpose:

### Layer 1: Knowledge Graph — Durable Facts

This is structured, long-lived information organized by topic. Project status. Client preferences. Technical decisions. Things that are true this month, not just today.

```
knowledge/
├── projects/        # Active project docs
├── people/         # Client and team context
├── areas/          # Domain knowledge (billing, auth, integrations)
├── resources/      # Tech stack, vendor APIs, playbooks
├── hard-rules.md   # Critical operational rules
└── lessons-learned.md  # Mistakes and what we learned
```

The key insight: this layer doesn't get written to during conversations. It gets written to by an automated consolidation process that runs every night.

### Layer 2: Daily Notes — Session Logging

Every meaningful conversation gets logged to `memory/YYYY-MM-DD.md`. Not just heartbeats — every conversation. Decisions made. Action items. Problems solved. Lessons learned.

This is raw material. It's messy. It's not meant to be read by humans directly.

### Layer 3: Nightly Consolidation — The Self-Improving Loop

Here's where it gets interesting. A cron job runs every night at 11pm that:

1. Reads today's daily notes
2. Extracts key decisions, action items, and lessons
3. Writes a summary at the top of the daily note
4. **Promotes durable facts to the knowledge graph**
5. Posts a 2-line summary to our team Slack

This is the self-reinforcing loop. Conversations → daily notes → nightly consolidation → knowledge graph. Over time, the agent becomes more knowledgeable because it learns from every interaction.

## Why This Matters for Your Business

Here's what this architecture actually enables:

### New Projects Get Context From Day One

When we start a new client project, we create a knowledge file. Every decision, every lesson, every configuration change gets captured. Future conversations about that project have all the context available — no more "wait, didn't we decide that last week?"

### Mistakes Don't Repeat

We have a `hard-rules.md` file with critical operational rules. Things like "always use OAuth refresh tokens for Google services, never service accounts" — lessons we learned the hard way. Now they're captured permanently.

### The Agent Actually Knows Your Business

Over time, the knowledge graph builds up. Your agent knows your communication preferences. Your team's working style. Your technical stack. It's not starting from zero every conversation.

### It's Self-Maintaining

We didn't build a system that requires manual updating. The nightly consolidation handles it automatically. The knowledge graph grows without us having to remember to update it.

## The Technical Details

For the curious, here's what runs under the hood:

- **Daily notes**: Markdown files in `memory/YYYY-MM-DD.md`
- **Knowledge graph**: Structured docs in `knowledge/`
- **Consolidation**: Python script triggered by cron, runs in dry-run mode for the first week (proposes updates, doesn't write)
- **Slack integration**: 2-line summary posted after each consolidation

We also upgraded the fallback model to Claude Sonnet 4.6 specifically for memory-intensive tasks — better reasoning for extracting and organizing knowledge.

## What This Means for You

If you're running AI agents for your business, the takeaway is simple: **context is everything.**

An agent that forgets between sessions is barely useful. An agent that remembers — that learns from every conversation — becomes a real team member.

The three-layer approach works because:

1. **Conversation logging** captures everything (no manual effort)
2. **Nightly consolidation** distills signal from noise
3. **Knowledge graph** makes context searchable and usable
4. **The loop improves itself** — every day the agent knows more

## What's Next

We're in week one of this system. The consolidation is running in dry-run mode, proposing knowledge updates for us to review before it starts writing automatically. Once we're confident in the output, we flip it to live mode and the system becomes fully autonomous.

We're also planning to extend this to client projects — every new client onboarding gets a knowledge file from day one, so the agent understands their context from the start.

---

If you want to see what a well-configured AI agent looks like in practice, [book a 15-minute call](https://calendar.app.google/your-link) and we'll walk you through how memory systems like this make a real difference for small business operations.
