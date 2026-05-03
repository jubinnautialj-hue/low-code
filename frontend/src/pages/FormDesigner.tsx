import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Switch,
  Space,
  Tabs,
  List,
  Dragger,
  message,
  Modal,
  Popconfirm,
  Tag,
  Typography,
  Divider,
  Row,
  Col,
  Spin
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  LeftOutlined,
  SettingOutlined,
  AppstoreOutlined,
  TableOutlined,
  GlobalOutlined,
  CalendarOutlined,
  UploadOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CheckSquareOutlined,
  StarOutlined,
  SlidersOutlined,
  BarsOutlined
} from '@ant-design/icons'
import type { FormColumn, FormConfigJson, FormRule, SelectOption, TableConfig, FormConfigDetail } from '@/services/api'
import { formConfigApi } from '@/services/api'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

const COMPONENT_TYPES: {
  type: FormColumn['type']
  label: string
  icon: React.ReactNode
  defaultConfig: Partial<FormColumn>
}[] = [
  {
    type: 'input',
    label: '文本输入',
    icon: <EditOutlined />,
    defaultConfig: { inputType: 'text', placeholder: '请输入' }
  },
  {
    type: 'input',
    label: '多行文本',
    icon: <FileTextOutlined />,
    defaultConfig: { inputType: 'textarea', placeholder: '请输入', rows: 3 }
  },
  {
    type: 'input',
    label: '密码输入',
    icon: <QuestionCircleOutlined />,
    defaultConfig: { inputType: 'password', placeholder: '请输入密码' }
  },
  {
    type: 'select',
    label: '下拉选择',
    icon: <BarsOutlined />,
    defaultConfig: { placeholder: '请选择', options: [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]}
  },
  {
    type: 'radio',
    label: '单选框',
    icon: <AppstoreOutlined />,
    defaultConfig: { options: [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]}
  },
  {
    type: 'checkbox',
    label: '多选框',
    icon: <CheckSquareOutlined />,
    defaultConfig: { options: [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]}
  },
  {
    type: 'date',
    label: '日期选择',
    icon: <CalendarOutlined />,
    defaultConfig: { dateType: 'date', placeholder: '请选择日期', format: 'YYYY-MM-DD' }
  },
  {
    type: 'date',
    label: '日期时间',
    icon: <GlobalOutlined />,
    defaultConfig: { dateType: 'dateTime', placeholder: '请选择日期时间', format: 'YYYY-MM-DD HH:mm:ss' }
  },
  {
    type: 'upload',
    label: '文件上传',
    icon: <UploadOutlined />,
    defaultConfig: { uploadType: 'file', maxCount: 1, maxSize: 10, listType: 'text' }
  },
  {
    type: 'switch',
    label: '开关',
    icon: <SlidersOutlined />,
    defaultConfig: { defaultValue: false }
  },
  {
    type: 'rate',
    label: '评分',
    icon: <StarOutlined />,
    defaultConfig: { defaultValue: 0 }
  },
  {
    type: 'slider',
    label: '滑块',
    icon: <SlidersOutlined />,
    defaultConfig: { defaultValue: 0 }
  }
]

