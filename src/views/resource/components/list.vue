<template>
  <div class="resource-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-form :inline="true" :model="form" ref="form">
          <el-form-item label="资源名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="资源路径" prop="url">
            <el-input v-model="form.url"></el-input>
          </el-form-item>
          <el-form-item label="资源分类" prop="categoryId">
            <el-select v-model="form.categoryId" clearable>
              <el-option
                :label="item.name"
                :value="item.id"
                v-for="item in resourceCategories"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
              :disabled="isLoading"
              @click="onSubmit"
              >查询搜索</el-button>
            <el-button @click="onReset" :disabled="isLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="resources"
        style="width: 100%; margin-bottom: 20px"
        v-loading="isLoading">
        <el-table-column
          prop="date"
          label="编号"
          type="index"
          width="100">
        </el-table-column>
        <el-table-column
          prop="name"
          label="资源名称">
        </el-table-column>
        <el-table-column
          prop="url"
          label="资源路径">
        </el-table-column>
         <el-table-column
          prop="description"
          label="描述">
        </el-table-column>
        <el-table-column
          prop="createdTime"
          label="添加时间">
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="130">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="form.current"
        :page-sizes="[5, 10, 20]"
        :page-size="form.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        :disabled="isLoading">
      </el-pagination>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getResourcePages } from '@/services/resource'
import { getResourceCategories } from '@/services/resourceCategory'
import { Form } from 'element-ui'
export default Vue.extend({
  name: 'ResourceList',
  data () {
    return {
      resources: [], // 资源列表
      form: {
        name: '',
        url: '',
        region: '',
        current: 1,
        size: 10,
        categoryId: null
      },
      totalCount: 0,
      resourceCategories: [],
      isLoading: false
    }
  },

  created () {
    this.loadResources()
    this.loadResourceCategories()
  },
  methods: {
    async loadResourceCategories () {
      const { data } = await getResourceCategories()
      this.resourceCategories = data.data
    },
    async loadResources () {
      this.isLoading = true
      const { data } = await getResourcePages(this.form)
      this.isLoading = false
      this.resources = data.data.records
      this.totalCount = data.data.total
    },
    onSubmit () {
      console.log('submit!')
      this.form.current = 1
      this.loadResources()
    },
    handleEdit () {
      console.log('edit')
    },
    handleDelete () {
      console.log('delete')
    },
    handleSizeChange (val: number) {
      console.log(`每页 ${val} 条`)
      this.form.size = val
      this.form.current = 1
      this.loadResources()
    },
    handleCurrentChange (val: number) {
      console.log(`当前页: ${val}`)
      this.form.current = val
      this.loadResources()
    },
    onReset () {
      (this.$refs.form as Form).resetFields()
      this.form.current = 1
      this.loadResources()
    }
  }
})
</script>

<style lang="scss" scoped></style>
