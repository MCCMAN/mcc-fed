// 主要用于TypeScript识别.vue文件模块
// typescript默认不支持导入.vue模块，这个文件告诉typescript导入.vue文件模块VueConstructor<Vue>类型识别处理
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
