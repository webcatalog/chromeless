/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import isUrl from './is-url';

const kits = {
  required: (val, ruleVal, fieldName) => {
    if (ruleVal && (!val || val === '')) {
      return '{fieldName} is required.'.replace('{fieldName}', fieldName);
    }

    return null;
  },
  url: (val, ruleVal, fieldName) => {
    if (ruleVal && val && !isUrl(val)) {
      return '{fieldName} is not valid.'.replace('{fieldName}', fieldName);
    }
    return null;
  },
  // accept link without protocol prefix
  lessStrictUrl: (val, ruleVal, fieldName) => {
    if (ruleVal && val && !isUrl(val) && !isUrl(`http://${val}`)) {
      return '{fieldName} is not valid.'.replace('{fieldName}', fieldName);
    }
    return null;
  },
  filePath: (val, ruleVal, fieldName) => {
    if (!ruleVal) return null;
    // https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    // win32
    if (window.process.platform === 'win32') {
      if (val.match(/[\\/:*?"<>|\000-\031]/)) {
        return '{fieldName} cannot contain any of the following characters: \\ / : * ? " < > | or non-printable characters.'
          .replace('{fieldName}', fieldName);
      }
    // eslint-disable-next-line react/destructuring-assignment
    } else if (val.match(/[/:\000]/)) {
      // unix
      return '{fieldName} cannot contain any of the following characters: / : or NUL.'
        .replace('{fieldName}', fieldName);
    }
    return null;
  },
};

const validate = (changes, rules) => {
  const newChanges = { ...changes };

  Object.keys(changes).forEach((key) => {
    if (key.endsWith('Error')) return;

    let err = null;

    const val = newChanges[key];

    if (rules[key]) {
      const { fieldName } = rules[key];

      Object.keys(rules[key]).find((ruleName) => {
        if (ruleName === 'fieldName') return false;

        const ruleVal = rules[key][ruleName];

        err = kits[ruleName](val, ruleVal, fieldName);

        return err !== null;
      });
    }

    newChanges[`${key}Error`] = err;
  });

  return newChanges;
};

export default validate;
