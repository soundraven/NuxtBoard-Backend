import _ from "lodash"

const convertToCamelcase = <T>(obj: Record<string, any>): T => {
    return _.mapKeys(obj, (value, key) => _.camelCase(key)) as T
}

export default convertToCamelcase
