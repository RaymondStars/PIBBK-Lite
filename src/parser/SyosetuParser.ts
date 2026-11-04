import { Parser } from './Parser';
import * as cheerio from 'cheerio';

export class SyosetuParser extends Parser {

    public parseNovelName(html: string):string {
        const $ = cheerio.load(html, { decodeEntities: false });
        return $('#novel_title').first().text().trim()
            || $('.novel_title').first().text().trim()
            || $('.p-novel__series-title').first().text().trim()
            || $('.p-novel__series a').first().text().trim()
            || $('.margin_r20').first().text().trim();
    }

    public parseChapterTitle(html: string):string {
        const $ = cheerio.load(html, { decodeEntities: false });
        const currentTitle = $('.p-novel__title').first().text().trim();
        if (currentTitle) {
            return currentTitle;
        }

        let pattern = /<p class="novel_subtitle">(.*?)<\/p>/gsm;
        let match = pattern.exec(html);
        let title;
        if (match && 1 in match) {
            title = match[1];
        } else {
            pattern = /<p class="chapter_title">(.*?)<\/p>/gsm;
            match = pattern.exec(html);
            if (match && 1 in match) {
                title = match[1];
            }
        }

        return title;
    }

    public parseContent(html: string):string {
        const $ = cheerio.load(html, {
            normalizeWhitespace: true,
            xmlMode: false,
            decodeEntities: false
        });
        let content = '';
        $('#novel_honbun p').each(function(this: CheerioElement, data) {
            content += $(this).text() + '\n';
        });
        if (!content.trim()) {
            $('.js-novel-text p').each(function(this: CheerioElement) {
                content += $(this).text() + '\n';
            });
        }
        if (!content.trim()) {
            $('#novel_honbun').each(function(this: CheerioElement) {
                content = $(this).html() || '';
                content = content.replace(/<br\s*\/?>/gi, '\n');
                content = $('<div>').html(content).text();
            });
        }
        if (!content.trim()) {
            $('#novel_honbun').contents().each(function(this: CheerioElement) {
                if (this.type === 'text') {
                    content += $(this).text() + '\n';
                }
            });
        }

        let re = new RegExp('^　', 'g');
        content = content.replace(re, '');

        return content;
    }
}