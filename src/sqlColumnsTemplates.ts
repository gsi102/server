import * as Types from "./types/types";

export const sqlColumnsTemplates: Types.sqlRequestsTemplates = {
  sqlInsertSynthax: (columnNames) => {
    const newArray = new Array(columnNames.length);
    return newArray.fill("?");
  },
  sqlUserColumnValues: (sourceObj) => {
    const columnValuesArray: Array<any> = [];
    const digFunction = (obj: any) => {
      for (let [key] of Object.entries(obj)) {
        obj[key].constructor === Object
          ? digFunction(obj[key])
          : columnValuesArray.push(obj[key]);
      }
    };
    digFunction(sourceObj);
    return columnValuesArray;
  },
  sqlMessagesColumnValues: (sourceObj) => {
    const columnValuesArray: Array<any> = [];
    const digFunction = (obj: any) => {
      for (let [key] of Object.entries(obj)) {
        columnValuesArray.push(obj[key]);
      }
    };
    digFunction(sourceObj);
    return columnValuesArray;
  },
};
