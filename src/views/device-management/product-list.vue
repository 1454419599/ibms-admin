<template>
  <div class="app-container">
    <el-row type="flex" justify="space-between" class="search-box">
      <el-col :span="12">
        <el-input
          placeholder="请输入内容"
          v-model="selectValue"
          class="input-with-select"
          @change="handleSearch"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"
          ></el-button>
        </el-input>
      </el-col>
      <el-button type="primary" @click="handleCreate">添加产品</el-button>
    </el-row>
    <div class="infinite-list-wrapper" style="overflow: auto">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        v-infinite-scroll="load"
        :infinite-scroll-disabled="disabled"
      >
        <el-table-column align="center" label="序号" width="95">
          <template slot-scope="scope">
            {{ scope.$index }}
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ProductKey" align="center">
          <template slot-scope="{ row }">
            {{ row.productKey }}
          </template>
        </el-table-column>
        <el-table-column label="节点类型" align="center">
          <template slot-scope="{ row }">
            {{ row.nodeType | nodeTypeFilter }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="created_at"
          label="创建时间"
          width="200"
        >
          <template slot-scope="{ row }">
            <i class="el-icon-time" />
            <span>{{ row.gmtCreate | parseTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="center">
          <template slot-scope="{ row, $index }">
            <el-row>
              <el-col :span="12">
                <abbr title="管理设备">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-s-unfold"
                    @click="watchProduct(row)"
                  />
                </abbr>
              </el-col>
              <el-col :span="12">
                <el-popconfirm
                  confirm-button-text="删除"
                  cancel-button-text="取消"
                  confirm-button-type="danger"
                  icon="el-icon-delete"
                  icon-color="red"
                  title="确定删除该条数据吗？"
                  @onConfirm="handleDelete(row, $index)"
                >
                  <abbr title="删除" slot="reference">
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                    />
                  </abbr>
                </el-popconfirm>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="moreLoading" class="text-center">加载中...</p>
      <p v-if="noMore" class="text-center">没有更多了</p>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 30px"
      >
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="temp.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="绑定设备" prop="product">
          <el-select
            v-model="temp.product"
            class="filter-item"
            placeholder="请选择设备"
          >
            <el-option
              v-for="item in unitLeaderOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属楼宇" prop="building">
          <el-cascader
            placeholder="请选择所属楼宇 "
            :options="options"
            v-model="temp.building"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          :loading="dialogFormSobmitLoading"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProductList } from "@/api/device-management";
// import { parseTime } from "@/utils/index"

export default {
  filters: {
    nodeTypeFilter(type) {
      const typeMap = {
        0: "设备",
        1: "网关",
      };
      return typeMap[type];
    },
    // parseTime: parseTime,
  },
  data() {
    return {
      page: 1,
      pageSize: 30,
      moreLoading: false,
      noMore: false,
      list: [],
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      textMap: {
        update: "修改模型",
        create: "添加模型",
      },
      temp: {
        id: undefined,
        product: "",
        modelName: "",
        building: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published",
      },
      dialogStatus: "",
      unitLeaderOptions: ["张三", "李四"],
      options: [
        {
          value: "aa",
          label: "1栋",
          children: [
            {
              value: "bb",
              label: "1F",
              children: [
                {
                  value: "bb",
                  label: "1-102",
                },
                {
                  value: "bb",
                  label: "1-103",
                },
                {
                  value: "bb",
                  label: "1-101",
                },
              ],
            },
            {
              value: "bb",
              label: "2F",
              children: [
                {
                  value: "bb",
                  label: "1-202",
                },
                {
                  value: "bb",
                  label: "1-203",
                },
                {
                  value: "bb",
                  label: "1-201",
                },
              ],
            },
          ],
        },
      ],
      rules: {
        modelName: [
          { required: true, message: "模型名称不能为空", trigger: "blur" },
        ],
        product: [
          { required: true, message: "绑定设备不能为空", trigger: "blur" },
        ],
        building: [
          { required: true, message: "所属楼宇不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    console.log("created");
    this.fetchData();
  },
  beforeCreate() {
    console.log("beforeCreate");
  },
  mounted() {
    console.log("mounted");
  },
  destroyed() {
    console.log("destroyed");
  },
  computed: {
    disabled() {
      return this.moreLoading || this.noMore;
    },
  },
  methods: {
    fetchData(currentPage) {
      if (currentPage) {
        this.page = currentPage;
      }
      if (this.page === 1) {
        this.listLoading = true;
      }
      this.moreLoading = true;
      getProductList(this.page, this.pageSize).then((response) => {
        this.listLoading = false;
        this.moreLoading = false;
        const { code, data, msg } = response;
        if (code === 0) {
          // const {total, list} = data;
          // this.totalCount = total;
          // this.list = list;
          this.list.push(...data);
          this.noMore = data.length < this.pageSize;
        } else {
          this.$message.error(msg || "模型列表获取失败！");
        }
      });
    },
    load() {
      this.fetchData(this.page + 1);
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleCreate() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleSearch() {
      console.log(this.selectValue);
    },
    watchProduct(data) {
      this.$router.push({
        name: "DeviceList",
        params: {
          productKey: data.productKey,
        },
      });
    },
    handleDelete(data, index) {
      console.log("asdsf");
      console.log(data);
      this.$notify({
        title: "Success",
        message: "Delete Successfully",
        type: "success",
        duration: 2000,
      });
      this.list.splice(index, 1);
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          console.log(this.temp);
          this.dialogFormSobmitLoading = true;
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          this.$notify({
            title: "Success",
            message: "Update Successfully",
            type: "success",
            duration: 2000,
          });
          // updateArticle(tempData).then(() => {
          //   const index = this.list.findIndex(v => v.id === this.temp.id)
          //   this.list.splice(index, 1, this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: 'Success',
          //     message: 'Update Successfully',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        console.log(valid);
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          this.$notify({
            title: "Success",
            message: "Update Successfully",
            type: "success",
            duration: 3000,
          });
          this.fetchData();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.search-box {
  margin-block-end: 16px;
}
</style>