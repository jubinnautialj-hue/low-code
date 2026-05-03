import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ProTable,
  ModalForm,
  ProFormInstance,
} from '@ant-design/pro-components'
import { Button, Modal, message, Spin, Tag, Space, Popconfirm, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import DynamicFormRenderer from '@/components/DynamicFormRenderer'
import { formConfigApi, dynamicDataApi } from '@/services/api'
import type { FormConfigJson, FormColumn } from '@/services/api'

const DynamicCrudPage: React.FC = () => {
  const { formCode } = useParams<{ formCode: string }>()
  const navigate = useNavigate()
  
  const actionRef = useRef<ActionType>()
  const formRef = useRef<ProFormInstance>()
  
  const [loading, setLoading] = useState(false)
  const [formConfig, setFormConfig] = useState<FormConfigJson | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentRecord, setCurrentRecord] = useState<any>(null)

  useEffect(() => {
    if (formCode) {
      loadFormConfig(formCode)
    }
  }, [formCode])

  const loadFormConfig = async (code: string) => {
    setLoading(true)
    try {
      const res = await formConfigApi.getConfigJson(code)
      if (res.code === 200 && res.data) {
        const config = JSON.parse(res.data) as FormConfigJson
        setFormConfig(config)
      } else {
        message.error(res.message || '表单配置不存在')
      }
    } catch (error) {
      console.error('加载表单配置失败:', error)
      message.error('加载表单配置失败')
    } finally {
      setLoading(false)
    }
  }

  const convertTableColumns = (columns: FormColumn[]): ProColumns<any>[] => {
    return columns
      .filter((col) => !col.hidden && !col.hideInTable)
      .map((col) => {
        const column: ProColumns<any> = {
          title: col.title,
          dataIndex: col.field,
          key: col.field,
          width: col.width,
          ellipsis: true,
        }

        if (col.type === 'select' && col.options) {
          column.valueEnum = col.options.reduce((acc, opt) => {
            acc[opt.value] = { text: opt.label }
            return acc
          }, {} as any)
        }

        if (col.type === 'date') {
          column.valueType = col.dateType === 'dateTime' ? 'dateTime' : 'date'
          column.render = (_, record) => {
            const value = record[col.field]
            if (value) {
              return dayjs(value).format(col.format || (col.dateType === 'dateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'))
            }
            return '-'
          }
        }

        if (col.type === 'upload' && col.uploadType === 'image') {
          column.render = (_, record) => {
            const value = record[col.field]
            if (value) {
              const url = typeof value === 'string' ? value : value[0]?.url || value[0]
              return url ? (
                <Image width={40} height={40} src={url} style={{ borderRadius: 4 }} />
              ) : '-'
            }
            return '-'
          }
        }

        if (col.field === 'status') {
          column.render = (_, record) => {
            const value = record[col.field]
            return value === 1 ? (
              <Tag color="green">启用</Tag>
            ) : value === 0 ? (
              <Tag color="red">禁用</Tag>
            ) : (
              '-'
            )
          }
        }

        return column
      })
  }

  const getSearchFields = (columns: FormColumn[]): string[] => {
    if (formConfig?.tableConfig?.searchFields) {
      return formConfig.tableConfig.searchFields
    }
    return columns
      .filter((col) => col.type === 'input' || col.type === 'select')
      .slice(0, 3)
      .map((col) => col.field)
  }

  const handleAdd = () => {
    setModalType('add')
    setCurrentRecord(null)
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setModalType('edit')
    setCurrentRecord({ ...record })
    setModalVisible(true)
  }

  const handleView = (record: any) => {
    setModalType('view')
    setCurrentRecord({ ...record })
    setModalVisible(true)
  }

  const handleDelete = async (record: any) => {
    if (!formCode) return
    
    try {
      const res = await dynamicDataApi.delete(formCode, record.id)
      if (res.code === 200) {
        message.success('删除成功')
        actionRef.current?.reload()
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (!formCode || !formConfig) return
    
    try {
      if (modalType === 'add') {
        const res = await dynamicDataApi.save(formCode, values)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          actionRef.current?.reload()
        } else {
          message.error(res.message || '新增失败')
        }
      } else if (modalType === 'edit') {
        const res = await dynamicDataApi.update(formCode, currentRecord.id, values)
        if (res.code === 200) {
          message.success('更新成功')
          setModalVisible(false)
          actionRef.current?.reload()
        } else {
          message.error(res.message || '更新失败')
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
      message.error('提交失败')
    }
  }

  const requestTableData = async (
    params: any,
    sort: any,
    filter: any
  ): Promise<{ data: any[]; total: number; success: boolean }> => {
    if (!formCode) {
      return { data: [], total: 0, success: false }
    }

    try {
      const { current, pageSize, ...queryParams } = params
      
      const res = await dynamicDataApi.getPage(formCode, {
        pageNum: current || 1,
        pageSize: pageSize || 10,
        ...queryParams,
      })

      if (res.code === 200) {
        return {
          data: res.data || [],
          total: res.total || 0,
          success: true,
        }
      }
      return { data: [], total: 0, success: false }
    } catch (error) {
      console.error('加载数据失败:', error)
      return { data: [], total: 0, success: false }
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!formConfig) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p>表单配置不存在或加载失败</p>
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    )
  }

  const tableColumns = convertTableColumns(formConfig.columns)
  const searchFields = getSearchFields(formConfig.columns)

  const operationColumn: ProColumns<any> = {
    title: '操作',
    valueType: 'option',
    key: 'option',
    width: 180,
    fixed: 'right',
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          查看
        </Button>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
        <Popconfirm
          title="确定要删除这条记录吗？"
          onConfirm={() => handleDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  }

  const allColumns = [...tableColumns, operationColumn]

  const initialValues = modalType === 'edit' || modalType === 'view'
    ? currentRecord
    : {}

  return (
    <div className="dynamic-crud-page">
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          {formConfig.formTitle || '动态表单'}
        </h1>
        {formCode && (
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: 14 }}>
            表单编码: {formCode}
          </p>
        )}
      </div>

      <div className="page-content">
        <ProTable<any>
          headerTitle={formConfig.tableConfig?.showIndex !== false ? '' : '数据列表'}
          actionRef={actionRef}
          rowKey="id"
          columns={allColumns}
          request={requestTableData}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: formConfig.tableConfig?.pageSize || 10,
          }}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: true,
          }}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增
            </Button>,
          ]}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
        />
      </div>

      <ModalForm
        title={
          modalType === 'add'
            ? `新增${formConfig.formTitle}`
            : modalType === 'edit'
            ? `编辑${formConfig.formTitle}`
            : `查看${formConfig.formTitle}`
        }
        open={modalVisible}
        onOpenChange={setModalVisible}
        formRef={formRef}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          width: formConfig.formWidth || 800,
        }}
        submitter={
          modalType === 'view'
            ? false
            : {
                searchConfig: false,
                submitText: '确定',
                resetText: '取消',
              }
        }
        onFinish={async (values) => {
          if (modalType !== 'view') {
            await handleSubmit(values)
          }
          return true
        }}
      >
        {formConfig && (
          <DynamicFormRenderer
            formConfig={formConfig}
            form={formRef.current!}
            initialValues={initialValues}
            submitter={false}
            readonly={modalType === 'view'}
          />
        )}
      </ModalForm>
    </div>
  )
}

export default DynamicCrudPage
