import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForUpdates() {
  try {
    console.log("Checking for updates...");
    const update = await check();
    if (update?.available) {
      console.log(`Update to ${update.version} is available!`);
      console.log(`Downloading and installing update from ${update.date}...`);
      
      // Automatic silent install and relaunch
      await update.downloadAndInstall();
      
      console.log(`Update installed. Relaunching application...`);
      await relaunch();
    } else {
      console.log("Application is up to date.");
    }
  } catch (error) {
    console.warn("Failed to check for or install updates:", error);
  }
}
