# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js utility project for Hebrew calendar operations, built on top of `@hebcal/core` v6. Requires Node.js >= 18.0.0.

## Key Dependency

`@hebcal/core` is the primary library. It provides:
- Hebrew date conversions via `@hebcal/hdate`
- Jewish holiday and event calculations
- Candle lighting / zmanim times via `@hebcal/noaa` (NOAA astronomy)
- Temporal API polyfill (`temporal-polyfill`)
- LRU caching (`quick-lru`)

## Project Status

This project is in early stages — only `package.json` and `package-lock.json` exist. No scripts, build tooling, test framework, or source files have been set up yet. **Always confirm with the user before creating files or choosing a direction.**

## Development Setup

```bash
npm install
```

No build, test, or lint scripts are defined yet. Before adding any tooling, confirm choices with the user.
