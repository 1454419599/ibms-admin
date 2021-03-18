<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <el-tree
          :data="buildingData"
          :props="props"
          :load="loadNode"
          lazy
          highlight-current
          ref="tree"
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
          <el-button type="primary" :disabled="selectItem.type == 3" @click="handleCreate">添加{{typeName}}</el-button>
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
          <el-table-column label="名称" align="center">
            <template slot-scope="{row}">
              {{ row.name }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template slot-scope="{row}">
              <span>{{ type2Name(row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="{row}">
              {{ row.comment }}
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
              <span>{{ row.createTime | parseTime }}</span>
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

        <el-pagination
          class="pagination-box"
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :page-count="page"
          :total="totalCount"
          @current-change="fetchData">
        </el-pagination>

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
import { createBuilding, updateBuilding, deleteBuilding, getBuildingList } from "@/api/building-management";
import { parseTime } from "@/utils/index"

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
    parseTime: parseTime,
  },
  computed: {
    typeName() {
      let type = this.selectItem.type ? this.selectItem.type + 1 : 1;
      if (type > 3) {
        type = 3
      }
      return this.type2Name(type);
    },
    dialogTitle() {
      return `${this.dialogStatus == 'create' ? '添加' : '修改'}${this.typeName}`
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
      page: 1,
      pageSize: 30,
      totalCount: 0,
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
          return data.type === 3 || data.type === 0;
        },
      },
      buildingData: [
        { name: `添加楼宇`, type: 0 },
      ]
    };
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
        this.page = 1;
        if (data.type === 0) {
          this.list = this.buildingData.slice(1);
        } else if (data.type === 3) {
          this.list = node.parent.data.children;
        } else {
          this.list = data.children;
        }
      }
    },
    getAllBuildingList(resolve) {
      this.getSingleBuildingList(1, this.pageSize, resolve);
    },
    getSingleBuildingList(page, pageSize, resolve) {
      getBuildingList(undefined, page, pageSize).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          const {pageNum, pages, list} = data;
          this.buildingData.push(...list);
          if (pageNum < pages) {
            this.getSingleBuildingList(pageNum + 1, pageSize, resolve);
          } else {
            this.listLoading = false;
            this.list = this.buildingData.slice(1)
            resolve(this.buildingData)
          }
        }
      });
    },
    getFloorItemAllList(parentId, resolve) {
      const parent = this.buildingData.find(e => e.id === parentId)
      if (!(parent && parent.children instanceof Array)) {
        this.listLoading = true;
        this.getSingleFloorItemAllList(parentId, 1, this.pageSize, resolve);
      }
    },
    getSingleFloorItemAllList(parentId, page, pageSize, resolve) {
      getBuildingList(parentId, page, pageSize).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          const {pageNum, pages, list} = data;
          let parent = this.buildingData.find(e => e.id == parentId);
          let children = parent.children
          if (!children) {
            children = [];
            this.$set(parent, 'children', children)
          }
          children.push(...list);
          if (pageNum < pages) {
            this.getSingleFloorItemAllList(parentId, pageNum + 1, pageSize, resolve);
          } else {
            this.listLoading = false;
            resolve(children)
            this.list = children
          }
        }
      });
    },
    getRoomItemAllList(grandfatherId, parentId, resolve) {
      for (let i = 0; i < this.buildingData.length; i++) {
        if (this.buildingData[i].id == grandfatherId) {
          const grandfather = this.buildingData[i];
          for (let j = 0; j < grandfather.length; j++) {
            if (grandfather[j].id == parentId) {
              return;
            }
          }
        }
      }
      this.listLoading = true;
      this.getSingleRoomItemAllList(grandfatherId, parentId, 1, this.pageSize, resolve);
    },
    getSingleRoomItemAllList(grandfatherId, parentId, page, pageSize, resolve) {
      getBuildingList(parentId, page, pageSize).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          const {pageNum, pages, list} = data;
          let grandfather = this.buildingData.find(e => e.id == grandfatherId);
          
          let grandfatherChildren = grandfather.children
          if (!grandfatherChildren) {
            grandfatherChildren = grandfather.children = []
          }
          let parent = grandfatherChildren.find(e => e.id == parentId);
          let children = parent.children
          if (!children) {
            children = []
            this.$set(parent, 'children', children)
          }
          children.push(...list);
          if (pageNum < pages) {
            this.getSingleRoomItemAllList(grandfatherId, parentId, pageNum + 1, pageSize, resolve);
          } else {
            this.listLoading = false;
            resolve(children)
            this.list = children
          }
        }
      });
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.getAllBuildingList(resolve);
        return
      } else if (node.level === 1) {
        this.getFloorItemAllList(node.data.id, resolve)
        return
      } 
      if (node.level === 2) {
        this.getRoomItemAllList(node.parent.data.id, node.data.id, resolve)
        return
      } 
    },
    fetchData(currentPage) {
      
    },
    handleUpdate(row) {
      this.updateItemData = row;
      this.temp = Object.assign({noteName: row.comment}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleCreate() {
      this.dialogStatus = "create";
      let type = this.selectItem.type ? this.selectItem.type + 1 : 1;
      if (type > 3) {
        type = 3
      }
      this.temp = {
        id: this.selectItem.id,
        type: type
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
      const removeItemId = data.id;
      deleteBuilding(data.id).then(res => {
        const {code, data, msg} = res;
        if (code === 0) {
          this.$notify({
            title: "Success",
            message: "删除成功",
            type: "success",
            duration: 3000,
          });
          this.list.splice(index, 1);
          let node = this.selectNode.childNodes.find(v => {console.log(v); return v.data.id === removeItemId})
          this.$refs.tree.remove(node)
        } else {
          this.$notify.error(msg)
        }
      }).catch(err => {
        this.$notify.error("删除失败!")
      })
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {id, name, noteName} = this.temp;
          updateBuilding(id, name, noteName).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, data, msg} = res;
            if (code === 0) {
              this.$notify({
                title: "Success",
                message: "更新成功",
                type: "success",
                duration: 3000,
              });
              Object.assign(this.updateItemData, {name, comment: noteName})
              this.dialogFormVisible = false;
            } else {
              this.$notify.error(msg)
            }
          }).catch(err => {
            this.$notify.error("更新失败!")
          })
        }
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.dialogFormSobmitLoading = true;
          const {id, name, noteName, type} = this.temp;
          createBuilding(id, name, type, noteName).then(res => {
            this.dialogFormSobmitLoading = false;
            const {code, data, msg} = res;
            if (code === 0) {
              this.$notify({
                title: "Success",
                message: "创建成功",
                type: "success",
                duration: 3000,
              });
              if (this.selectItem.type > 0) {
                let children = this.selectItem.children;
                if (!children) {
                  children = []
                  this.$set(this.selectItem, 'children', children)
                }
                children.push(data);
                this.$refs.tree.append(data, this.selectNode)
                this.list = children;
              } else {
                this.buildingData.push(data)
                this.list = this.buildingData.slice(1);
              }
            } else {
              this.$notify.error(msg);
            }
            this.dialogFormVisible = false;
          }).catch(err => {
            this.$notify.error("创建失败!")
          });
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
