"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class TaskButtonManager {
    constructor(context) {
        this.statusBarItems = [];
        this.context = context;
    }
    async initialize() {
        await this.loadAndCreateButtons();
        this.setupConfigWatcher();
    }
    async loadAndCreateButtons() {
        this.clearExistingButtons();
        const config = await this.loadConfig();
        if (!config) {
            return;
        }
        for (const buttonConfig of config.buttons) {
            this.createStatusBarButton(buttonConfig);
        }
    }
    async loadConfig() {
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
            return JSON.parse(configContent);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load task buttons config: ${error}`);
            return null;
        }
    }
    createStatusBarButton(config) {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
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
    async executeTask(taskName) {
        try {
            const tasks = await vscode.tasks.fetchTasks();
            const task = tasks.find(t => t.name === taskName);
            if (!task) {
                vscode.window.showErrorMessage(`Task "${taskName}" not found in tasks.json`);
                return;
            }
            await vscode.tasks.executeTask(task);
            vscode.window.showInformationMessage(`Executing task: ${taskName}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to execute task "${taskName}": ${error}`);
        }
    }
    setupConfigWatcher() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return;
        }
        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'task-buttons.json');
        const configPattern = new vscode.RelativePattern(workspaceFolders[0], '.vscode/task-buttons.json');
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
    clearExistingButtons() {
        this.statusBarItems.forEach(item => item.dispose());
        this.statusBarItems = [];
    }
    dispose() {
        this.clearExistingButtons();
        if (this.configWatcher) {
            this.configWatcher.dispose();
        }
    }
    getExecuteTaskCommand() {
        return vscode.commands.registerCommand('taskButtons.executeTask', (taskName) => {
            this.executeTask(taskName);
        });
    }
    getRefreshCommand() {
        return vscode.commands.registerCommand('taskButtons.refresh', () => {
            this.loadAndCreateButtons();
            vscode.window.showInformationMessage('Task buttons refreshed');
        });
    }
}
let taskButtonManager;
function activate(context) {
    taskButtonManager = new TaskButtonManager(context);
    context.subscriptions.push(taskButtonManager.getExecuteTaskCommand(), taskButtonManager.getRefreshCommand());
    taskButtonManager.initialize();
}
exports.activate = activate;
function deactivate() {
    if (taskButtonManager) {
        taskButtonManager.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map