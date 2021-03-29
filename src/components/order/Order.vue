<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区-->
        <el-card>
            <!--搜索区域
            -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!--表格区域-->
            <el-table :data="ordersList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单号" prop="order_number"></el-table-column>
                <el-table-column label="价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini"
                                   @click="showProgressBox"></el-button>
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

        <!--修改地址对话框-->
        <el-dialog
                title="修改地址"
                :visible.sync="addressVisible"
                width="50%"
                @close="addressDialogClosed">
            <!--修改参数对话框-->
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1" @change="addressChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!--展示物流信息对话框-->
        <el-dialog
                title="物流进度"
                :visible.sync="progressVisible"
                width="50%"
                @close="addressDialogClosed">
            <!--修改参数对话框-->
            <el-timeline :reverse="reverse">
                <el-timeline-item
                        v-for="(activity, index) in progressInfo"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import { cityData, orderNum } from './citydata'

export default {
  data () {
    return {
      // 查询对象,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数
      total: 0,
      // 订单列表
      ordersList: [],
      // 控制对话框
      addressVisible: false,
      // 对话框表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 对话框表单匹配规则
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '请填写详细地址',
            trigger: 'blur'
          }
        ]
      },
      // 级联选择器内容
      cityData: cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 每页个数变动，触发的函数
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getOrdersList()
    },
    // 页码变动触发的函数
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getOrdersList()
    },
    // 显示对话框
    showDialog () {
      this.addressVisible = true
    },
    // 监听级联选择器变化触发
    addressChange () {
      console.log(this.addressForm.address1)
    },
    // 关闭对话框清空数据
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流信息对话框
    async showProgressBox () {
      const { data: res } = await this.$http.get(`/kuaidi/${orderNum}`)
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
    .el-cascader {
        width: 100%;
    }
</style>
