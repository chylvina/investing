"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCsvToJson_1 = require("../src/parseCsvToJson");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 使用 path.join 从项目根目录构建正确的路径
const filePath = path_1.default.join(__dirname, '../assets/GPLIST.csv');
const csvData = fs_1.default.readFileSync(filePath, "utf-8");
const jsonResult = (0, parseCsvToJson_1.parseCsvToJson)(csvData);
// 将 JSON 数据写入文件
const outputPath = path_1.default.join(__dirname, '../assets/GPLIST.json');
// 确保输出目录存在
if (!fs_1.default.existsSync(path_1.default.dirname(outputPath))) {
    fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
}
// 将 JSON 数据写入文件，使用 pretty print 格式
fs_1.default.writeFileSync(outputPath, JSON.stringify(jsonResult, null, 2), 'utf-8');
console.log(`JSON 数据已保存至: ${outputPath}`);
