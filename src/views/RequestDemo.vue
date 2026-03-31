<template>
  <div class="request-demo">
    <el-row :gutter="20">
      <!-- Control Panel -->
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>控制面板</span>
          </div>

          <!-- User Request Controls -->
          <el-card class="control-card" shadow="hover">
            <div slot="header" class="control-header">
              <span>用户请求 (user)</span>
              <el-switch v-model="userEnabled" active-text="启用" inactive-text="禁用"></el-switch>
            </div>
            <el-form label-width="80px" size="small">
              <el-form-item label="staleTime">
                <el-input-number v-model="userStaleTime" :min="0" :step="1000"></el-input-number>
                <span class="unit">ms</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="mini" @click="userRefetch" :loading="user.loading">refetch</el-button>
                <el-button size="mini" @click="userInvalidate">invalidate</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- Products Request Controls -->
          <el-card class="control-card" shadow="hover">
            <div slot="header" class="control-header">
              <span>产品列表 (products)</span>
              <el-switch v-model="productsEnabled" active-text="启用" inactive-text="禁用"></el-switch>
            </div>
            <el-form label-width="80px" size="small">
              <el-form-item label="staleTime">
                <el-input-number v-model="productsStaleTime" :min="0" :step="1000"></el-input-number>
                <span class="unit">ms</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="mini" @click="productsRefetch" :loading="products.loading">refetch</el-button>
                <el-button size="mini" @click="productsInvalidate">invalidate</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- Special Test Controls -->
          <el-card class="control-card" shadow="hover">
            <div slot="header">
              <span>特殊测试</span>
            </div>
            <el-form label-width="100px" size="small">
              <el-form-item label="Race Condition">
                <el-button size="mini" type="warning" @click="testRaceCondition">测试竞态</el-button>
              </el-form-item>
              <el-form-item label="Error Trigger">
                <el-button size="mini" type="danger" @click="triggerError">触发错误</el-button>
              </el-form-item>
              <el-form-item label="Manual Error">
                <el-button size="mini" type="danger" @click="testManualError">手动错误请求</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-card>
      </el-col>

      <!-- Results Display -->
      <el-col :span="16">
        <!-- User Result -->
        <el-card class="result-card">
          <div slot="header">
            <span>用户信息 (user)</span>
            <el-tag v-if="user.loading" type="warning" size="small" style="margin-left: 10px">Loading...</el-tag>
            <el-tag v-if="user.error" type="danger" size="small" style="margin-left: 10px">Error</el-tag>
            <el-tag v-if="user.data && !user.loading && !user.error" type="success" size="small" style="margin-left: 10px">Success</el-tag>
          </div>

          <el-alert
            v-if="user.error"
            :title="user.errorMsg"
            type="error"
            :closable="false"
            show-icon
            style="margin-bottom: 15px"
          ></el-alert>

          <el-descriptions :column="2" border v-if="user.data">
            <el-descriptions-item label="ID">{{ user.data.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ user.data.name }}</el-descriptions-item>
            <el-descriptions-item label="邮箱" :span="2">{{ user.data.email }}</el-descriptions-item>
            <el-descriptions-item label="fetchedAt">{{ userFetchedAt }}</el-descriptions-item>
          </el-descriptions>

          <div v-else-if="!user.loading && !user.error" class="no-data">暂无数据</div>
        </el-card>

        <!-- Products Result -->
        <el-card class="result-card">
          <div slot="header">
            <span>产品列表 (products)</span>
            <el-tag v-if="products.loading" type="warning" size="small" style="margin-left: 10px">Loading...</el-tag>
            <el-tag v-if="products.error" type="danger" size="small" style="margin-left: 10px">Error</el-tag>
            <el-tag v-if="products.data && !products.loading && !products.error" type="success" size="small" style="margin-left: 10px">Success</el-tag>
          </div>

          <el-alert
            v-if="products.error"
            :title="products.errorMsg"
            type="error"
            :closable="false"
            show-icon
            style="margin-bottom: 15px"
          ></el-alert>

          <el-table
            v-if="products.data"
            :data="products.data"
            v-loading="products.loading"
            style="width: 100%"
            size="small"
          >
            <el-table-column prop="id" label="ID" width="60"></el-table-column>
            <el-table-column prop="name" label="产品名称" width="150"></el-table-column>
            <el-table-column prop="category" label="分类" width="120"></el-table-column>
            <el-table-column prop="price" label="价格">
              <template slot-scope="scope"> ¥{{ scope.row.price }} </template>
            </el-table-column>
          </el-table>

          <div v-if="products.data" class="fetched-info">
            <span>fetchedAt: {{ productsFetchedAt }}</span>
          </div>

          <div v-else-if="!products.loading && !products.error" class="no-data">暂无数据</div>
        </el-card>

        <!-- Manual Error Result -->
        <el-card class="result-card" v-if="manualErrorData">
          <div slot="header">
            <span>手动错误请求结果</span>
            <el-tag type="danger" size="small" style="margin-left: 10px">Error</el-tag>
          </div>
          <el-alert
            :title="manualErrorData"
            type="error"
            :closable="true"
            @close="manualErrorData = null"
            show-icon
          ></el-alert>
        </el-card>

        <!-- Race Condition Result -->
        <el-card class="result-card" v-if="raceResults.length > 0">
          <div slot="header">
            <span>竞态测试结果</span>
            <el-tag type="info" size="small" style="margin-left: 10px">{{ raceResults.length }} 个响应</el-tag>
          </div>
          <el-table
            :data="raceResults"
            style="width: 100%"
            size="small"
          >
            <el-table-column prop="id" label="请求ID" width="100"></el-table-column>
            <el-table-column prop="delay" label="延迟(ms)" width="120"></el-table-column>
            <el-table-column prop="time" label="响应时间">
              <template slot-scope="scope">{{ new Date(scope.row.time).toLocaleTimeString() }}</template>
            </el-table-column>
            <el-table-column prop="winner" label=" Winner">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.winner" type="success" size="small">胜出</el-tag>
                <span v-else style="color: #999">已废弃</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- Cache Status -->
    <el-card class="cache-status-card">
      <div slot="header">
        <span>缓存状态</span>
        <el-button size="mini" type="text" style="float: right" @click="refreshCacheStatus">刷新</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="缓存 Key 数量" :value="cacheKeys.length"></el-statistic>
        </el-col>
        <el-col :span="18">
          <el-tag
            v-for="key in cacheKeys"
            :key="key"
            style="margin-right: 10px; margin-bottom: 5px"
          >
            {{ Array.isArray(key) ? key.join(' > ') : key }}
          </el-tag>
          <span v-if="cacheKeys.length === 0" style="color: #999">暂无缓存</span>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { createRequestMixin } from '@/utils/useRequest'
