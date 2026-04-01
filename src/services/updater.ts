import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'upToDate' }
  | { state: 'available'; version: string; date: string | null | undefined }
  | { state: 'downloading'; progress: number }
  | { state: 'installing' }
  | { state: 'error'; message: string };

export type StatusCallback = (status: UpdateStatus) => void;

export async function checkForUpdates(onStatus?: StatusCallback): Promise<void> {
  const emit = (s: UpdateStatus) => onStatus?.(s);
  try {
    emit({ state: 'checking' });

    const update: Update | null = await check();

    if (!update?.available) {
      emit({ state: 'upToDate' });
      return;
    }

    emit({
      state: 'available',
      version: update.version,
      date: update.date,
    });

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
          emit({ state: 'installing' });
          break;
      }
    });

    await relaunch();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    emit({ state: 'error', message: msg });
    console.error('[Updater]', msg);
  }
}
