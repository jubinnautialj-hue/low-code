import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Button, Tag, message, Spin, Empty, Typography, Space, Modal, Form, Input, Select, Radio } from 'antd'
import { PlusOutlined, TableOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import type { FormConfig, FormColumn, FormConfigJson, TableConfig, FormConfigDetail } from '@/services/api'
import { formConfigApi } from '@/services/api'

const { Title, Text } = Typography
const { TextArea } = Input

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formList, setFormList] = useState<FormConfig[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadFormList()
  }, [])

  const loadFormList = async () => {
    setLoading(true)
    try {
      const res = await formConfigApi.listAll()
      if (res.code === 200) {
        setFormList(res.data || [])
      }
    } catch (error) {
      console.error('加载表单列表失败:', error)
      message.error('加载表单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToCrud = (formCode: string) => {
    navigate(`/dynamic/${formCode}`)
  }

  const handleGoToDesigner = (formCode?: string) => {
    if (formCode) {
      navigate(`/designer/${formCode}`)
    } else {
      navigate('/designer')
    }
  }

  const handleQuickCreate = () => {
    setModalVisible(true)
  }

  const handleCreate = async (values: any) => {
    try {
      const columns: FormColumn[] = [
        {
          field: 'id',
          title: 'ID',
          type: 'input',
          hidden: true,
          hideInForm: true,
          hideInTable: false,
          width: 80
        },
        {
          field: 'name',
          title: '名称',
          type: 'input',
          required: true,
          placeholder: '请输入名称',
          hideInTable: false,
          width: 150
        },
        {
          field: 'description',
          title: '描述',
          type: 'input',
          inputType: 'textarea',
          required: false,
          placeholder: '请输入描述',
          hideInTable: true
        },
        {
          field: 'status',
          title: '状态',
          type: 'select',
          required: true,
          placeholder: '请选择状态',
          options: [
            { label: '禁用', value: 0 },
            { label: '启用', value: 1 }
          ],
          defaultValue: 1,
          hideInTable: false,
          width: 80
        },
        {
          field: 'create_time',
          title: '创建时间',
          type: 'date',
          dateType: 'dateTime',
          hideInForm: true,
          hideInTable: false,
          width: 180
        },
        {
          field: 'update_time',
          title: '更新时间',
          type: 'date',
          dateType: 'dateTime',
          hideInForm: true,
          hideInTable: false,
          width: 180
        }
      ]

      const tableConfig: TableConfig = {
        showIndex: true,
        showSelection: true,
        pagination: true,
        pageSize: 10,
        searchFields: ['name', 'status']
      }

      const formConfig: FormConfigDetail = {
        submitText: '提交',
        resetText: '重置',
        layout: 'horizontal',
        labelAlign: 'right'
      }

      const configJson: FormConfigJson = {
        formTitle: values.formName,
        formWidth: 800,
        labelWidth: 120,
        columns,
        tableConfig,
        formConfig
      }

      const createData = {
        formCode: values.formCode,
        formName: values.formName,
        formDescription: values.formDescription || '',
        businessTable: values.businessTable,
        configJson: JSON.stringify(configJson),
        status: 1,
        version: 1
      } as FormConfig

      const res = await formConfigApi.create(createData)
      if (res.code === 200) {
        message.success('创建成功！')
        setModalVisible(false)
        form.resetFields()
        loadFormList()
      }
    } catch (error) {
      console.error('创建表单失败:', error)
      message.error('创建失败')
    }
  }

  const generateCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[\s\u4e00-\u9fa5]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_{2,}/g, '_')
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  动态表单低代码系统
                </Title>
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  通过可视化配置快速生成 CRUD 页面，实现零代码开发
                </Text>
              </div>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleGoToDesigner}>
                  设计新表单
                </Button>
                <Button icon={<PlusOutlined />} size="large" onClick={handleQuickCreate}>
                  快速创建
                </Button>
              </Space>
            </div>
          </Card>
        </div>

        <Spin spinning={loading}>
          {formList.length > 0 ? (
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={formList}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleGoToCrud(item.formCode)}
                      >
                        查看页面
                      </Button>,
                      <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleGoToDesigner(item.formCode)}
                      >
                        编辑
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={<TableOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                      title={
                        <div>
                          <span style={{ marginRight: 8 }}>{item.formName}</span>
                          <Tag color={item.status === 1 ? 'green' : 'red'}>
                            {item.status === 1 ? '启用' : '禁用'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <div>
                            <Text type="secondary">编码：</Text>
                            <Text code>{item.formCode}</Text>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">表名：</Text>
                            <Text code>{item.businessTable}</Text>
                          </div>
                          {item.formDescription && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">{item.formDescription}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Card>
              <Empty
                description="暂无表单配置"
                style={{ padding: '60px 0' }}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleGoToDesigner}>
                  创建第一个表单
                </Button>
              </Empty>
            </Card>
          )}
        </Spin>
      </div>

      <Modal
        title="快速创建表单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            status: 1
          }}
        >
          <Form.Item
            name="formName"
            label="表单名称"
            rules={[{ required: true, message: '请输入表单名称' }]}
          >
            <Input
              placeholder="例如：产品管理、订单管理"
              onChange={(e) => {
                const name = e.target.value
                const code = generateCode(name)
                const table = `biz_${code}`
                form.setFieldsValue({
                  formCode: code + '_form',
                  businessTable: table
                })
              }}
            />
          </Form.Item>

          <Form.Item
            name="formCode"
            label="表单编码"
            rules={[{ required: true, message: '请输入表单编码' }]}
          >
            <Input placeholder="例如：product_form、order_form" />
          </Form.Item>

          <Form.Item
            name="businessTable"
            label="业务表名"
            rules={[{ required: true, message: '请输入业务表名' }]}
          >
            <Input placeholder="例如：biz_product、biz_order" />
          </Form.Item>

          <Form.Item name="formDescription" label="表单描述">
            <TextArea rows={2} placeholder="请输入表单描述（可选）" />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">创建</Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Home
