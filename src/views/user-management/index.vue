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
      <el-button type="primary" @click="handleCreate">添加用户</el-button>
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
      <el-table-column label="用户姓名">
        <template slot-scope="{row}">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="登录账号" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" width="110" align="center">
        <template slot-scope="{row}">
          {{ row.telephone }}
        </template>
      </el-table-column>
      <el-table-column
        class-name="status-col"
        label="账户类型"
        width="110"
        align="center"
      >
        <template slot-scope="{row}">
         <el-tag :type="row.authorities | authoritiesStatusFilter">
            {{ row.authorities | authoritiesValueFilter }}
          </el-tag>
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
      :total="totalCount">
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
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="temp.name" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="temp.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telephone">
          <el-input v-model="temp.telephone" placeholder="请输入登录账户" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="temp.password" placeholder="请输入登录密码" />
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
import { getUserList, deleteUser, registerUser } from '@/api/user-management'

export default {
  filters: {
    authoritiesStatusFilter(status) {
      if (status.length > 0) {
        switch (status[0].authority) {
          case 'ROLE_SUPER_ADMIN':
            return 'danger'
          case 'ROLE_USER':
            return 'success'
        } 
      }
      return "info";
    },
    authoritiesValueFilter(status) {
      if (status.length > 0) {
        return status[0].nameZh
      }
      return "未知";
    },
  },
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 30,
      totalCount: 0,
      listLoading: true,
      dialogFormVisible: false,
      dialogFormSobmitLoading: false,
      selectValue: "",
      textMap: {
        update: "修改用户",
        create: "添加用户",
      },
      temp: {
        id: undefined,
        username: "",
        name: "",
        telephone: "",
        password: "",
      },
      dialogStatus: "",
      rules: {
        username: [
          { required: true, message: "登录账号不能为空", trigger: "blur" },
        ],
        name: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
        ],
        telephone: [
          { required: true, message: "登录账户不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "登录密码不能为空", trigger: "blur" },
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
      getUserList(this.page, this.pageSize).then((response) => {
        this.listLoading = false;
        const {code, data, msg} = response;
        if (code === 0) {
          const {total, list} = data;
          this.totalCount = total;
          this.list = list;
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
      const {id, name} = data;
      deleteUser(id).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          this.$notify({
            title: '删除成功！',
            message: `用户 ${name} 已删除`,
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
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          this.$notify({
            title: "Success",
            message: "Update Successfully",
            type: "success",
            duration: 2000,
          });
        }
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {name, username, telephone, password} = this.temp;
          registerUser(name, username, telephone, password).then(res => {
            this.$notify({
              title: "用户添加成功",
              message: `用户 ${name} 创建成功`,
              type: "success",
              duration: 3000,
            });
            this.dialogFormSobmitLoading = false;
            this.dialogFormVisible = false;
            this.fetchData();
          }).catch(err => {
            this.dialogFormSobmitLoading = false;
            this.$notify.error("创建错误！")
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