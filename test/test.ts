import { parseCsvToJson } from "../src/parseCsvToJson";
import fs from 'fs';
import path from 'path';

// 使用 path.join 从项目根目录构建正确的路径
const filePath = path.join(__dirname, '../assets/GPLIST.csv');
const csvData = fs.readFileSync(filePath, "utf-8");

const jsonResult = parseCsvToJson(csvData);

// 将 JSON 数据写入文件
const outputPath = path.join(__dirname, '../assets/GPLIST.json');

// 确保输出目录存在
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

// 将 JSON 数据写入文件，使用 pretty print 格式
fs.writeFileSync(outputPath, JSON.stringify(jsonResult, null, 2), 'utf-8');

console.log(`JSON 数据已保存至: ${outputPath}`);