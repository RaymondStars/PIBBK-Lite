import { Parser } from './Parser';
import * as cheerio from 'cheerio';

export class KakuyomuParser extends Parser {

    public parseNovelName(html: string):string {
		let pattern = /<p id="contentMain-header-workTitle" class="js-vertical-composition-item">(.*?)<\/p>/gsm;
        let match = pattern.exec(html);
        let name;
        if (match && 1 in match) {
            name = match[1];
        }

        return name;
    }

    public parseChapterTitle(html: string):string {
		let pattern = /<p class="widget-episodeTitle js-vertical-composition-item">(.*?)<\/p>/gsm;
        let match = pattern.exec(html);
        let title;
        if (match && 1 in match) {
            title = match[1];
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
        $('.widget-episodeBody .widget-episodeBody__content p, .widget-episodeBody p, .js-episode-body p, [class*="episodeBody"] p').each(function(this: CheerioElement) {
            const text = $(this).text();
            if (text) {
                content += text + '\n';
            }
        });
        if (!content) {
            $('.js-episode-body, .widget-episodeBody').each(function(this: CheerioElement) {
                let html = $(this).html() || '';
                html = html.replace(/<br\s*\/?>/gi, '\n');
                const text = $('<div>').html(html).text();
                if (text.trim()) {
                    content = text.replace(/([^\n])\n([^\n])/g, '$1\n$2') + '\n';
                }
            });
        }
        if (!content) {
            $('[id^="p"]').each(function(this: CheerioElement) {
                const text = $(this).text();
                if (text) {
                    content += text + '\n';
                }
            });
        }

        let re = new RegExp('^　', 'g');
        content = content.replace(re, '');

        return content;
    }
}