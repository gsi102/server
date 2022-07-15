"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlRequests = void 0;
exports.sqlRequests = {
    sqlInsertSynthax: (columnNames) => {
        const newArray = new Array(columnNames.length);
        return newArray.fill("?");
    },
    sqlUserColumnValues: (sourceObj) => {
        const columnValuesArray = [];
        const digFunction = (obj) => {
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
        const columnValuesArray = [];
        const digFunction = (obj) => {
            for (let [key] of Object.entries(obj)) {
                columnValuesArray.push(obj[key]);
            }
        };
        digFunction(sourceObj);
        return columnValuesArray;
    },
};