const FormDesigner: React.FC = () => {
  const { formCode } = useParams<{ formCode?: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  const [basicForm] = Form.useForm()
  const [columns, setColumns] = useState<FormColumn[]>([
    {
      field: 'id',
      title: 'ID',
      type: 'input',
      hidden: true,
      hideInForm: true,
      hideInTable: false,
      width: 80
    }
  ])
  const [tableConfig, setTableConfig] = useState<TableConfig>({
    showIndex: true,
    showSelection: true,
    pagination: true,
    pageSize: 10,
    searchFields: []
  })
  const [formConfig, setFormConfig] = useState<FormConfigDetail>({
    submitText: '提交',
    resetText: '重置',
    layout: 'horizontal',
    labelAlign: 'right'
  })

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
        setColumns(config.columns || [])
        setTableConfig(config.tableConfig || {
          showIndex: true,
          showSelection: true,
          pagination: true,
          pageSize: 10
        })
        setFormConfig(config.formConfig || {
          submitText: '提交',
          resetText: '重置'
        })
        
        basicForm.setFieldsValue({
          formCode: code,
          formTitle: config.formTitle || '',
          formWidth: config.formWidth || 800,
          labelWidth: config.labelWidth || 120
        })
      }
    } catch (error) {
      console.error('加载表单配置失败:', error)
      message.error('加载表单配置失败')
    } finally {
      setLoading(false)
    }
  }

  const generateFieldCode = () => {
    const timestamp = Date.now().toString(36)
    return `field_${timestamp}`
  }

  const handleAddComponent = (component: typeof COMPONENT_TYPES[0]) => {
    const newColumn: FormColumn = {
      field: generateFieldCode(),
      title: component.label,
      type: component.type,
      required: false,
      hideInForm: false,
      hideInTable: false,
      ...component.defaultConfig
    }
    
    setColumns([...columns, newColumn])
    setSelectedIndex(columns.length)
  }

  const handleUpdateColumn = (index: number, updates: Partial<FormColumn>) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], ...updates }
    setColumns(newColumns)
  }

  const handleDeleteColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    setColumns(newColumns)
    if (selectedIndex === index) {
      setSelectedIndex(null)
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 1) return
    const newColumns = [...columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index - 1]
    newColumns[index - 1] = temp
    setColumns(newColumns)
    setSelectedIndex(index - 1)
  }

  const handleMoveDown = (index: number) => {
    if (index >= columns.length - 1) return
    const newColumns = [...columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index + 1]
    newColumns[index + 1] = temp
    setColumns(newColumns)
    setSelectedIndex(index + 1)
  }

  const handleSave = async (isCreate: boolean = false) => {
    const values = await basicForm.validateFields()
    
    if (columns.filter(c => !c.hideInForm && c.field !== 'id').length === 0) {
      message.warning('请至少添加一个表单字段')
      return
    }
    
    const configJson: FormConfigJson = {
      formTitle: values.formTitle,
      formWidth: values.formWidth,
      labelWidth: values.labelWidth,
      columns,
      tableConfig,
      formConfig
    }
    
    setSaving(true)
    try {
      const result = {
        formCode: values.formCode,
        formName: values.formTitle,
        formDescription: values.formDescription || '',
        businessTable: values.businessTable,
        configJson: JSON.stringify(configJson),
        status: 1,
        version: 1
      }
      
      if (isCreate) {
        const res = await formConfigApi.create(result as any)
        if (res.code === 200) {
          message.success('创建成功！')
          navigate('/')
        }
      } else {
        const res = await formConfigApi.saveOrUpdate(result as any)
        if (res.code === 200) {
          message.success('保存成功！')
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleGoToCrud = () => {
    const values = basicForm.getFieldsValue()
    if (values.formCode) {
      navigate(`/dynamic/${values.formCode}`)
    } else {
      message.warning('请先保存表单')
    }
  }

  const selectedColumn = selectedIndex !== null ? columns[selectedIndex] : null

  const renderOptionsEditor = (options: SelectOption[] | undefined, onChange: (opts: SelectOption[]) => void) => {
    return (
      <div>
        <List
          size="small"
          dataSource={options || []}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const newOptions = [...(options || [])]
                    newOptions.splice(index, 1)
                    onChange(newOptions)
                  }}
                />
              ]}
            >
              <Space>
                <Input
                  size="small"
                  value={item.label}
                  placeholder="标签"
                  onChange={(e) => {
                    const newOptions = [...(options || [])]
                    newOptions[index] = { ...item, label: e.target.value }
                    onChange(newOptions)
                  }}
                  style={{ width: 80 }}
                />
                <Input
                  size="small"
                  value={item.value}
                  placeholder="值"
                  onChange={(e) => {
                    const newOptions = [...(options || [])]
                    newOptions[index] = { ...item, value: e.target.value }
                    onChange(newOptions)
                  }}
                  style={{ width: 80 }}
                />
              </Space>
            </List.Item>
          )}
        />
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          block
          onClick={() => {
            const newOptions = [...(options || []), { label: '新选项', value: `option${(options || []).length + 1}` }]
            onChange(newOptions)
          }}
        >
          添加选项
        </Button>
      </div>
    )
  }

  return (
    <Spin spinning={loading}>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <Card
          style={{ borderRadius: 0 }}
          bodyStyle={{ padding: '12px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button icon={<LeftOutlined />} onClick={() => navigate('/')}>
                返回
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {formCode ? '编辑表单' : '新建表单'}
              </Title>
            </Space>
            <Space>
              <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
                预览
              </Button>
              {formCode && (
                <Button icon={<TableOutlined />} type="primary" onClick={handleGoToCrud}>
                  查看页面
                </Button>
              )}
              {!formCode ? (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => handleSave(true)}
                >
                  创建表单
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => handleSave(false)}
                >
                  保存
                </Button>
              )}
            </Space>
          </div>
        </Card>

        <div style={{ maxWidth: 1600, margin: '16px auto', padding: '0 16px' }}>
          <Row gutter={16}>
            <Col span={5}>
              <Card title="组件库" size="small">
                <List
                  dataSource={COMPONENT_TYPES}
                  renderItem={(item) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleAddComponent(item)}
                    >
                      <div style={{ padding: '8px', borderRadius: 4, background: '#fff', border: '1px solid #d9d9d9', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                        <Text type="secondary">{item.label}</Text>
                      </div>
                    </List.Item>
                  )}
                  grid={{ gutter: 8, column: 2 }}
                />
              </Card>
            </Col>

            <Col span={10}>
              <Tabs defaultActiveKey="form">
                <TabPane tab="表单字段" key="form">
                  <Card size="small">
                    <List
                      dataSource={columns.filter(c => !c.hideInForm || c.field === 'id')}
                      renderItem={(column, index) => {
                        const actualIndex = columns.findIndex(c => c.field === column.field)
                        const isSelected = selectedIndex === actualIndex
                        return (
                          <List.Item
                            style={{
                              background: isSelected ? '#e6f7ff' : '#fff',
                              border: `1px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                              borderRadius: 4,
                              marginBottom: 8,
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectedIndex(actualIndex)}
                            actions={[
                              <Button
                                key="up"
                                type="text"
                                size="small"
                                disabled={actualIndex <= 1}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMoveUp(actualIndex)
                                }}
                              >
                                ↑
                              </Button>,
                              <Button
                                key="down"
                                type="text"
                                size="small"
                                disabled={actualIndex >= columns.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMoveDown(actualIndex)
                                }}
                              >
                                ↓
                              </Button>,
                              column.field === 'id' ? null : (
                                <Popconfirm
                                  key="delete"
                                  title="确定删除该字段？"
                                  onConfirm={(e) => {
                                    e?.stopPropagation()
                                    handleDeleteColumn(actualIndex)
                                  }}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Popconfirm>
                              )
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Tag color={column.required ? 'red' : 'blue'}>{column.type}</Tag>}
                              title={
                                <Space>
                                  <span>{column.title}</span>
                                  {column.required && <Tag color="red" size="small">必填</Tag>}
                                  {column.hideInTable && <Tag color="orange" size="small">列表隐藏</Tag>}
                                </Space>
                              }
                              description={<Text code>{column.field}</Text>}
                            />
                          </List.Item>
                        )
                      }}
                    />
                  </Card>
                </TabPane>

                <TabPane tab="列表配置" key="table">
                  <Card size="small">
                    <Form layout="vertical">
                      <Form.Item label="显示序号列">
                        <Switch
                          checked={tableConfig.showIndex}
                          onChange={(checked) => setTableConfig({ ...tableConfig, showIndex: checked })}
                        />
                      </Form.Item>
                      <Form.Item label="显示选择列">
                        <Switch
                          checked={tableConfig.showSelection}
                          onChange={(checked) => setTableConfig({ ...tableConfig, showSelection: checked })}
                        />
                      </Form.Item>
                      <Form.Item label="分页显示">
                        <Switch
                          checked={tableConfig.pagination}
                          onChange={(checked) => setTableConfig({ ...tableConfig, pagination: checked })}
                        />
                      </Form.Item>
                      <Form.Item label="每页条数">
                        <InputNumber
                          min={1}
                          max={100}
                          value={tableConfig.pageSize}
                          onChange={(val) => setTableConfig({ ...tableConfig, pageSize: val || 10 })}
                        />
                      </Form.Item>
                      <Divider>字段显示</Divider>
                      <List
                        size="small"
                        dataSource={columns}
                        renderItem={(column, index) => (
                          <List.Item
                            actions={[
                              <Switch
                                key="hideInTable"
                                checked={!column.hideInTable}
                                onChange={(checked) => handleUpdateColumn(index, { hideInTable: !checked })}
                              />
                            ]}
                          >
                            <Space>
                              <Tag>{column.type}</Tag>
                              <Text>{column.title}</Text>
                              <Text code>{column.field}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Form>
                  </Card>
                </TabPane>

                <TabPane tab="基本设置" key="basic">
                  <Card size="small">
                    <Form form={basicForm} layout="vertical" initialValues={{
                      formWidth: 800,
                      labelWidth: 120
                    }}>
                      <Form.Item
                        name="formTitle"
                        label="表单标题"
                        rules={[{ required: true, message: '请输入表单标题' }]}
                      >
                        <Input placeholder="例如：用户管理、产品管理" />
                      </Form.Item>
                      <Form.Item
                        name="formCode"
                        label="表单编码"
                        rules={[{ required: true, message: '请输入表单编码' }]}
                      >
                        <Input placeholder="例如：user_form、product_form" disabled={!!formCode} />
                      </Form.Item>
                      <Form.Item
                        name="businessTable"
                        label="业务表名"
                        rules={[{ required: true, message: '请输入业务表名' }]}
                      >
                        <Input placeholder="例如：biz_user、biz_product" disabled={!!formCode} />
                      </Form.Item>
                      <Form.Item name="formDescription" label="表单描述">
                        <TextArea rows={2} placeholder="请输入表单描述（可选）" />
                      </Form.Item>
                      <Divider>表单样式</Divider>
                      <Form.Item name="formWidth" label="表单宽度">
                        <InputNumber min={400} max={1600} style={{ width: '100%' }} addonAfter="px" />
                      </Form.Item>
                      <Form.Item name="labelWidth" label="标签宽度">
                        <InputNumber min={50} max={300} style={{ width: '100%' }} addonAfter="px" />
                      </Form.Item>
                    </Form>
                  </Card>
                </TabPane>
              </Tabs>
            </Col>

            <Col span={9}>
              <Card title="属性配置" size="small">
                {selectedColumn && selectedIndex !== null ? (
                  <Form layout="vertical">
                    <Form.Item label="字段标题">
                      <Input
                        value={selectedColumn.title}
                        onChange={(e) => handleUpdateColumn(selectedIndex, { title: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="字段编码">
                      <Input
                        value={selectedColumn.field}
                        onChange={(e) => handleUpdateColumn(selectedIndex, { field: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="字段类型">
                      <Tag color="blue">{selectedColumn.type}</Tag>
                    </Form.Item>
                    <Form.Item label="占位提示">
                      <Input
                        value={selectedColumn.placeholder}
                        onChange={(e) => handleUpdateColumn(selectedIndex, { placeholder: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="是否必填">
                      <Switch
                        checked={selectedColumn.required}
                        onChange={(checked) => handleUpdateColumn(selectedIndex, { required: checked })}
                      />
                    </Form.Item>
                    <Form.Item label="表单隐藏">
                      <Switch
                        checked={selectedColumn.hideInForm}
                        onChange={(checked) => handleUpdateColumn(selectedIndex, { hideInForm: checked })}
                      />
                    </Form.Item>
                    <Form.Item label="列表隐藏">
                      <Switch
                        checked={selectedColumn.hideInTable}
                        onChange={(checked) => handleUpdateColumn(selectedIndex, { hideInTable: checked })}
                      />
                    </Form.Item>
                    <Form.Item label="列表宽度">
                      <InputNumber
                        min={50}
                        max={500}
                        value={selectedColumn.width}
                        onChange={(val) => handleUpdateColumn(selectedIndex, { width: val || undefined })}
                        addonAfter="px"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    {selectedColumn.type === 'input' && (
                      <>
                        <Divider>输入类型</Divider>
                        <Form.Item label="输入类型">
                          <Select
                            value={selectedColumn.inputType || 'text'}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { inputType: val })}
                          >
                            <Option value="text">单行文本</Option>
                            <Option value="textarea">多行文本</Option>
                            <Option value="password">密码</Option>
                            <Option value="email">邮箱</Option>
                            <Option value="tel">手机号</Option>
                            <Option value="url">URL</Option>
                            <Option value="number">数字</Option>
                          </Select>
                        </Form.Item>
                        {selectedColumn.inputType === 'textarea' && (
                          <Form.Item label="行数">
                            <InputNumber
                              min={2}
                              max={20}
                              value={selectedColumn.rows || 3}
                              onChange={(val) => handleUpdateColumn(selectedIndex, { rows: val || 3 })}
                            />
                          </Form.Item>
                        )}
                      </>
                    )}

                    {(selectedColumn.type === 'select' || selectedColumn.type === 'radio' || selectedColumn.type === 'checkbox') && (
                      <>
                        <Divider>选项配置</Divider>
                        <Form.Item label="选项列表">
                          {renderOptionsEditor(
                            selectedColumn.options,
                            (opts) => handleUpdateColumn(selectedIndex, { options: opts })
                          )}
                        </Form.Item>
                      </>
                    )}

                    {selectedColumn.type === 'date' && (
                      <>
                        <Divider>日期配置</Divider>
                        <Form.Item label="日期类型">
                          <Select
                            value={selectedColumn.dateType || 'date'}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { dateType: val })}
                          >
                            <Option value="date">日期</Option>
                            <Option value="dateTime">日期时间</Option>
                            <Option value="month">月份</Option>
                            <Option value="year">年份</Option>
                            <Option value="week">周</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="格式化">
                          <Input
                            value={selectedColumn.format}
                            onChange={(e) => handleUpdateColumn(selectedIndex, { format: e.target.value })}
                            placeholder="YYYY-MM-DD"
                          />
                        </Form.Item>
                      </>
                    )}

                    {selectedColumn.type === 'upload' && (
                      <>
                        <Divider>上传配置</Divider>
                        <Form.Item label="上传类型">
                          <Select
                            value={selectedColumn.uploadType || 'file'}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { uploadType: val })}
                          >
                            <Option value="file">文件</Option>
                            <Option value="image">图片</Option>
                            <Option value="video">视频</Option>
                            <Option value="audio">音频</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="最大数量">
                          <InputNumber
                            min={1}
                            max={20}
                            value={selectedColumn.maxCount || 1}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { maxCount: val || 1 })}
                          />
                        </Form.Item>
                        <Form.Item label="最大大小">
                          <InputNumber
                            min={1}
                            max={100}
                            value={selectedColumn.maxSize || 10}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { maxSize: val || 10 })}
                            addonAfter="MB"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="显示样式">
                          <Select
                            value={selectedColumn.listType || 'text'}
                            onChange={(val) => handleUpdateColumn(selectedIndex, { listType: val })}
                          >
                            <Option value="text">文字</Option>
                            <Option value="picture">图片</Option>
                            <Option value="picture-card">图片卡片</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="接受类型">
                          <Input
                            value={selectedColumn.accept}
                            onChange={(e) => handleUpdateColumn(selectedIndex, { accept: e.target.value })}
                            placeholder=".jpg,.png,.pdf"
                          />
                        </Form.Item>
                      </>
                    )}

                    <Divider>校验规则</Divider>
                    <Form.Item label="默认值">
                      <Input
                        value={selectedColumn.defaultValue}
                        onChange={(e) => handleUpdateColumn(selectedIndex, { defaultValue: e.target.value })}
                        placeholder="可选"
                      />
                    </Form.Item>
                  </Form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <SettingOutlined style={{ fontSize: 48 }} />
                    <div style={{ marginTop: 16 }}>请选择一个字段进行配置</div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Modal
        title="表单预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {columns.filter(c => !c.hideInForm && c.field !== 'id').map((column, index) => (
            <Form.Item
              key={column.field}
              label={column.title}
              required={column.required}
              name={column.field}
            >
              {column.type === 'input' && (
                column.inputType === 'textarea' ? (
                  <Input.TextArea rows={column.rows || 3} placeholder={column.placeholder} />
                ) : (
                  <Input placeholder={column.placeholder} type={column.inputType} />
                )
              )}
              {column.type === 'select' && (
                <Select placeholder={column.placeholder} options={column.options} />
              )}
              {column.type === 'radio' && (
                <Radio.Group options={column.options} />
              )}
              {column.type === 'checkbox' && (
                <Checkbox.Group options={column.options} />
              )}
              {column.type === 'date' && (
                <Input placeholder={column.placeholder} />
              )}
              {column.type === 'switch' && (
                <Switch />
              )}
              {column.type === 'rate' && (
                <div style={{ fontSize: 24 }}>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <StarOutlined style={{ color: '#faad14' }} />
                  <StarOutlined style={{ color: '#faad14' }} />
                  <StarOutlined style={{ color: '#e8e8e8' }} />
                  <StarOutlined style={{ color: '#e8e8e8' }} />
                </div>
              )}
              {column.type === 'slider' && (
                <div style={{ background: '#e6f7ff', height: 8, borderRadius: 4 }}>
                  <div style={{ background: '#1890ff', width: '40%', height: '100%', borderRadius: 4 }} />
                </div>
              )}
              {column.type === 'upload' && (
                <Button icon={<UploadOutlined />}>上传文件</Button>
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </Spin>
  )
}

export default FormDesigner
