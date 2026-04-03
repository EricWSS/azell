import { Command } from '../Command';
import { trashStore } from '../../../store/TrashStore';
import { updateCell, moveCellDown, moveCellUp } from '../../../services/api';

export class DeleteCellCommand implements Command {
    constructor(private cellId: number, private onUpdate: () => void) { }
    execute() {
        trashStore.softDeleteCell(this.cellId);
        this.onUpdate();
    }
    undo() {
        trashStore.restoreCell(this.cellId);
        this.onUpdate();
    }
}

export class InsertCellCommand implements Command {
    // After insertion happens initially, undo simply soft-deletes it.
    constructor(private cellId: number, private onUpdate: () => void) { }
    execute() {
        trashStore.restoreCell(this.cellId);
        this.onUpdate();
    }
    undo() {
        trashStore.softDeleteCell(this.cellId);
        this.onUpdate();
    }
}

export class EditCellCommand implements Command {
    constructor(
        private cellId: number,
        private oldContent: string,
        private newContent: string,
        private onUpdate: () => void
    ) { }
    async execute() {
        await updateCell(this.cellId, this.newContent);
        this.onUpdate();
    }
    async undo() {
        await updateCell(this.cellId, this.oldContent);
        this.onUpdate();
    }
}

export class MoveCellCommand implements Command {
    constructor(
        private cellId: number,
        private direction: 'up' | 'down',
        private onUpdate: () => void
    ) { }
    async execute() {
        if (this.direction === 'up') await moveCellUp(this.cellId);
        else await moveCellDown(this.cellId);
        this.onUpdate();
    }
    async undo() {
        if (this.direction === 'up') await moveCellDown(this.cellId);
        else await moveCellUp(this.cellId);
        this.onUpdate();
    }
}
