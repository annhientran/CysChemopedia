// process excel files js fnxns
/**
 * excel helpers to pre process the excel workbook for Oximouse
 * @author Zoey Le <zoeyleqa@gmail.com>
 */
// import parseXlsx from 'excel';
import * as Excel from "./exceljs";

var workbook = new Excel.Workbook();
workbook.xlsx
  .readFile("assets/data/mockdata/HumanFasta.xlsx") //Change file name here or give file path
  .then(function () {
    var worksheet = workbook.getWorksheet("Sheet1");
    let i = 1;
    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
      // r = worksheet.getRow(i).values;
      // r1 = r[2]; // Indexing a column
      // console.log(r1);
      const sequence = String(worksheet.getCell(`I${i}`).value);
      const posArr = getCysteinePositions(sequence);
      const posList = posArr.join(";");
      i++;
    });

    return workbook.xlsx.writeFile("assets/data/mockdata/HumanFasta.xlsx"); //Change file name here or give     file path
  });

function getCysteinePositions(sequence) {
  let cysPosArr = [];

  _.forEach(sequence, (char, index) => {
    if (char === "C") cysPosArr.push(index + 1);
  });
  return cysPosArr;
}
