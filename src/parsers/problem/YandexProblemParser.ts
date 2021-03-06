import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class YandexProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = ['https://*.contest.yandex.com/*/contest/*/problems/*/'];

    patterns.push(...patterns.map(pattern => pattern.replace('.com', '.ru')));
    patterns.push(...patterns.map(pattern => pattern.replace('/*/contest', '/contest')));
    patterns.push(...patterns.map(pattern => pattern.replace('contest.yandex', 'contest2.yandex')));

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Yandex').setUrl(url);

    task.setName(elem.querySelector('h1.title').textContent);
    task.setCategory(elem.querySelector('.contest-head__item.contest-head__item_role_title').textContent);

    const timeLimitStr = elem.querySelector('.time-limit').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+)\s/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = elem.querySelector('.memory-limit').textContent;
    task.setMemoryLimit(parseInt(/(\d+)Mb/i.exec(memoryLimitStr)[1], 10));

    elem.querySelectorAll('.sample-tests').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      const input = blocks[0].textContent;
      const output = blocks[1].textContent;

      task.addTest(input, output);
    });

    return task.build();
  }
}
