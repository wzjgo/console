/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import { get, cloneDeep } from 'lodash'
import { action, observable } from 'mobx'

import { LIST_DEFAULT_ORDER, DEFAULT_CLUSTER } from 'utils/constants'

import Base from 'stores/base'

export default class ClusterStore extends Base {
  @observable
  initializing = true

  @observable
  isAgentLoading = true

  @observable
  agent = ''

  module = 'clusters'

  getAgentUrl = ({ cluster }) =>
    `kapis/cluster.kubesphere.io/v1alpha1/clusters/${cluster}/agent/deployment`

  @action
  async fetchList({ cluster, workspace, namespace, more, ...params } = {}) {
    this.list.isLoading = true

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'createTime'
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.limit = params.limit || 10

    let result
    if (!globals.app.isMultiCluster) {
      result = { items: [DEFAULT_CLUSTER] }
    } else {
      result = await request.get(
        this.getResourceUrl({ cluster, workspace, namespace }),
        params
      )
    }

    const data = get(result, 'items', []).map(item => ({
      cluster,
      ...this.mapper(item),
    }))

    this.list.update({
      data: more ? [...this.list.data, ...data] : data,
      total: result.totalItems || result.total_count || data.length || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    return data
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true

    let detail
    if (params.name === 'default' && !globals.app.isMultiCluster) {
      detail = this.mapper(cloneDeep(DEFAULT_CLUSTER))
    } else {
      const result = await request.get(this.getDetailUrl(params))
      detail = { ...params, ...this.mapper(result) }
    }

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async fetchAgent(params) {
    this.isAgentLoading = true

    const result = await request.get(this.getAgentUrl(params))

    this.agent = result
    this.isAgentLoading = false
  }
}