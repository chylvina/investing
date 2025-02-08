"use strict";
function extractScores(filePath) {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const scores = {};
    data.forEach(item => {
        if (item.result.error)
            return;
        const { code, name } = item;
        const content = item.result.choices[0].message.content;
        // 使用正则表达式提取分数
        const scoreMatch = content.match(/investing score: (?:\{)?(\d+)(?:\})?/);
        if (scoreMatch) {
            const score = parseInt(scoreMatch[1]);
            scores[`${code} ${name}`] = score;
        }
    });
    return scores;
}
// 使用示例
const scores = extractScores('tmp/analysis-results-2025-02-08.json');
// 将排序后的结果写入文件
const fs = require('fs');
const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [stock, score]) => {
    acc[stock] = score;
    return acc;
}, {});
// 将结果写入 JSON 文件
fs.writeFileSync('tmp/sorted-scores.json', JSON.stringify(sortedScores, null, 2), 'utf-8');
// 控制台输出
Object.entries(sortedScores).forEach(([stock, score]) => {
    console.log(`${stock}: ${score}`);
});
