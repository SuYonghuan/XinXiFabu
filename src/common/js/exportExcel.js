import { saveAs } from 'file-saver'
import XLSX from 'xlsx'

export const exportExcel = (fileName, el) => {
  if (!el) {
    return
  }
  /* 从表生成工作簿对象 */
  const wb = XLSX.utils.table_to_book(document.getElementById(el))
  /* 获取二进制字符串作为输出 */
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array'
  })
  try {
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
  } catch (e) {
    if (typeof console !== 'undefined') console.log(e, wbout)
  }
  return wbout
}
