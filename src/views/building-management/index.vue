<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <el-tree
          :props="props"
          :load="loadNode"
          lazy
          highlight-current
          @node-click="handleNodeClick"
        >
        </el-tree>
      </el-col>
      <el-col :span="18">
        <el-row>
          <el-col>
            <el-breadcrumb class="breadcrumb-box" separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbList" :key="item">{{item}}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
        </el-row>
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
          <el-button type="primary" :disabled="selectItem.type === undefined" @click="handleCreate">添加{{typeName}}</el-button>
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
          <el-table-column label="名称">
            <template slot-scope="scope">
              {{ scope.row.title }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.author }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="110" align="center">
            <template slot-scope="scope">
              {{ scope.row.pageviews }}
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

        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogFormVisible"
        >
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="temp"
            label-position="left"
            label-width="120px"
            style="width: 400px; margin-left: 30px"
          >
            <el-form-item label="名称" prop="name">
              <el-input
                v-model="temp.name"
                placeholder="请输入名称"
              />
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select
                v-model="temp.type"
                class="filter-item"
                disabled
                placeholder="请选择类型"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
      </el-col>
    </el-row>
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
  computed: {
    typeName() {
      return this.type2Name(this.selectItem.type);
    },
    dialogTitle() {
      return `${this.dialogStatus == 'create' ? '添加' : '修改'}${this.type2Name(this.selectItem.type)}`
    },
    breadcrumbList() {
      let arr = [];
      if (!this.selectNode) {
        arr.push("未选择")
      }
      let node = this.selectNode || {};
      do {
        if (node.parent) {
          arr.unshift(node.data.name);
        }
        node = node.parent;
      } while (node && node.parent);
      return arr;
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      selectItem: {},
      selectNode: undefined,
      temp: {
        id: undefined,
        name: "",
        type: "",
        noteName: "",
      },
      dialogStatus: "",
      typeOptions: [
        {label: '楼宇', value: 1},
        {label: '楼层', value: 2},
        {label: '房间', value: 3},
      ],
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" },
        ],
        noteName: [
          { required: true, message: "备注名称不能为空", trigger: "blur" },
        ],
      },
      props: {
        label: "name",
        children: "zones",
        isLeaf: (data) => {
          return data.type === 3;
        },
      },
      count: 1,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    type2Name(type) {
      let item = this.typeOptions.find(v => v.value == type);
      return item ? item.label : '';
    },
    handleNodeClick(data, node) {
      if (this.selectItem.name != data.name) {
        this.selectItem = data;
        this.selectNode = node;
      }
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([
          { name: `${this.count++}栋`, type: 1 }, 
          { name: `${this.count++}栋`, type: 1 }
        ]);
      }
      if (node.level === 1) {
        return resolve([
          { name: `${this.count++}F`, type: 2 }, 
          { name: `${this.count++}F`, type: 2 }
        ]);
      } 
      if (node.level === 2) {
        return resolve([
          { name: `${this.count++}室`, type: 3 }, 
          { name: `${this.count++}室`, type: 3 }
        ]);
      } 
    },
    fetchData() {
      this.listLoading = true;
      getList().then((response) => {
        this.list = response.data.items;
        this.listLoading = false;
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
      this.temp = {
        type: this.selectItem.type
      }
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
    },
  },
};
</script>

<style lang="scss" scoped>
  .breadcrumb-box {
    margin-block-end: 16px;
  }
</style>
