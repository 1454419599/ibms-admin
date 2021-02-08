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
      <el-button type="primary" @click="handleCreate">添加单位</el-button>
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
      <el-table-column label="单位名称">
        <template slot-scope="{row}">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="单位地址" align="center">
        <template slot-scope="{row}">
          <span>{{ row.site }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单位负责人" width="110" align="center">
        <template slot-scope="{row}">
          {{ row.user.name }}
        </template>
      </el-table-column>
      <el-table-column
        class-name="status-col"
        label="负责人电话"
        width="110"
        align="center"
      >
        <template slot-scope="{row}">
          {{ row.user.telephone }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="创建时间"
        width="250"
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
        label-width="100px"
        style="width: 400px; margin-left: 30px"
      >
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="单位地址" prop="site">
          <el-input v-model="temp.site" placeholder="请输入单位地址" />
        </el-form-item>
        <el-form-item label="单位负责人" prop="unitLeader">
          <el-select
            v-model="temp.unitLeader"
            class="filter-item"
            placeholder="请选择单位负责人"
          >
            <el-option
              v-for="item in unitLeaderOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
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
import { getUserList } from '@/api/user-management'
import { getUnitList, registerUnit, deleteUnit, updateUnit } from "@/api/unit-management";

export default {
  data() {
    return {
      list: null,
      page: 1,
      pageSize: 30,
      totalCount: 0,
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      textMap: {
        update: "修改单位",
        create: "添加单位",
      },
      temp: {
        id: undefined,
        name: "",
        site: "",
        unitLeader: "",
      },
      dialogStatus: "",
      unitLeaderOptions: [],
      rules: {
        name: [
          { required: true, message: "单位名称不能为空", trigger: "blur" },
        ],
        site: [
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
    fetchData(currentPage) {
      if (currentPage) {
        this.page = currentPage;
      }
      this.listLoading = true;
      getUnitList(this.page, this.pageSize).then((response) => {
        const {code, data, msg} = response;
        if (code === 0) {
          const {total, list} = data;
          this.list = list;
          this.totalCount = total;
        } else {
          this.$notify.error(msg);
        }
        this.listLoading = false;
      }).catch(err => {
        this.$notify.error("单位信息列表获取失败")
      });
    },
    getAllUserList() {
      if (!this.isLoadUserList) {
        this.isLoadUserList = true;
        this.singleUserList(1, 30);
      }
    },
    singleUserList(page, pageSize) {
      getUserList(page, pageSize).then(res => {
        const {code, data} = res;
        if (code === 0) {
          const {list, pages, pageNum} = data
          list.forEach(element => {
            this.unitLeaderOptions.push({
              id: element.id,
              username: element.name
            })
          });
          if (pageNum < pages) {
            this.singleUserList(pageNum + 1, pageSize)
          }
        }
      })
    },
    handleUpdate(row) {
      this.getAllUserList();
      this.temp = Object.assign({unitLeader: row.userId}, row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleCreate() {
      this.getAllUserList();
      this.temp = {};
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
      const {id, name} = data;
      deleteUnit(id).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          this.$notify({
            title: '删除成功！',
            message: `单位 ” ${name} “ 已删除`,
            type: 'success',
            duration: 3000
          })
          this.list.splice(index, 1)
        }
      })
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {id, name, site, unitLeader} = this.temp;
          updateUnit(id, site, unitLeader, name).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, msg, data} = res;
            if (code === 0) {
              this.$notify({
                title: "更新单位",
                message: `成功更新单位：${name}`,
                type: "success",
                duration: 3000,
              });
              this.fetchData();
              this.dialogFormVisible = false;
            } else {
              this.$notify.info(msg);
            }
          }).catch(err => {
            this.dialogFormSobmitLoading = false;
            this.$notify.error("更新单位错误！")
          })
        }
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {name, site, unitLeader} = this.temp;
          registerUnit(site, unitLeader, name).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, msg, data} = res;
            if (code === 0) {
              this.$notify({
                title: "添加单位",
                message: `成功添加单位：${name}`,
                type: "success",
                duration: 3000,
              });
              this.fetchData();
              this.dialogFormVisible = false;
            } else {
              this.$notify.info(msg);
            }
          }).catch(err => {
            this.dialogFormSobmitLoading = false;
            this.$notify.error("创建单位错误！")
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