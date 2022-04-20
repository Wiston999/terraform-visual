import { Entities } from '../../data'

const globalPlan = require('../plan.json');

const diffBase = {
  before: {
    aaa: 'aaa',
    bbb: 'bbb',
    ccc: 'ccc',
    ddd: 'ddd',
    multiline: '[1,2,3,4,5]',
    multiline_sensitive: '[1,2,3,4,5]',
  },
  before_sensitive: {
    aaa: false,
    bbb: true,
    ccc: false,
    ddd: true,
    multiline_sensitive: true,
  },
  after: {
    aaa: 'aaa',
    bbb: 'bbb',
    ccc: 'eee',
    ddd: 'eee',
    eee: 'zzz',
    multiline: '[5,4,3,2,1]',
    multiline_sensitive: '[5,4,3,2,1]'
  },
  after_sensitive: {
    aaa: false,
    bbb: true,
    ccc: false,
    ddd: true,
    multiline_sensitive: true,
  },
  after_unknown: {
    fff: {}
  },
  replace_paths: [
    'eee'
  ]
}

describe('TerraformPlanResourceChangeFieldDiff', () => {
  it('isDiff', () => {
    const change = { // Entities.TerraformPlanResourceChangeFieldDiff
      src: {
        value: 'aaa',
        type: 'string',
        sensitive: false,
        unknown_after: false
      },
      dst: {
        value: 'aaa',
        type: 'string',
        sensitive: false,
        unknown_after: false
      },
    }

    expect(Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(change)).toBeFalsy()
    change.dst.unknown_after = true
    expect(Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(change)).toBeTruthy()
    change.dst.unknown_after = false
    change.dst.value = 'bbb'
    expect(Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(change)).toBeTruthy()
  })
})

describe('TerraformPlanResourceChangeField', () => {
  it('setValueType', () => {
    const simpleString = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, 'aaa', false)
    const simpleNumber = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, 42, false)
    const simpleBool = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, true, false)
    const simpleNull = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, null, false)
    const sensitiveString = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, 'aaa', true)
    const sensitiveNumber = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, 42, true)
    const sensitiveBool = Entities.Utils.TerraformPlanResourceChangeField.setValueType({}, true, true)
    const array = Entities.Utils.TerraformPlanResourceChangeField.setValueType(
      {},
      ['aaa', 'bbb', null, 42],
      [false, true, false, false]
    )
    const hash = Entities.Utils.TerraformPlanResourceChangeField.setValueType(
      {},
      {'a': 'aaa', 'b': 'bbb', 'c': null, 'd': 42, 'e': [1, 'a']},
      {'a': false, 'b': true, 'c': false, 'd': false, 'e': [true, false]}
    )

    expect(simpleString.value).toBe('aaa')
    expect(simpleString.type).toBe('string')
    expect(simpleString.sensitive).toBe(false)

    expect(simpleNumber.value).toBe('42')
    expect(simpleNumber.type).toBe('number')
    expect(simpleNumber.sensitive).toBe(false)

    expect(simpleBool.value).toBe('true')
    expect(simpleBool.type).toBe('boolean')
    expect(simpleBool.sensitive).toBe(false)

    expect(simpleNull.value).toBe('(null)')
    expect(simpleNull.type).toBe('null')
    expect(simpleNull.sensitive).toBe(false)

    expect(sensitiveString.value).toBe('(sensitive)')
    expect(sensitiveString.type).toBe('string')
    expect(sensitiveString.sensitive).toBe(true)

    expect(sensitiveNumber.value).toBe('(sensitive)')
    expect(sensitiveNumber.type).toBe('number')
    expect(sensitiveNumber.sensitive).toBe(true)

    expect(sensitiveBool.value).toBe('(sensitive)')
    expect(sensitiveBool.type).toBe('boolean')
    expect(sensitiveBool.sensitive).toBe(true)

    expect(array.value).toBe(JSON.stringify(['aaa', '(sensitive)', '(null)', 42], null, 4))
    expect(array.type).toBe('array')
    expect(array.sensitive).toBe(true)

    expect(hash.value).toBe(JSON.stringify({'a': 'aaa', 'b': '(sensitive)', 'c': '(null)', 'd': 42, 'e': ['(sensitive)', 'a']}, null, 4))
    expect(hash.type).toBe('object')
    expect(hash.sensitive).toBe(true)
  })
  it('renderValue', () => {
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      'aaa',
      false
    )).toBe('aaa')
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      42,
      false
    )).toBe(42)
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      true,
      false
    )).toBe(true)
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      'aaa',
      true
    )).toBe('(sensitive)')
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      42,
      true
    )).toBe('(sensitive)')
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      true,
      true
    )).toBe('(sensitive)')
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      ['aaa', 'bbb', 'ccc', null, null],
      [false, true, false, false, true]
    )).toStrictEqual(['aaa', '(sensitive)', 'ccc', '(null)', '(null)'])
    expect(Entities.Utils.TerraformPlanResourceChangeField.renderValue(
      {'a': 'aaa', 'b': 'bbb', 'c': 'ccc', 'd': null},
      {'a': false, 'b': true, 'c': false, 'd': false}
    )).toStrictEqual({'a': 'aaa', 'b': '(sensitive)', 'c': 'ccc', 'd': '(null)'})
  })
})

