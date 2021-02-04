<template>
  <div class="app-container">
    <el-row type="flex" justify="space-between" class="search-box">
      <el-col :span="12">
        <el-input
          placeholder="请输入内容"
          v-model="selectValue"
          class="input-with-select"
          @change="handleSelect"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSelect"
          ></el-button>
        </el-input>
      </el-col>
      <el-button type="primary">添加单位</el-button>
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
      <el-table-column label="单位名称">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="单位地址" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单位负责人" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column
        class-name="status-col"
        label="负责人电话"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="创建时间"
        width="200"
      >
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="{ row }">
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
                @onConfirm="handleDelete(row)"
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
        label-width="100px"
        style="width: 400px; margin-left: 30px"
      >
        <el-form-item label="单位名称" prop="unitName">
          <el-input v-model="temp.unitName" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="单位地址" prop="unitAddress">
          <el-input v-model="temp.unitAddress" placeholder="请输入单位地址" />
        </el-form-item>
        <el-form-item label="单位负责人" prop="unitLeader">
          <el-select
            v-model="temp.unitLeader"
            class="filter-item"
            placeholder="请选择单位负责人"
          >
            <el-option
              v-for="item in unitLeaderOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList } from "@/api/table";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger",
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      selectValue: "",
      textMap: {
        update: "修改单位",
        create: "添加单位",
      },
      temp: {
        id: undefined,
        unitName: "",
        unitAddress: "",
        unitLeader: "",
        remark: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published",
      },
      dialogStatus: "",
      unitLeaderOptions: ["张三", "李四"],
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change",
          },
        ],
        unitName: [
          { required: true, message: "单位名称不能为空", trigger: "blur" },
        ],
        unitAddress: [
          { required: true, message: "单位地址不能为空", trigger: "blur" },
        ],
        unitLeader: [
          { required: true, message: "单位负责人不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getList().then((response) => {
        this.list = response.data.items;
        this.listLoading = false;
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleSelect() {
      console.log(this.selectValue);
    },
    handleDelete(data) {

      console.log("asdsf");
      console.log(data);
      
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
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
  },
};
</script>

<style lang="scss" scoped>
.search-box {
  margin-block-end: 16px;
}
</style>