import { Command } from '../Command';
import { trashStore } from '../../../store/TrashStore';
import { renameWorkspace, createWorkspace } from '../../../services/api';

export class CreateWorkspaceCommand implements Command {
    private wsId: number | null = null;
    constructor(private name: string, private onSelect: (id: number | null) => void, private onUpdate: () => void) { }

    async execute() {
        if (this.wsId === null) {
            const ws = await createWorkspace(this.name);
            this.wsId = ws.id;
        } else {
            trashStore.restoreWorkspace(this.wsId);
        }
        this.onSelect(this.wsId);
        this.onUpdate();
    }

    undo() {
        if (this.wsId !== null) {
            trashStore.softDeleteWorkspace(this.wsId);
            this.onSelect(null);
            this.onUpdate();
        }
    }
}

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
