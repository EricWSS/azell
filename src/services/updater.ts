import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'upToDate' }
  | { state: 'available'; update: Update }
  | { state: 'downloading'; progress: number }
  | { state: 'readyToRestart' }
  | { state: 'error'; message: string };

export type StatusCallback = (status: UpdateStatus) => void;

/**
 * Only checks for updates. Returns the Update object if available, or null.
 */
export async function checkForUpdates(onStatus?: StatusCallback): Promise<Update | null> {
  const emit = (s: UpdateStatus) => onStatus?.(s);
  try {
    emit({ state: 'checking' });
    const update: Update | null = await check();

    if (!update?.available) {
      emit({ state: 'upToDate' });
      return null;
    }

    emit({
      state: 'available',
      update: update,
    });

    return update;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    emit({ state: 'error', message: msg });
    console.error('[Updater]', msg);
    return null;
  }
}

/**
 * Explicitly triggers the download and installation of the provided update.
 * Does NOT restart the app automatically.
 */
export async function downloadAndInstallUpdate(update: Update, onStatus?: StatusCallback): Promise<void> {
  const emit = (s: UpdateStatus) => onStatus?.(s);
  try {
    let downloaded = 0;
    let total = 0;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          total = event.data.contentLength ?? 0;
          emit({ state: 'downloading', progress: 0 });
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          emit({
            state: 'downloading',
            progress: total > 0 ? Math.round((downloaded / total) * 100) : 0,
          });
          break;
        case 'Finished':
          emit({ state: 'readyToRestart' });
          break;
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    emit({ state: 'error', message: msg });
    console.error('[Updater Install Error]', msg);
  }
}

/**
 * Relaunches the application to apply the installed update.
 */
export async function relaunchApp(): Promise<void> {
  try {
    await relaunch();
  } catch (error) {
    console.error('[Updater Relaunch Error]', error);
  }
}
