import { Parser } from './Parser';
import * as cheerio from 'cheerio';

export class PixivParser extends Parser {

    public parseNovelName(html: string):string {
        // <span itemprop="title">現実主義勇者の王国再建記</span>
        // <title>【現実主義勇者の王国再建記】
        // let pattern = /<span itemprop="title">(.*?)<\/span>/gsm;
        let pattern = /<title>【(.*?)】/gsm;
        let match = pattern.exec(html);
        let name;
        if (match && 1 in match) {
            name = match[1];
        }

        return name;
    }

    public parseChapterTitle(html: string):string {
        const $ = cheerio.load(html, { decodeEntities: true });
        const metaTitle = $('meta[property="twitter:title"]').attr('content');
        if (metaTitle) {
            return metaTitle;
        }
        // <meta property="twitter:title" content="現国《蒼海疾駆の章》第二十二話『近接戦闘』">
        let pattern = /<meta property="twitter:title" content="(.*?)">/gsm;
        let match = pattern.exec(html);
        let title;
        // console.log(['parseChapterTitle', match, html]);
        if (match && 1 in match) {
            title = match[1];
        }

        return title;
    }

    public parseContent(html: string):string {
        const $ = cheerio.load(html, { decodeEntities: true });
        const preload = $('#meta-preload-data').attr('content')
            || $('meta[name="preload-data"]').attr('content');
        let json;
        if (preload) {
            json = JSON.parse(preload);
        } else {
            return '';
        }
        let chapterId = '';
        let pattern;
        let match;
        pattern = /<link rel="canonical" href="https:\/\/www.pixiv.net\/novel\/show.php\?id=(.*?)">/gsm;
        match = pattern.exec(html);
        if (match && 1 in match) {
            chapterId = match[1];
        }

        if (!chapterId) {
            pattern = /(?:show.php\?id=|\/novel\/)(\d+)/g;
            match = pattern.exec(html);
            if (match && 1 in match) {
                chapterId = match[1];
            }
        }
        if (!chapterId && json.novel) {
            chapterId = Object.keys(json.novel)[0];
        }

        if (!json.novel || !json.novel[chapterId]) {
            return '';
        }
        return json.novel[chapterId].content || '';
    }
}