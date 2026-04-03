import { Command } from '../Command';
import { trashStore } from '../../../store/TrashStore';
import { renameWorkspace } from '../../../services/api';

export class DeleteWorkspaceCommand implements Command {
    constructor(private wsId: number, private onUpdate: () => void, private onRestore?: () => void) { }
    execute() {
        trashStore.softDeleteWorkspace(this.wsId);
        this.onUpdate();
    }
    undo() {
        trashStore.restoreWorkspace(this.wsId);
        if (this.onRestore) this.onRestore();
        this.onUpdate();
    }
}

export class InsertWorkspaceCommand implements Command {
    constructor(private wsId: number, private onUpdate: () => void) { }
    execute() {
        trashStore.restoreWorkspace(this.wsId);
        this.onUpdate();
    }
    undo() {
        trashStore.softDeleteWorkspace(this.wsId);
        this.onUpdate();
    }
}

export class RenameWorkspaceCommand implements Command {
    constructor(
        private wsId: number,
        private oldName: string,
        private newName: string,
        private onUpdate: () => void
    ) { }
    async execute() {
        await renameWorkspace(this.wsId, this.newName);
        this.onUpdate();
    }
    async undo() {
        await renameWorkspace(this.wsId, this.oldName);
        this.onUpdate();
    }
}