describe('TerraformPlanResourceChangeChange', () => {
  it('getActionAlias', () => {
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['no-op']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.Noop)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['create']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.Create)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['delete']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.Delete)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['update']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.Update)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['create', 'delete']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['delete', 'create']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate)
    expect(Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(
      {actions: ['blabla']}
    )).toBe(Entities.TerraformPlanResourceChangeChangeActionAlias.Unknown)
  })

  it('getDiff', () => {
    const diff = Entities.Utils.TerraformPlanResourceChangeChange.getDiff(diffBase)

    expect(diff.aaa).toStrictEqual({forces_replacement: false, src: {value: 'aaa', type: 'string', sensitive: false}, dst: {value: 'aaa', type: 'string', sensitive: false}})
    expect(diff.bbb).toStrictEqual({forces_replacement: false, src: {value: '(sensitive)', type: 'string', sensitive: true}, dst: {value: '(sensitive)', type: 'string', sensitive: true}})
    expect(diff.ccc).toStrictEqual({forces_replacement: false, src: {value: 'ccc', type: 'string', sensitive: false}, dst: {value: 'eee', type: 'string', sensitive: false}})
    expect(diff.ddd).toStrictEqual({forces_replacement: false, src: {value: '(sensitive)', type: 'string', sensitive: true}, dst: {value: '(sensitive)', type: 'string', sensitive: true}})
    expect(diff.eee).toStrictEqual({forces_replacement: true, src: {}, dst: {value: 'zzz', sensitive: false, type: 'string'}})
    expect(diff.fff).toStrictEqual({forces_replacement: false, src: {}, dst: {value: '(known after apply)', unknown_after: true}})
    expect(diff.multiline.src).toStrictEqual({value: '[\n    1,\n    2,\n    3,\n    4,\n    5\n]', type: 'string', sensitive: false})
    expect(diff.multiline.dst).toStrictEqual({value: '[\n    5,\n    4,\n    3,\n    2,\n    1\n]', type: 'string', sensitive: false})
    expect(diff.multiline.diff).toBeTruthy()
    expect(diff.multiline_sensitive.src).toStrictEqual({value: '(sensitive)', type: 'string', sensitive: true})
    expect(diff.multiline_sensitive.dst).toStrictEqual({value: '(sensitive)', type: 'string', sensitive: true})
    expect(diff.multiline_sensitive.diff).toBeUndefined()
  })
})

describe('TerraformPlanResourceChangeChangeDiff', () => {
  it('getUnchangedFields', () => {
    const changes = Entities.Utils.TerraformPlanResourceChangeChangeDiff.getUnchangedFields(
      Entities.Utils.TerraformPlanResourceChangeChange.getDiff(diffBase)
    )

    expect(Object.keys(changes)).toStrictEqual(['aaa', 'bbb', 'ddd', 'multiline_sensitive'])
  })
})
