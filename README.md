# suno-cli

A command-line tool for downloading content from Suno.

## Installation

You can install the CLI tool globally using npm:

```bash
npm install -g suno-cli
```

Or using bun:

```bash
bun install -g suno-cli
```

## Usage

### Single URL Download
Download a single song:
```bash
suno <suno_url>
```

For example:
```bash
suno https://app.suno.ai/your-song-url
```

### Multiple URLs Download
Download multiple songs by providing URLs separated by newlines within quotes:
```bash
suno "<suno_url1>
<suno_url2>
<suno_url3>"
```

For example:
```bash
suno "https://app.suno.ai/your-first-song-url
https://app.suno.ai/your-second-song-url
https://app.suno.ai/your-third-song-url"
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

To deploy locally:
```bash
bun run deploy
```
This will build the project and create a global link, allowing you to use the `suno` command globally.

## Building

To build the CLI:

```bash
bun run build
```

This project uses [Bun](https://bun.sh) as its JavaScript/TypeScript runtime.
