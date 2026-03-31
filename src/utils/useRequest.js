// src/utils/useRequest.js
import { getCache, setCache, invalidateCache, isStale } from '@/utils/queryCache'

let globalInstanceId = 0

export function createRequestMixin({
  name,
  queryKey,
  queryFn,
  staleTime  = 0,
  enabled    = true,
  onSuccess  = null,
  onError    = null,
  select     = null
}) {
  if (!name) throw new Error('[createRequestMixin] name 是必填项')

  return {
    data() {
      return {
        [name]: {
          data:     null,
          loading:  false,
          error:    null,
          errorMsg: null
        }
      }
    },

    computed: {
      _queryKey() {
        return typeof queryKey === 'function' ? queryKey() : queryKey
      }
    },

    watch: {
      enabled: {
        handler(val) {
          if (val) {
            this[`${name}Fetch`]()
          }
        }
      }
    },

    async created() {
      if (enabled) {
        await this.$nextTick()
        await this[`${name}Fetch`]()
      }
    },

    methods: {
      async [`${name}Fetch`]() {
        const requestTag = ++globalInstanceId

        if (!isStale(this._queryKey)) {
          const cached = getCache(this._queryKey)
          if (cached && requestTag === this[`${name}RequestTag`]) {
            this[name].data = select ? select(cached.data) : cached.data
            return
          }
        }

        this[`${name}RequestTag`] = requestTag
        this[name].loading  = true
        this[name].error    = null
        this[name].errorMsg = null

        try {
          const result = await queryFn()
          if (requestTag !== this[`${name}RequestTag`]) {
            return
          }
          setCache(this._queryKey, result, staleTime)
          this[name].data = select ? select(result) : result
          if (onSuccess) onSuccess(this[name].data)
        } catch (err) {
          if (requestTag !== this[`${name}RequestTag`]) {
            return
          }
          this[name].error    = err instanceof Error ? err : new Error(err?.message ?? '请求失败')
          this[name].errorMsg = err?.message ?? '请求失败'
          if (onError) onError(this[name].error)
        } finally {
          if (requestTag === this[`${name}RequestTag`]) {
            this[name].loading = false
          }
        }
      },

      [`${name}Refetch`]() {
        return this[`${name}Fetch`]()
      },

      [`${name}Invalidate`]() {
        invalidateCache(this._queryKey)
        return this[`${name}Fetch`]()
      }
    }
  }
}
