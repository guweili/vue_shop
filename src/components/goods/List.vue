<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区-->
        <el-card>
            <!--搜索添加区域-->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>

                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>

            <!--表格区域-->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="价格" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="数量" prop="goods_number" width="95px"></el-table-column>
                <el-table-column label="创建时间" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!--编辑按钮-->
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <!--删除按钮-->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--页码区域-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[10, 20, 50]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import { deletedPopconfirm } from '../../utils/utils'

export default {
  data () {
    return {
      // 查询对象,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 每页个数变动，触发的函数
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 页码变动触发的函数
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 删除商品
    async removeById (goodsId) {
      // 全局删除弹窗方法
      const url = `goods/${goodsId}`
      const fn = this.getGoodsList
      deletedPopconfirm(this.$confirm, this.$message, this.$http.delete, url, fn)
    },
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
