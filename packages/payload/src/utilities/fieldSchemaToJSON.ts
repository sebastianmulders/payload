import type { ClientConfig } from '../config/client.js'
import type { ClientField } from '../fields/config/client.js'
import type { Field, FieldTypes } from '../fields/config/types.js'

import { fieldAffectsData } from '../fields/config/types.js'

export type FieldSchemaJSON = {
  blocks?: FieldSchemaJSON // TODO: conditionally add based on `type`
  fields?: FieldSchemaJSON // TODO: conditionally add based on `type`
  hasMany?: boolean // TODO: conditionally add based on `type`
  name: string
  relationTo?: string // TODO: conditionally add based on `type`
  slug?: string // TODO: conditionally add based on `type`
  type: FieldTypes
}[]

export const fieldSchemaToJSON = (
  fields: (ClientField | Field)[],
  config: ClientConfig,
): FieldSchemaJSON => {
  return fields.reduce((acc, field) => {
    let result = acc

    switch (field.type) {
      case 'array':
        acc.push({
          name: field.name,
          type: field.type,
          fields: fieldSchemaToJSON(
            [
              ...field.fields,
              {
                name: 'id',
                type: 'text',
              },
            ],
            config,
          ),
        })

        break

      case 'blocks':
        acc.push({
          name: field.name,
          type: field.type,
          blocks: (field.blockReferences ?? field.blocks).reduce((acc, _block) => {
            const block = typeof _block === 'string' ? config.blocksMap[_block]! : _block
            ;(acc as any)[block.slug] = {
              fields: fieldSchemaToJSON(
                [
                  ...block.fields,
                  {
                    name: 'id',
                    type: 'text',
                  },
                ],
                config,
              ),
            }

            return acc
          }, {} as FieldSchemaJSON),
        })

        break

      case 'collapsible': // eslint-disable no-fallthrough
      case 'row':
        result = result.concat(fieldSchemaToJSON(field.fields, config))
        break

      case 'group':
        if (fieldAffectsData(field)) {
          acc.push({
            name: field.name,
            type: field.type,
            fields: fieldSchemaToJSON(field.fields, config),
          })
        } else {
          result = result.concat(fieldSchemaToJSON(field.fields, config))
        }

        break

      case 'relationship': // eslint-disable no-fallthrough
      case 'upload':
        acc.push({
          name: field.name,
          type: field.type,
          hasMany: 'hasMany' in field ? Boolean(field.hasMany) : false, // TODO: type this
          relationTo: field.relationTo as string,
        })

        break

      case 'tabs': {
        let tabFields: FieldSchemaJSON = []

        field.tabs.forEach((tab) => {
          if ('name' in tab) {
            tabFields.push({
              name: tab.name,
              type: field.type,
              fields: fieldSchemaToJSON(tab.fields, config),
            })
            return
          }

          tabFields = tabFields.concat(fieldSchemaToJSON(tab.fields, config))
        })

        result = result.concat(tabFields)

        break
      }

      default:
        if ('name' in field) {
          acc.push({
            name: field.name,
            type: field.type,
          })
        }
    }

    return result
  }, [] as FieldSchemaJSON)
}