import { queryCache } from '@/utils/queryCache'

// Mock APIs
const mockUserApi = () => new Promise((resolve, reject) => {
  setTimeout(() => resolve({ id: 1, name: '张三', email: 'zhangsan@example.com' }), 800)
})

const mockProductsApi = () => new Promise((resolve, reject) => {
  setTimeout(() => resolve([
    { id: 1, name: 'iPhone 15', category: '电子产品', price: 8999 },
    { id: 2, name: 'MacBook Pro', category: '电子产品', price: 19999 },
    { id: 3, name: 'AirPods Pro', category: '电子产品', price: 1899 },
    { id: 4, name: 'iPad Air', category: '电子产品', price: 4799 },
    { id: 5, name: 'Apple Watch', category: '电子产品', price: 2999 },
  ]), 600)
})

const mockErrorApi = () => new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('服务器内部错误: 500')), 500)
})

// For race test - returns at random delay
const mockRaceApi = (delay, id) => new Promise((resolve) => {
  setTimeout(() => resolve({ id, delay, time: Date.now() }), delay)
})

export default {
  name: 'RequestDemo',

  mixins: [
    createRequestMixin({
      name: 'user',
      queryKey: ['user', 1],
      queryFn: mockUserApi,
      staleTime: 0,
      enabled: true,
      onSuccess: () => {
        this.userFetchedAt = new Date().toLocaleTimeString()
        this.$message.success('用户数据加载成功')
      },
      onError: (err) => {
        this.$message.error(err.message)
      }
    }),
    createRequestMixin({
      name: 'products',
      queryKey: ['products', 'list'],
      queryFn: mockProductsApi,
      staleTime: 0,
      enabled: true,
      select: (data) => data.map(p => ({ ...p, name: p.name + ' (已选择)' })),
      onSuccess: (data) => {
        this.productsFetchedAt = new Date().toLocaleTimeString()
        this.$message.success('产品列表加载成功')
      },
      onError: (err) => {
        this.$message.error(err.message)
      }
    })
  ],

  data() {
    return {
      // User controls
      userEnabled: true,
      userStaleTime: 0,
      userFetchedAt: null,

      // Products controls
      productsEnabled: true,
      productsStaleTime: 0,
      productsFetchedAt: null,

      // Manual error
      manualErrorData: null,

      // Race condition
      raceResults: [],
      raceRequestId: 0,

      // Cache refresh trigger
      _cacheRefresh: 0
    }
  },

  computed: {
    cacheKeys() {
      // eslint-disable-next-line no-unused-vars
      const _ = this._cacheRefresh
      return Array.from(queryCache.keys()).map(k => JSON.parse(k))
    }
  },

  methods: {
    // Test methods
    testRaceCondition() {
      this.raceResults = []
      this.raceRequestId++

      const requestId = this.raceRequestId
      const delays = [1000, 500, 1500, 300, 2000]

      delays.forEach((delay, index) => {
        const startTime = Date.now()
        mockRaceApi(delay, `req-${requestId}-${index + 1}`)
          .then(result => {
            // Only accept results from the latest request series
            if (requestId === this.raceRequestId) {
              result.winner = this.raceResults.length === 0
              this.raceResults.push(result)
            }
          })
      })
    },

    triggerError() {
      // Use the products endpoint but with error
      mockErrorApi().catch(err => {
        this.$message.error('触发错误演示: ' + err.message)
      })
    },

    testManualError() {
      mockErrorApi()
        .then(() => {})
        .catch(err => {
          this.manualErrorData = err.message
        })
    },

    refreshCacheStatus() {
      // Force Vue to re-compute cacheKeys
      this._cacheRefresh++
      this.$message.info('缓存状态已刷新')
    }
  },

  created() {
    console.log('RequestDemo created')
  }
}
</script>

<style scoped>
.request-demo {
  padding: 20px;
}

.control-card {
  margin-bottom: 15px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

.result-card {
  margin-bottom: 20px;
}

.no-data {
  color: #999;
  text-align: center;
  padding: 40px;
}

.fetched-info {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.cache-status-card {
  margin-top: 20px;
}
</style>
