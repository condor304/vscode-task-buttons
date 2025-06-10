# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile automatically
- `npm run vscode:prepublish` - Prepare for publishing (runs compile)

## Testing the Extension

- Press F5 in VSCode to launch Extension Development Host
- Create a `.vscode/task-buttons.json` in a test workspace to configure buttons
- Use the example configuration from `example-task-buttons.json`

## Architecture

This is a VSCode extension that adds configurable task buttons to the status bar. The main components are:

### Core Architecture
- **TaskButtonManager**: Central class managing all button lifecycle and configuration
- **Configuration System**: Loads `.vscode/task-buttons.json` from workspace root
- **File Watcher**: Automatically updates buttons when configuration changes
- **VSCode Task Integration**: Executes tasks defined in workspace `tasks.json`

### Key Files
- `src/extension.ts`: Main extension entry point with activate/deactivate lifecycle
- `example-task-buttons.json`: Example configuration file showing button structure

### Configuration Structure
Each button requires:
- `name`: Display text
- `task`: Corresponding task name from `tasks.json`
- `icon` (optional): Emoji or text icon
- `tooltip` (optional): Hover text

### Extension Commands
- `taskButtons.executeTask`: Internal command to run tasks
- `taskButtons.refresh`: Manual refresh command for troubleshooting

The extension loads configuration from `.vscode/task-buttons.json`, creates status bar items for each button, and executes the corresponding VSCode tasks when clicked.