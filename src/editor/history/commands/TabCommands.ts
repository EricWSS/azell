import { Command } from '../Command';
import { trashStore } from '../../../store/TrashStore';
import { renameTab } from '../../../services/api';

export class DeleteTabCommand implements Command {
    constructor(private tabId: number, private onUpdate: () => void, private onRestore?: () => void) { }
    execute() {
        trashStore.softDeleteTab(this.tabId);
        this.onUpdate();
    }
    undo() {
        trashStore.restoreTab(this.tabId);
        if (this.onRestore) this.onRestore();
        this.onUpdate();
    }
}

export class InsertTabCommand implements Command {
    constructor(private tabId: number, private onUpdate: () => void) { }
    execute() {
        trashStore.restoreTab(this.tabId);
        this.onUpdate();
    }
    undo() {
        trashStore.softDeleteTab(this.tabId);
        this.onUpdate();
    }
}

export class RenameTabCommand implements Command {
    constructor(
        private tabId: number,
        private oldTitle: string,
        private newTitle: string,
        private onUpdate: () => void
    ) { }
    async execute() {
        await renameTab(this.tabId, this.newTitle);
        this.onUpdate();
    }
    async undo() {
        await renameTab(this.tabId, this.oldTitle);
        this.onUpdate();
    }
}
