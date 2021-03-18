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
      <el-button type="primary" @click="handleCreate">添加模型</el-button>
    </el-row>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="{row}">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column label="模型名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定设备" align="center">
        <template slot-scope="{row}">
          {{ row.deviceName }}
        </template>
      </el-table-column>
      <el-table-column label="所属楼宇" width="140" align="center">
        <template slot-scope="{row}">
          {{ row.buildingName }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="创建时间"
        width="200"
      >
        <template slot-scope="{row}">
          <i class="el-icon-time" />
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="{ row, $index }">
          <el-row>
            <el-col :span="12">
              <abbr title="编辑">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="handleUpdate(row)"
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
                  <el-button type="danger" size="mini" icon="el-icon-delete"/>
                </abbr>
              </el-popconfirm>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      class="pagination-box"
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :page-count="page"
      :total="totalCount"
      @current-change="fetchData">
    </el-pagination>

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
          <el-cascader
            placeholder="请选择设备 "
            :props="deviceProps"
            v-model="temp.product">
          </el-cascader>
        </el-form-item>
        <el-form-item label="所属楼宇" prop="building">
          <el-cascader
            placeholder="请选择所属楼宇 "
            :props="buildingProps"
            v-model="temp.building">
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
import { getModelList, createModel, deleteModel, updateModel } from "@/api/model-management";
import {getBuildingList} from '@/api/building-management';
import {getProductList, getDeviceList} from '@/api/device-management';
import { parseTime } from "@/utils/index"

export default {
  filters: {
    parseTime: parseTime,
  },
  data() {
    return {
      page: 1,
      pageSize: 30,
      totalCount: 0,
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      textMap: {
        update: "修改模型",
        create: "添加模型",
      },
      temp: {
        product: [],
        modelName: "",
        building: [],
      },
      dialogStatus: "",
      unitLeaderOptions: ["张三", "李四"],
      buildingProps: {
        lazy: true,
        lazyLoad: (node, resolve) => {
          console.log(node);
          const { data } = node;
          let parentId = data ? data.value : undefined;
          this.getSingleBuildingList(parentId, 1, this.pageSize, resolve, []);
        }
      },
      deviceProps: {
        lazy: true,
        lazyLoad: (node, resolve) => {
          console.log(node);
          const { level, value } = node;
          if (level === 0) {
            this.getSingleProductList(1, this.pageSize, resolve, []);
          } else {
            this.getSingleDeviceList(value, 1, this.pageSize, resolve, []);
          }
        }
      },
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
    this.fetchData();
  },
  methods: {
    fetchData(currentPage) {
      if (currentPage) {
        this.page = currentPage;
      }
      this.listLoading = true;
      getModelList(this.page, this.pageSize).then((response) => {
        this.listLoading = false;
        const {code, data, msg} = response;
        if (code === 0) {
          const {total, list} = data;
          this.totalCount = total;
          this.list = list;
        } else {
          this.$message.error(msg || "模型列表获取失败！")
        }
      });
    },
    handleUpdate(row) {
      this.temp = {
        id: row.id,
        modelName: row.name, 
        building: [], 
        product: [],
      };
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleCreate() {
      this.temp = {}
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    getSingleBuildingList(parentId, page, pageSize, resolve, children) {
      getBuildingList(parentId, page, pageSize).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          const {pageNum, pages, list} = data;
          children.push(...list.map(v => ({value: v.id, label: v.name, leaf: v.type === 3})))
          if (pageNum < pages) {
            this.getSingleBuildingList(parentId, pageNum + 1, pageSize, resolve, children);
          } else {
            resolve(children)
          }
        }
      });
    },
    getSingleProductList(page, pageSize, resolve, children) {
      getProductList(page, pageSize).then(res => {
        const { code, data, msg } = res;
        if (code === 0) {
          const {list, pageCount} = data.data;
          children.push(...list.productInfo.map(v => ({value: v.productKey, label: v.productName, leaf: false})))
          if (page < pageCount) {
            this.getSingleProductList(page + 1, pageSize, resolve, children);
          } else {
            resolve(children)
          }
        }
      })
    },
    getSingleDeviceList(productKey, page, pageSize, resolve, children) {
      getDeviceList(productKey, page, pageSize).then(res => {
        const { code, data, msg } = res;
        if (code === 0) {
          const {deviceInfo} = data.data;
          children.push(...deviceInfo.map(v => ({value: {iotId: v.iotId, deviceName: v.deviceName, productKey: v.productKey}, label: v.deviceName, leaf: true})))
          if (page < data.pageCount) {
            this.getSingleDeviceList(productKey, page + 1, pageSize, resolve, children);
          } else {
            resolve(children)
          }
        }
      })
    },
    handleSearch() {
      console.log(this.selectValue);
    },
    handleDelete(data, index) {
      deleteModel(data.id).then(res => {
        const {code, data, msg} = res
        if (code === 0) {
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 3000
          })
          this.list.splice(index, 1)
        } else {
          this.$notify.error(msg || "删除失败!")
        }
      })
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const {id, modelName, building, product } = this.temp;
          const {iotId, productKey, deviceName} = product[1];
          const buildingId = building[2];
          this.dialogFormSobmitLoading = true;
          updateModel(id, modelName, buildingId, iotId, productKey, deviceName).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, data, msg} = res
            if (code === 0) {
              this.$notify({
                title: "Success",
                message: "更新成功",
                type: "success",
                duration: 3000,
              });
              this.fetchData();
            } else {
              this.$notify.error(msg || "更新失败!")
            }
          }).finally(() => {
            this.dialogFormVisible = false
          })
        }
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {modelName, building, product } = this.temp;
          const {iotId, productKey, deviceName} = product[1];
          const buildingId = building[2];
          createModel(modelName, buildingId, iotId, productKey, deviceName).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, data, msg} = res;
            if (code === 0) {
              this.$notify({
                title: "Success",
                message: "创建成功",
                type: "success",
                duration: 3000,
              });
              this.fetchData();
            } else {
              this.$notify.error(msg || "创建失败!")
            }
          }).catch(err => {
            this.$notify.error("创建失败!")
          }).finally(() => {
            this.dialogFormVisible = false
          })
        }
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.search-box {
  margin-block-end: 16px;
}
</style>