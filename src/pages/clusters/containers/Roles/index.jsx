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

import { get } from 'lodash'
import React from 'react'
import { toJS } from 'mobx'

import { Avatar } from 'components/Base'
import Banner from 'components/Cards/Banner'
import Table from 'components/Tables/List'
import withList, { ListPage } from 'components/HOCs/withList'

import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import RoleStore from 'stores/role'

@withList({
  store: new RoleStore('clusterroles'),
  module: 'clusterroles',
  name: 'Cluster Role',
})
export default class ClusterRoles extends React.Component {
  componentDidMount() {
    this.props.store.fetchRoleTemplates(this.props.match.params)
  }

  showAction = record =>
    !globals.config.presetClusterRoles.includes(record.name)

  get itemActions() {
    const { trigger, store, name, module, routing } = this.props
    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('Edit'),
        action: 'edit',
        show: this.showAction,
        onClick: item =>
          trigger('role.edit', {
            module,
            detail: item,
            title: t('Edit Cluster Role'),
            rulesInfo: toJS(store.rulesInfo),
            success: routing.query,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('Delete'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('role.delete', {
            detail: item,
            type: t(name),
            success: routing.query,
            cluster: this.props.match.params.cluster,
          }),
      },
    ]
  }

  get tableActions() {
    const { tableProps } = this.props
    return {
      ...tableProps.tableActions,
      onCreate: this.showCreate,
      getCheckboxProps: record => ({
        disabled: !this.showAction(record),
        name: record.name,
      }),
    }
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        search: true,
        width: '25%',
        render: name => (
          <Avatar
            icon={ICON_TYPES[this.module]}
            to={`/clusters/${cluster}/roles/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('Description'),
        key: 'description',
        dataIndex: 'description',
        isHideable: true,
        width: '55%',
        render: (description, record) => {
          const name = get(record, 'name')
          if (description && globals.config.presetClusterRoles.includes(name)) {
            return t(description)
          }
          return description
        },
      },
      {
        title: t('Created Time'),
        dataIndex: 'createTime',
        sorter: true,
        sortOrder: getSortOrder('createTime'),
        isHideable: true,
        width: '19%',
        render: time => getLocalTime(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  showCreate = () => {
    const { match, store, trigger, getData } = this.props
    return trigger('role.create', {
      title: t('Create Cluster Role'),
      rulesInfo: toJS(store.rulesInfo),
      cluster: match.params.cluster,
      success: getData,
    })
  }

  render() {
    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props} noWatch>
        <Banner {...bannerProps} tabs={this.tabs} />
        <Table
          {...tableProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
        />
      </ListPage>
    )
  }
}