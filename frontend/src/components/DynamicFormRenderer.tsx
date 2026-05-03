import React, { useEffect, useMemo, useState } from 'react'
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormUploadButton,
  ProFormUploadDragger,
  ProFormRadio,
  ProFormCheckbox,
  ProFormSwitch,
  ProFormRate,
  ProFormSlider,
  ProFormTextArea,
  ProFormDependency,
} from '@ant-design/pro-components'
import { Form, Upload, message } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import type { FormInstance, UploadFile, UploadProps } from 'antd'
import type { ProFormInstance } from '@ant-design/pro-components'
import type { FormColumn, FormConfigJson, FormRule, SelectOption } from '@/services/api'
import { uploadApi } from '@/services/api'
import { provinceData, provinceOptions, getCityOptions, getDistrictOptions } from '@/data/region'

export interface DynamicFormRendererProps {
  formConfig: FormConfigJson
  form?: ProFormInstance
  initialValues?: Record<string, any>
  onFinish?: (values: Record<string, any>) => Promise<void> | void
  onValuesChange?: (changedValues: Record<string, any>, allValues: Record<string, any>) => void
  submitter?: false | {
    submitText?: string
    resetText?: string
    searchConfig?: false
  }
  readonly?: boolean
}

const getBase64 = (img: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(img)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  formConfig,
  form: externalForm,
  initialValues,
  onFinish,
  onValuesChange,
  submitter,
  readonly = false,
}) => {
  const [form] = Form.useForm<ProFormInstance>()
  const activeForm = externalForm || form
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues || {})
  const [loading, setLoading] = useState(false)

  const { columns = [], formConfig: formLayoutConfig = {} } = formConfig

  const formColumns = useMemo(() => {
    return columns.filter((col) => !col.hidden && !col.hideInForm)
  }, [columns])

  const evaluateHiddenExpression = (expression: string, values: Record<string, any>): boolean => {
    if (!expression) return false
    try {
      const fn = new Function('values', `with(values) { return ${expression} }`)
      return !!fn(values)
    } catch (error) {
      console.error('表达式计算错误:', expression, error)
      return false
    }
  }

  const convertRules = (column: FormColumn): FormRule[] => {
    const rules: FormRule[] = []
    
    if (column.required) {
      rules.push({
        required: true,
        message: `${column.title}不能为空`,
      })
    }
    
    if (column.rules) {
      column.rules.forEach((rule) => {
        const convertedRule: FormRule = { ...rule }
        
        if (rule.pattern) {
          convertedRule.pattern = new RegExp(rule.pattern)
        }
        
        rules.push(convertedRule)
      })
    }
    
    return rules
  }

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      setLoading(false)
      message.success(`${info.file.name} 上传成功`)
    } else if (info.file.status === 'error') {
      setLoading(false)
      message.error(`${info.file.name} 上传失败`)
    }
  }

  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    try {
      const res = await uploadApi.upload(file as File)
      if (res.code === 200) {
        onSuccess?.(res.data)
      } else {
        onError?.(new Error(res.message))
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const renderFormItem = (column: FormColumn, index: number) => {
    const isHidden = evaluateHiddenExpression(column.hiddenExpression || '', formValues)
    
    if (isHidden) {
      return null
    }

    const commonProps = {
      name: column.field,
      label: column.title,
      placeholder: column.placeholder,
      disabled: column.disabled || readonly,
      rules: convertRules(column),
      initialValue: column.defaultValue,
      colProps: { span: 24 },
    }

    switch (column.type) {
      case 'input':
        if (column.inputType === 'textarea') {
          return (
            <ProFormTextArea
              key={index}
              {...commonProps}
              fieldProps={{
                rows: column.rows || 3,
              }}
            />
          )
        }
        return (
          <ProFormText
            key={index}
            {...commonProps}
            fieldProps={{
              type: column.inputType === 'password' ? 'password' : column.inputType || 'text',
            }}
          />
        )

      case 'select':
        let selectOptions = column.options || []
        
        if (column.field === 'province') {
          selectOptions = provinceOptions
        } else if (column.field === 'city' && formValues.province) {
          selectOptions = getCityOptions(formValues.province)
        } else if (column.field === 'district' && formValues.province && formValues.city) {
          selectOptions = getDistrictOptions(formValues.province, formValues.city)
        }

        return (
          <ProFormSelect
            key={index}
            {...commonProps}
            options={selectOptions}
            fieldProps={{
              showSearch: true,
              optionFilterProp: 'label',
            }}
          />
        )

      case 'cascader':
        let cascaderOptions = []
        if (column.field === 'region') {
          cascaderOptions = provinceData
        } else {
          cascaderOptions = column.options || []
        }

        return (
          <ProFormCascader
            key={index}
            {...commonProps}
            options={cascaderOptions}
            fieldProps={{
              fieldNames: column.fieldNames,
              showAllLevels: column.showAllLevels ?? true,
            }}
          />
        )

      case 'date':
        if (column.dateType === 'dateRange' || column.dateType === 'dateTimeRange') {
          return (
            <ProFormDateRangePicker
              key={index}
              {...commonProps}
              fieldProps={{
                showTime: column.dateType === 'dateTimeRange',
                format: column.format,
              }}
            />
          )
        }
        return (
          <ProFormDatePicker
            key={index}
            {...commonProps}
            fieldProps={{
              showTime: column.dateType === 'dateTime',
              format: column.format,
              picker: column.dateType === 'month' ? 'month' : column.dateType === 'year' ? 'year' : undefined,
            }}
          />
        )

      case 'upload':
        const uploadProps: any = {
          name: 'file',
          listType: column.listType || 'text',
          maxCount: column.maxCount || 1,
          accept: column.accept,
          customRequest: customUpload,
          onChange: handleUploadChange,
        }

        if (column.listType === 'picture-card') {
          return (
            <ProFormUploadButton
              key={index}
              {...commonProps}
              fieldProps={uploadProps}
              icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
              title="上传图片"
              max={column.maxCount || 1}
            />
          )
        }

        if (column.uploadType === 'file') {
          return (
            <ProFormUploadDragger
              key={index}
              {...commonProps}
              fieldProps={uploadProps}
              title="拖拽文件到此处或点击上传"
              max={column.maxCount || 1}
            />
          )
        }

        return (
          <ProFormUploadButton
            key={index}
            {...commonProps}
            fieldProps={uploadProps}
            max={column.maxCount || 1}
          />
        )

      case 'radio':
        return (
          <ProFormRadio.Group
            key={index}
            {...commonProps}
            options={column.options}
          />
        )

      case 'checkbox':
        return (
          <ProFormCheckbox.Group
            key={index}
            {...commonProps}
            options={column.options}
          />
        )

      case 'switch':
        return <ProFormSwitch key={index} {...commonProps} />

      case 'rate':
        return <ProFormRate key={index} {...commonProps} />

      case 'slider':
        return <ProFormSlider key={index} {...commonProps} />

      default:
        return <ProFormText key={index} {...commonProps} />
    }
  }

  const handleValuesChange = (changedValues: Record<string, any>, allValues: Record<string, any>) => {
    setFormValues(allValues)
    
    if (changedValues.province) {
      activeForm.setFieldValue('city', undefined)
      activeForm.setFieldValue('district', undefined)
    }
    if (changedValues.city) {
      activeForm.setFieldValue('district', undefined)
    }
    
    onValuesChange?.(changedValues, allValues)
  }

  const handleFinish = async (values: Record<string, any>) => {
    if (onFinish) {
      await onFinish(values)
    }
  }

  return (
    <ProForm
      form={activeForm}
      initialValues={initialValues}
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      submitter={
        submitter === false
          ? false
          : {
              submitText: formLayoutConfig.submitText || '提交',
              resetText: formLayoutConfig.resetText || '重置',
              searchConfig: false,
              ...submitter,
            }
      }
      layout={formLayoutConfig.layout || 'horizontal'}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      labelAlign={formLayoutConfig.labelAlign || 'right'}
    >
      {formColumns.map((column, index) => (
        <React.Fragment key={column.field || index}>
          {column.hiddenExpression ? (
            <ProFormDependency name={Object.keys(formValues)}>
              {(_, form) => {
                const currentValues = form?.getFieldsValue() || formValues
                if (evaluateHiddenExpression(column.hiddenExpression!, currentValues)) {
                  return null
                }
                return renderFormItem(column, index)
              }}
            </ProFormDependency>
          ) : (
            renderFormItem(column, index)
          )}
        </React.Fragment>
      ))}
    </ProForm>
  )
}

export default DynamicFormRenderer
