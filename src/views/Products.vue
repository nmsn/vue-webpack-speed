<template>
  <div class="products-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>产品列表</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="refreshProducts"
          >刷新</el-button
        >
      </div>

      <el-row :gutter="20" class="search-row">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索产品名称"
            @input="handleSearch"
            clearable
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            @change="filterByCategory"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-table
        :data="filteredProducts"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column
          prop="name"
          label="产品名称"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="category"
          label="分类"
          width="120"
        ></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope"> ¥{{ scope.row.price }} </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="库存"
          width="100"
        ></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalProducts"
        style="margin-top: 20px; text-align: right"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Products",
  data() {
    return {
      loading: false,
      searchKeyword: "",
      selectedCategory: "",
      currentPage: 1,
      pageSize: 10,
      totalProducts: 0,
      products: [],
      filteredProducts: [],
      categories: ["电子产品", "服装", "食品", "图书", "家居"],
    };
  },
  created() {
    this.generateMockData();
  },
  methods: {
    generateMockData() {
      this.loading = true;
      // 使用 lodash 生成模拟数据
      this.products = _.times(100, (i) => ({
        id: i + 1,
        name: `产品 ${i + 1}`,
        category: _.sample(this.categories),
        price: _.random(10, 1000),
        stock: _.random(0, 100),
        description: `这是产品 ${i + 1} 的详细描述信息`,
      }));
      this.totalProducts = this.products.length;
      this.updateFilteredProducts();
      this.loading = false;
    },
    updateFilteredProducts() {
      let filtered = [...this.products];

      // 按关键词搜索
      if (this.searchKeyword) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      }

      // 按分类筛选
      if (this.selectedCategory) {
        filtered = filtered.filter(
          (product) => product.category === this.selectedCategory
        );
      }

      // 分页
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.filteredProducts = filtered.slice(start, end);
      this.totalProducts = filtered.length;
    },
    handleSearch: _.debounce(function () {
      this.currentPage = 1;
      this.updateFilteredProducts();
    }, 300),
    filterByCategory() {
      this.currentPage = 1;
      this.updateFilteredProducts();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updateFilteredProducts();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updateFilteredProducts();
    },
    handleEdit(row) {
      this.$message.info(`编辑产品: ${row.name}`);
    },
    handleDelete(row) {
      this.$confirm(`确定要删除产品 "${row.name}" 吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.products = this.products.filter((p) => p.id !== row.id);
          this.updateFilteredProducts();
          this.$message.success("删除成功!");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    refreshProducts() {
      this.generateMockData();
      this.$message.success("数据已刷新");
    },
  },
};
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.search-row {
  margin-bottom: 20px;
}
</style>