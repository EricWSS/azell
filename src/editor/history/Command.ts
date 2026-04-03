export interface Command {
    /** Executes the action and applies it to the state/backend */
    execute(): Promise<void> | void;
    /** Reverses the action mathematically or restores state via the API/Context */
    undo(): Promise<void> | void;
}
