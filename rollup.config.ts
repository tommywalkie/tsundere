import {terser} from 'rollup-plugin-terser'

export default {
  input: '__dev__/index.js',
  output: [{
    file: 'dist/index.js',
    format: 'cjs',
    plugins: [terser()]
  }]
}