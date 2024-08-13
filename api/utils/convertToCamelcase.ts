import _ from "lodash"

const convertToCamelcase = <T>(obj: Record<string, any>): T => {
    return _.mapKeys(obj, (value, key) => _.camelCase(key)) as T
}

const convertArrayToCamelcase = <T extends Record<string, any>>(
    arr: T[]
): T[] => {
    return arr.map((obj) => convertToCamelcase(obj))
}

export { convertToCamelcase, convertArrayToCamelcase }
