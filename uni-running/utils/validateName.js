// Shared name validation utilities
// validateName(name) -> returns '' when valid, or an error message string
// validateNameRule(rule, value, callback) -> form-validator wrapper (callback style)
export function validateName(input) {
  const name = (input || '').trim();
  if (!name) return '请填写姓名';

  const hasChinese = /[\u4e00-\u9fa5]/.test(name);
  const englishPattern = /^[A-Za-z][A-Za-z' \-\.]{0,59}$/;

  if (hasChinese) {
    if (!/^[\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF\u00b7]+$/.test(name)) return '姓名仅支持中文和间隔号·';
    if (/^\u00b7|\u00b7$/.test(name)) return '间隔号不能在姓名首尾';
    if (/\u00b7{2}/.test(name)) return '间隔号不能连续使用';
    const chineseCount = name.replace(/\u00b7/g, '').length;
    if (chineseCount < 2) return '姓名至少2个中文字';
    if (chineseCount > 12) return '姓名不能超过12个中文字';
    return '';
  }

  if (!englishPattern.test(name)) return '姓名仅支持中文或英文姓名格式';
  const letterCount = name.replace(/[^A-Za-z]/g, '').length;
  if (letterCount < 2) return '姓名至少2个字母';
  return '';
}

export function validateNameRule(rule, value, callback) {
  const err = validateName(value);
  if (err) return callback(new Error(err));
  return callback();
}

export default {
  validateName,
  validateNameRule,
};
