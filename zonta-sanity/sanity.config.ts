import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Zonta  Club',
  projectId: 'lkyg6y4b',
  dataset: 'zonta-dev',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
