import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TaskButtonConfig {
    name: string;
    task: string;
    icon?: string;
    tooltip?: string;
}

interface TaskButtonsConfig {
    buttons: TaskButtonConfig[];
}

class TaskButtonManager {
    private statusBarItems: vscode.StatusBarItem[] = [];
    private configWatcher: vscode.FileSystemWatcher | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async initialize() {
        await this.loadAndCreateButtons();
        this.setupConfigWatcher();
    }

    private async loadAndCreateButtons() {
        this.clearExistingButtons();
        
        const config = await this.loadConfig();
        if (!config) {
            return;
        }

        for (const buttonConfig of config.buttons) {
            this.createStatusBarButton(buttonConfig);
        }
    }

    private async loadConfig(): Promise<TaskButtonsConfig | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'task-buttons.json');
        
        try {
            if (!fs.existsSync(configPath)) {
                return null;
            }

            const configContent = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configContent) as TaskButtonsConfig;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load task buttons config: ${error}`);
            return null;
        }
    }

    private createStatusBarButton(config: TaskButtonConfig) {
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

        statusBarItem.text = config.icon ? `${config.icon} ${config.name}` : config.name;
        statusBarItem.tooltip = config.tooltip || `Execute task: ${config.task}`;
        statusBarItem.command = {
            command: 'taskButtons.executeTask',
            arguments: [config.task],
            title: 'Execute Task'
        };

        statusBarItem.show();
        this.statusBarItems.push(statusBarItem);
    }

    private async executeTask(taskName: string) {
        try {
            const tasks = await vscode.tasks.fetchTasks();
            const task = tasks.find(t => t.name === taskName);
            
            if (!task) {
                vscode.window.showErrorMessage(`Task "${taskName}" not found in tasks.json`);
                return;
            }

            await vscode.tasks.executeTask(task);
            vscode.window.showInformationMessage(`Executing task: ${taskName}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute task "${taskName}": ${error}`);
        }
    }

    private setupConfigWatcher() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return;
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'task-buttons.json');
        const configPattern = new vscode.RelativePattern(
            workspaceFolders[0],
            '.vscode/task-buttons.json'
        );

        this.configWatcher = vscode.workspace.createFileSystemWatcher(configPattern);
        
        this.configWatcher.onDidChange(() => {
            this.loadAndCreateButtons();
        });

        this.configWatcher.onDidCreate(() => {
            this.loadAndCreateButtons();
        });

        this.configWatcher.onDidDelete(() => {
            this.clearExistingButtons();
        });

        this.context.subscriptions.push(this.configWatcher);
    }

    private clearExistingButtons() {
        this.statusBarItems.forEach(item => item.dispose());
        this.statusBarItems = [];
    }

    public dispose() {
        this.clearExistingButtons();
        if (this.configWatcher) {
            this.configWatcher.dispose();
        }
    }

    public getExecuteTaskCommand() {
        return vscode.commands.registerCommand('taskButtons.executeTask', (taskName: string) => {
            this.executeTask(taskName);
        });
    }

    public getRefreshCommand() {
        return vscode.commands.registerCommand('taskButtons.refresh', () => {
            this.loadAndCreateButtons();
            vscode.window.showInformationMessage('Task buttons refreshed');
        });
    }
}

let taskButtonManager: TaskButtonManager;

export function activate(context: vscode.ExtensionContext) {
    taskButtonManager = new TaskButtonManager(context);
    
    context.subscriptions.push(
        taskButtonManager.getExecuteTaskCommand(),
        taskButtonManager.getRefreshCommand()
    );

    taskButtonManager.initialize();
}

export function deactivate() {
    if (taskButtonManager) {
        taskButtonManager.dispose();
    }
}