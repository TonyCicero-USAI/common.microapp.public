import _ from "lodash";
import { ActivatedRoute } from '@angular/router';
import { classToPlain, ClassTransformOptions, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

export class Utility {

  //#region CAST

  /**
   * Clone an object using class-transformer
   */
  public static cast<T, V>(cls: ClassType<T>, plainObj: V, cleanObj: boolean = false, options?: ClassTransformOptions): T {
    const object = cleanObj && typeof plainObj === 'object' ? Utility.toCleanObj(<Object>plainObj) : plainObj;
    const result = plainToClass(cls, object, options);
    if (cleanObj) {
      Utility.clean(result);
    }
    return result;
  }

  /**
   * Clone an object array using class-transformer
   */
  public static castArray<T, V>(cls: ClassType<T>, plainObjs: V[], cleanObj: boolean = false, options?: ClassTransformOptions): T[] {
    let objects: any[] = plainObjs;
    if (cleanObj) {
      objects = plainObjs.map(o => {
        return typeof o === 'object' ? Utility.toCleanObj(<Object>o) : o;
      });
    }
    const results = plainToClass(cls, objects, options);
    if (cleanObj) {
      results.forEach(r => { Utility.clean(r); });
    }
    return results;
  }

  /**
   * Generates a random hexadecimal string of a given length
   */
  public static generateHexString(length: number) {
      // Generate a random number up to 16^length and convert it to hex
      const max = Math.pow(16, length);
      const randomNum = Math.floor(Math.random() * max);

      // Convert to a hexadecimal string and pad with leading zeros if necessary
      const hexString = randomNum.toString(16);
      return hexString.padStart(length, '0');
  }

  /**
   * Clone an object using class-transformer with excluding non-exposed properties
   */
  public static safeCast<T, V>(cls: ClassType<T>, plainObj: V, cleanObj: boolean = false): T {
    const object = cleanObj && typeof plainObj === 'object' ? Utility.toCleanObj(<Object>plainObj) : plainObj;
    const obj = plainToClass(cls, object, { excludeExtraneousValues: true });
    if (cleanObj) {
      Utility.clean(obj);
    }
    return obj;
  }
  
  /**
   * Clone an object array using class-transformer with excluding non-exposed properties
   */
  public static safeCastArray<T, V>(cls: ClassType<T>, plainObjs: V[], cleanObj: boolean = false): T[] {
    let objects: any[] = plainObjs;
    if (cleanObj) {
      objects = plainObjs.map(o => {
        return typeof o === 'object' ? Utility.toCleanObj(<Object>o) : o;
      });
    }
    const results = plainToClass(cls, objects, { excludeExtraneousValues: true });
    if (cleanObj) {
      results.forEach(r => { Utility.clean(r); });
    }
    return results;
  }

  //#endregion

  //#region CONVERT

  /**
   * Convert the string into camel case.
   */
  public static camelize(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
  }

  /**
   * Convert CSV to JSON.
   */
  public static convertJsonToCsv(data: any[]): string {
      const columns = Object.keys(data[0] || {});
      const header = columns.join(',');

      const rows = data.map(row => {
        let cells = [];
        for (let column of columns) {
          cells.push(`"${row[column]?.replace(/"/g, '""')}"`);
        }
        return cells.join(',')
      });
      
      return [header, ...rows].join('\n');
  }

  /**
   * Convert CSV to JSON.
   */
  public static convertCsvToJson(csv: string): any[] {

      const rows = csv.split("\n");
      const columnHeaders =  rows[0].split(",");

      const cellRegex = /"([^"]*)"|([^,]+)/g;

      const results = [];
      for (let i=1; i < rows.length; i++) {
          const item = {};
          const row = rows[i];
          //const cells = row.split(",");
          let match
          let columnIndex = 0;
          while ((match = cellRegex.exec(row)) !== null) {
              let cell = match[1] || match[2];
              if (cell) {
                  cell = cell.trim();
                  if (cell.startsWith('"') && cell.endsWith('"')) {
                      cell = cell.slice(1,-1);
                  }
                  item[columnHeaders[columnIndex]] = cell;
                  columnIndex++;
              }
          }

          // ignore empty rows
          if (Object.keys(item).length > 0) {
              results.push(item);
          }
      }
      return results;
  }

  /**
   * Convert the string into kebab case
   */
  public static kebabize(str: string) {
    if (str) {
      const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
      if (words) {
        return words.map(word_ => word_.toLowerCase()).join('-');
      }
    }
    return '';
  }

  /**
   * Convert a Type to JSON object.
   */
  public static toObject<T>(object: T, options?: ClassTransformOptions): Object {
    return classToPlain<T>(object, options);
  }

  /**
   * Convert Type array to array of JSON objects.
   */
  public static toObjects<T>(object: T[], options?: ClassTransformOptions): Object[] {
    return classToPlain<T>(object, options);
  }
  

  //#endregion

  //#region CLEAN

  /**
   * Remove all NULL properties of an object.
   */
  public static clean(obj: any) {
    Object.keys(obj).forEach(key => {
      if (obj[key] && obj[key].constructor === Array) {
        obj[key].forEach(o => Utility.clean(o));
      } else if (obj[key] && obj[key] instanceof Date) {
        // skip
      } else if (obj[key] && typeof obj[key] === 'object') {
        Utility.clean(obj[key]); // recursive
      } else {

        if (obj[key] == null) { delete obj[key]; }
      } // delete
    });
  }
  
  /**
   * Create a clone of an object which has all NULL property removed
   */
  public static toCleanObj(obj: object) {
    const newObj = {};

    Object.keys(obj).forEach(key => {
      if (obj[key] && obj[key].constructor === Array) {
        newObj[key] = obj[key].map(o => typeof o === 'object' ? Utility.toCleanObj(o) : o);
      } else if (obj[key] && obj[key] instanceof Date) {
        newObj[key] = obj[key];
      } else if (obj[key] && typeof obj[key] === 'object') {
        newObj[key] = Utility.toCleanObj(obj[key]); // recursive
      } else if (obj[key] != null) {
        newObj[key] = obj[key]; // copy value
      }
    });

    return newObj;
  }


  /**
   * Extract JSON from code block.
   */
  public static extractFromCodeBlock(text: string) {
      if (text) {
          return text.replace(/^```(?:json|markdown)?\n?/, "").replace(/\n?```$/, "");
      }
      return text;
  }


  //#endregion

  //#region COMPARE / SORT

  /**
   * Sort object array by field name.
   */
  public static sortArray<T>(array: T[], field: string, sort: 'asc'|'desc') {
      if (!array || array.length < 1) { return array; }
      if (!field) { return array; }
      if (!sort) { return array; }

      array.sort((n1, n2) => {
          if (n1[field] > n2[field]) { return sort === 'asc' ? 1 : -1; }
          if (n1[field] < n2[field]) { return sort === 'asc' ? -1 : 1; }
          return 0;
      });
      return array;
  }

  /**
   * Compare 2 objects usually used in sort.
   */
  public static compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  //#endregion COMPARE / SORT

  //#region DATE TIME

  /**
   * Verify that typed date has valid characters
   */
  public static checkDateInput(event: KeyboardEvent) {
    const ALLOWED_VALUES = '0123456789/';
    let key = event.key;
    if (ALLOWED_VALUES.includes(key) ||
      key === 'Tab' ||
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      ((event.ctrlKey || event.metaKey) && key === 'v') ||
      ((event.ctrlKey || event.metaKey) && key === 'x') ||
      ((event.ctrlKey || event.metaKey) && key === 'z')
    ) return true;
    else return false;
  }

  /**
   * Get Date difference between 2 dates.
   */
  public static dateDiff(first: Date, second: Date) {
    const dayMS = 1000 * 60 * 60 * 24;
    // Take the difference between the dates and divide by milliseconds per day.
    return Math.round((second.getTime() - first.getTime()) / dayMS);
  }

  //#endregion DATE TIME

  //#region HTML

  /**
   * Sanitize string by removing html tags, and characters unsafe for word docs.
   */
    public static stripHTML(str: string): string {
    if (typeof str !== 'string') {
        return str;
    }
    else {
      return str ? str.replace(/(<([^>]+)>)|(&nbsp;|&|'|<|>|#)/g,"") : '';
    }
  }

  //#endregion

  //#region JSON 

    /**
     * Check to see if the obj is a valid json. 
     */
    public static isValidJson (obj) {
      try {
          if (obj) {
              if (typeof obj ===  "object") {
                  return true;
              }
              else {
                  var result = JSON.parse(obj);
                  if (result && typeof result === "object") {
                      return true;
                  }
              }
          }
      }
      catch (e) {           
      }    
      return false;
  }

  //#endregion

  //#region MISCELLANEOUS

  /**
   * clones an obj to pass obj by value
   */
  public static clone(obj) {
    if (obj == null || typeof(obj) !== 'object') {
        return obj;
    }

    const temp = new obj.constructor();
    for (var key in obj) {
      temp[key] = this.clone(obj[key]);
    }
    return temp;
  }

  /**
   * Escape variable to be used in regular expression.
   * Intended to be used to escape any user input to avoid potential malicious content from causing a REDOS attack
   */
  public static escapeRegex(input: string) {
    return input.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Find differences.
   */
  public static findDifferences(obj1, obj2) {
      const flat1 = Utility.flatten(obj1);
      const flat2 = Utility.flatten(obj2);

      console.log(flat1)
      console.log(flat2)

      const differences = [];
      for (let key of Object.keys(flat1)) {
        if (flat1[key] !== flat2[key]) {
          differences.push({key, old: obj1[key], new:obj2[key]});
        }
      }
      for (let key of Object.keys(flat2)) {
        if (flat1[key] !== flat2[key]) {
          differences.push({key, old: obj1[key], new:obj2[key]});
        }
      }
      return differences;
  }

  /**
   * Flatten Object to a single depth.
   */
  public static flatten(obj) {
      var result = {};

      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
  
          if ((typeof obj[i]) == 'object' && obj[i] !== null) {
              var flatObject = this.flatten(obj[i]);
              for (var x in flatObject) {
                  if (!flatObject.hasOwnProperty(x)) continue;
  
                  result[i + '.' + x] = flatObject[x];
              }
          } else {
              result[i] = obj[i];
          }
      }
      return result;
  }

  /**
   * Get the action from current route. Assumes module is following standard:
   * 
   * /private/questionnaire => [questionnaire module]
   * /private/questionnaire/view => action = 'view'
   * /private/questionnaire/build/<uuid> => action = 'build'
   */
  public static getComponentAction(route: ActivatedRoute){
    return route.snapshot.url[0]?.path;
  }

  /**
   * Get number of days from frequency string.
   */
  public static getDaysFromFreqString(freqString: string) {
    switch (freqString) {
      case 'Daily': return 1;
      case 'Every 2 days': return 2;
      case 'Every 3 days': return 3;
      case 'Every 4 days': return 4;
      case 'Every 5 days': return 5;
      case 'Every 6 days': return 6;
      case 'Weekly': return 7;
      case 'Every 10 days': return 10;
      case 'Bi-monthly': return 15;
      case 'Monthly': return 30;
      case 'Every two months': return 30 * 2;
      case 'Every 6 months': return 30 * 6;
      case 'Yearly': return 365;
      default: return 0;
    }
  }

  /**
   * Check if a value is empty (NULL, UNDEFINED or BLANK).
   */
  public static isEmpty(value: any) {
    if (!value) {
      return true;
    }
    if (Object.entries(value).length === 0 && value.constructor === Object) {
      return true;
    }
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return true;
      }
    }
    if (value instanceof String) {
      if (value.trim() === '') {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a string is valid Regex.
   */
  public static isValidRegex(value: string): boolean {
    try {
      const RE = RegExp;
      new RE(value);
      return true;
    }
    catch (e) {
      return false;
    }
  }


  /**
   * Verify that the typed character is a valid character of an IPv4 address
   */
  public static checkIPV4Input(event: KeyboardEvent) {
    const ALLOWED_VALUES = '0123456789.-'
    let key = event.key
    if (ALLOWED_VALUES.includes(key) || 
        key === 'Backspace' || 
        key === 'Delete' || 
        key === 'ArrowLeft' || 
        key === 'ArrowRight' || 
        key === 'ArrowUp'|| 
        key === 'ArrowDown'  || 
        ((event.ctrlKey || event.metaKey) && key === 'v') ||
        ((event.ctrlKey || event.metaKey) && key === 'x') ||
        ((event.ctrlKey || event.metaKey) && key === 'z')
      ) return true;
    else return false;
}

  /**
   * Verify that the typed character is a valid character of an IPv6 address
   */
  public static checkIPV6Input(event: KeyboardEvent) {
      const ALLOWED_VALUES = 'ABCDEFabcdef0123456789.:'
      let key = event.key
      if (ALLOWED_VALUES.includes(key) || 
          key === 'Backspace' || 
          key === 'Delete' || 
          key === 'ArrowLeft' || 
          key === 'ArrowRight' || 
          key === 'ArrowUp'|| 
          key === 'ArrowDown' || 
          ((event.ctrlKey || event.metaKey) && key === 'v') ||
          ((event.ctrlKey || event.metaKey) && key === 'x') ||
        ((event.ctrlKey || event.metaKey) && key === 'z')
        ) return true;
      else return false;
  }

  /**
     * Verify that the pasted value only contains allowed characters for an IPv4 address
     */
  public static checkIPV4Paste(event) {
    let lengthLimit = 15;
    let allowedValues =  '0123456789.-'
    let pastedValue = event.clipboardData.getData('text')

    if (pastedValue.length > lengthLimit) event.preventDefault();
    for (let char of pastedValue) {
        if (!allowedValues.includes(char)) event.preventDefault();
    }
  }

  /**
   * Verify that the pasted value only contains allowed characters for an IPv6 address
   */
  public static checkIPV6Paste(event) {
      let lengthLimit = 39;
      let allowedValues =  'ABCDEFabcdef0123456789.:'
      let pastedValue = event.clipboardData.getData('text')

      if (pastedValue.length > lengthLimit) event.preventDefault();
      for (let char of pastedValue) {
          if (!allowedValues.includes(char)) event.preventDefault();
      }
  }

  /**
   * Create a key safe string.
   * Removes special characters from string. Used in process metadata.
   */
  public static keySafe(value: string): string {
    if (value && typeof value === 'string') {
        return value.replace(/[^a-zA-Z0-9]/g, '');
    }
    else {
        return '';
    }
  }

  /**
   * Generate a secure random float between 0 and 1.
   */
  public static randomFloat() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomNumber = array[0] / (0xFFFFFFFF + 1);
    return randomNumber;
  }

  /**
   * Get first item of an array
   */
  public static getFirstItem<T>(array: T[]) {
    if (!array) { return null; }
    if (Array.isArray(array) && array.length > 0) {
      return array[0];
    }
    else {
      return null;
    }
  }

  //#endregion
    
}
