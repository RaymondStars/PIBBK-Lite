import { ipcRenderer } from 'electron';

export abstract class Parser {

    public abstract parseNovelName(url: string): string;

    public abstract parseChapterTitle(url: string): string;

    public abstract parseContent(url: string): string;

    public async downloadHtml(url:string, encoding:string = 'UTF-8'): Promise<string> {
        return ipcRenderer.invoke('download-html', url) as Promise<string>;
    }
}