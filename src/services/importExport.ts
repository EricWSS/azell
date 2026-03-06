import { open } from '@tauri-apps/plugin-dialog';
import { exists, mkdir, copyFile, readTextFile, readFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir, join, basename, dirname } from '@tauri-apps/api/path';
import { getTabs, getCells, getWorkspaces, createWorkspace, createTab, createCell, saveImageFile } from './api';
import type { Workspace } from '../types';

export async function exportWorkspaceById(workspaceId: number) {
    const workspaces = await getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
        await exportWorkspace(workspace);
    }
}

export async function exportWorkspace(workspace: Workspace) {
    // 1) Open folder picker
    const selectedFolder = await open({
        directory: true,
        multiple: false,
        title: "Export Workspace"
    });

    if (!selectedFolder || typeof selectedFolder !== "string") return;

    // 2) Create folder using the workspace name
    const safeName = workspace.name.replace(/[^a-zA-Z0-9- \u00C0-\u00FF]/g, '_').trim() || "Workspace";
    const exportPath = await join(selectedFolder, safeName);

    if (!(await exists(exportPath))) {
        await mkdir(exportPath, { recursive: true });
    }

    const imagesPath = await join(exportPath, 'images');
    let imagesDirCreated = false;

    const appDataPath = await appDataDir();
    const tabs = await getTabs(workspace.id);

    for (const tab of tabs) {
        const cells = await getCells(tab.id);
        if (cells.length === 0) continue;

        // Export in order based on position
        cells.sort((a, b) => a.position - b.position);

        let markdownContent = '';

        for (const cell of cells) {
            if (cell.cell_type === 0) { // markdown
                markdownContent += cell.content + '\n\n\n';
            } else if (cell.cell_type === 1) { // image
                if (!imagesDirCreated) {
                    if (!(await exists(imagesPath))) {
                        await mkdir(imagesPath, { recursive: true });
                    }
                    imagesDirCreated = true;
                }

                // cell.content is relative like 'images/b9fdf4fe-d54b-4b15-9c16-5bcfa4ca9bf3.png'
                const filename = await basename(cell.content);
                const sourcePath = await join(appDataPath, cell.content);
                const targetPath = await join(imagesPath, filename);

                try {
                    if (await exists(sourcePath)) {
                        await copyFile(sourcePath, targetPath);
                    }
                    markdownContent += `![image](images/${filename})\n\n\n`;
                } catch (e) {
                    console.error("Failed to copy image", e);
                    markdownContent += `![image](${cell.content})\n\n\n`;
                }
            }
        }

        const safeTabName = tab.title.replace(/[^a-zA-Z0-9- \u00C0-\u00FF]/g, '_').trim() || "Tab";
        const tabFilePath = await join(exportPath, `${safeTabName}.md`);

        // Clean up trailing exact \n\n\n
        let finalContent = markdownContent.trim() + '\n';
        await writeTextFile(tabFilePath, finalContent);
    }
}

export async function importMarkdown() {
    // 1) Open file picker
    const selectedFile = await open({
        multiple: false,
        filters: [{
            name: 'Markdown',
            extensions: ['md', 'markdown']
        }],
        title: "Import Markdown"
    });

    if (!selectedFile || typeof selectedFile !== "string") return;

    const content = await readTextFile(selectedFile);
    if (!content.trim()) return;

    // Generate workspace name from filename
    const filename = await basename(selectedFile);
    let workspaceName = filename;
    const lastDot = filename.lastIndexOf('.');
    if (lastDot > 0) {
        workspaceName = filename.slice(0, lastDot);
    }

    if (!workspaceName.trim()) workspaceName = "Imported Workspace";

    // Create New Workspace -> One Tab
    const workspace = await createWorkspace(workspaceName);
    const tab = await createTab(workspace.id, "Imported Notes");

    // Split blocks by 2 consecutive newlines
    const blocks = content.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);
    const sourceDir = await dirname(selectedFile);

    let position = 1000;

    for (const block of blocks) {
        // Regex: ![alt](path)
        const imageRegex = /^!\[(.*?)\]\((.*?)\)$/;
        const match = block.match(imageRegex);

        if (match) {
            const imagePath = match[2];
            try {
                const absImagePath = await join(sourceDir, imagePath);

                // Read image binary data and convert to number array
                const bytes = await readFile(absImagePath);
                const numArray = Array.from(bytes);

                // Store inside app data
                const internalImagePath = await saveImageFile(numArray);

                await createCell(tab.id, 1, internalImagePath, position);
            } catch (e) {
                console.error("Failed to import image", e);
                // fallback to markdown cell if image file not found or invalid
                await createCell(tab.id, 0, block, position);
            }
        } else {
            // Text cell
            await createCell(tab.id, 0, block, position);
        }

        position += 1000;
    }

    return workspace.id;
}
