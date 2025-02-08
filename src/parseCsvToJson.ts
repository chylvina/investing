type JsonObject = { [key: string]: string | number | boolean | null };

/**
 * 解析 CSV 数据为 JSON
 * @param csvString - CSV 格式的字符串
 * @returns JSON 数组，包含表头
 */
function parseCsvToJson(csvString: string): JsonObject[] {
  // 按行分割 CSV 数据
  const lines = csvString.split("\n").map(line => line.trim()).filter(line => line !== "");

  if (lines.length < 2) {
    throw new Error("Invalid CSV: Must have at least a header row and one data row.");
  }

  // 获取表头
  const headers = lines[0].split(",").map(header => header.trim());

  // 解析每一行数据为 JSON
  const jsonResult = lines.slice(1).map(line => {
    const values = line.split(",").map(value => value.trim());

    // 构建 JSON 对象
    const jsonObject: JsonObject = {};
    headers.forEach((header, index) => {
      jsonObject[header] = parseValue(values[index]);
    });

    return jsonObject;
  });

  return jsonResult;
}

/**
 * 尝试解析值为正确的数据类型
 * @param value - 原始字符串值
 * @returns 解析后的值（string | number | boolean | null）
 */
function parseValue(value: string): string | number | boolean | null {
  if (value === "") return null; // 空值返回 null
  if (!isNaN(Number(value))) return Number(value); // 是数字则返回数字
  if (value.toLowerCase() === "true") return true; // 是布尔值 true
  if (value.toLowerCase() === "false") return false; // 是布尔值 false
  return value; // 默认返回字符串
}

export { parseCsvToJson };