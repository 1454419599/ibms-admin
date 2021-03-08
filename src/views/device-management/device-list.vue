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
      <el-button type="primary" @click="handleCreate">添加设备</el-button>
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
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="DeviceName">
        <template slot-scope="{row}">
          {{ row.deviceName }}
        </template>
      </el-table-column>
      <el-table-column label="设备所属产品" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.deviceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态/启用状态" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.deviceStatus | deviceStatusFilter">
            {{ row.deviceStatus | deviceValueFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="最后上线时间"
        width="200"
      >
        <template slot-scope="{row}">
          <i class="el-icon-time" />
          <span>{{ row.gmtCreate | parseTime }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 30px"
      >
        <el-form-item label="产品" prop="product">
          <el-select
            v-model="temp.product"
            class="filter-item"
            placeholder="请选择产品"
          >
            <el-option
              v-for="item in unitLeaderOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="DeviceName" prop="deviceName">
          <el-input v-model="temp.deviceName" placeholder="请输入DeviceName" />
        </el-form-item>
        <el-form-item label="备注名称" prop="noteName">
          <el-input v-model="temp.noteName" placeholder="请输入备注名称" />
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
import { getDeviceList } from "@/api/device-management";
import { parseTime } from "@/utils/index"

export default {
  filters: {
    deviceValueFilter(status) {
      const valueMap = {
        ONLINE: "设备在线",
        OFFLINE: "设备离线",
        UNACTIVE: "设备未激活",
        DISABLE: "设备已禁用",
      };
      return valueMap[status];
    },
    deviceStatusFilter(status) {
      const statusMap = {
        ONLINE: "success",//设备在线
        OFFLINE: "info",//设备离线
        UNACTIVE: "",//设备未激活
        DISABLE: "danger",//设备已禁用
      };
      return statusMap[status];
    },
    parseTime: parseTime,
  },
  data() {
    return {
      page: 1,
      pageSize: 30,
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      textMap: {
        update: "修改设备",
        create: "添加设备",
      },
      temp: {
        id: undefined,
        product: "",
        deviceName: "",
        noteName: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published",
      },
      dialogStatus: "",
      unitLeaderOptions: ["张三", "李四"],
      rules: {
        product: [
          { required: true, message: "单位名称不能为空", trigger: "blur" },
        ],
        noteName: [
          { required: true, message: "备注名称不能为空", trigger: "blur" },
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
      getDeviceList(this.$route.params.productKey, this.page, this.pageSize).then((response) => {
        this.listLoading = false;
        const {code, data, msg} = response;
        if (code === 0) {
          // const {total, list} = data;
          // this.totalCount = total;
          // this.list = list;
          this.list = data;
        } else {
          this.$message.error(msg || "设备列表获取失败！")
        }
      });
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
    handleDelete(data, index) {
      console.log("asdsf");
      console.log(data);
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
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
    }
  },
};
</script>

<style lang="scss" scoped>
.search-box {
  margin-block-end: 16px;
}
</style>