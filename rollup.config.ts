import {terser} from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const notice = `/**
 * @license
 * Copyright 2020 Tom Bazarnik
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`

export default {
  input: '__dev__/index.js',
  output: [{
    file: 'dist/index.js',
    format: 'cjs'
  }],
  plugins: [
    resolve({
        preferBuiltins: true
    }),
    commonjs(),
    terser(),
    { banner() { return notice; } }
  ]
}