# Task Buttons VSCode Extension

A VSCode extension that adds configurable task buttons to the status bar for quick execution of tasks defined in your workspace's `tasks.json`.

## Features

- **Workspace-specific configuration**: Each workspace can have its own set of task buttons
- **Configurable buttons**: Customize button names, icons, and tooltips
- **Live configuration updates**: Changes to the configuration file are automatically applied
- **Task integration**: Executes tasks directly from your workspace's `tasks.json`

## Setup

1. Install the extension
2. Create a `.vscode/task-buttons.json` file in your workspace root
3. Configure your task buttons (see configuration below)
4. The buttons will automatically appear in the status bar

## Configuration

Create a `.vscode/task-buttons.json` file in your workspace with the following structure:

```json
{
  "buttons": [
    {
      "name": "Build",
      "task": "build",
      "icon": "🔨",
      "tooltip": "Build the project"
    },
    {
      "name": "Test",
      "task": "test",
      "icon": "🧪",
      "tooltip": "Run tests"
    },
    {
      "name": "Start",
      "task": "dev",
      "icon": "▶️"
    }
  ]
}
```

### Configuration Options

- `name` (required): Display name for the button
- `task` (required): Name of the task from `tasks.json` to execute
- `icon` (optional): Icon to display before the button name (emoji or text)
- `tooltip` (optional): Tooltip text when hovering over the button

## Example Workspace Setup

### 1. tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "npm run build"
    },
    {
      "label": "test",
      "type": "shell",
      "command": "npm test"
    },
    {
      "label": "dev",
      "type": "shell",
      "command": "npm run dev"
    }
  ]
}
```

### 2. task-buttons.json
```json
{
  "buttons": [
    {
      "name": "Build",
      "task": "build",
      "icon": "🔨",
      "tooltip": "Build the project"
    },
    {
      "name": "Test",
      "task": "test",
      "icon": "🧪",
      "tooltip": "Run all tests"
    },
    {
      "name": "Dev Server",
      "task": "dev",
      "icon": "🚀",
      "tooltip": "Start development server"
    }
  ]
}
```

## Commands

The extension provides the following commands:

- `Task Buttons: Refresh` - Manually refresh the task buttons (useful if configuration changes aren't detected)

## How It Works

1. The extension loads on VSCode startup
2. It looks for `.vscode/task-buttons.json` in the current workspace
3. For each button configuration, it creates a status bar item
4. When clicked, the button executes the corresponding task from `tasks.json`
5. The extension watches for changes to the configuration file and updates buttons automatically

## Development

To set up the extension for development:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open in VSCode and press F5 to launch a new Extension Development Host
4. Test the extension in the development environment

## Requirements

- VSCode version 1.74.0 or higher
- Workspace with `tasks.json` file containing the tasks you want to execute

## License

MIT