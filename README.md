# @suno/cli

A command-line tool for downloading content from Suno.

## Installation

You can install the CLI tool globally using npm:

```bash
npm install -g @suno/cli
```

Or using bun:

```bash
bun install -g @suno/cli
```

## Usage

```bash
suno <suno_url>
```

For example:
```bash
suno https://app.suno.ai/your-song-url
```

The tool will download:
- Cover image (if available)
- Audio file

Files will be saved in your current working directory.

## Development

To install dependencies:

```bash
bun install
```

To run locally:

```bash
bun run start <suno_url>
```

To watch for changes during development:

```bash
bun run dev <suno_url>
```

## Building

To build the CLI:

```bash
bun run build
```

This project uses [Bun](https://bun.sh) as its JavaScript/TypeScript runtime.
