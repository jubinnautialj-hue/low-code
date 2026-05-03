import { request, ApiResponse } from '@/utils/request'

export interface FormConfig {
  id: number
  formCode: string
  formName: string
  formDescription: string
  businessTable: string
  configJson: string
  status: number
  version: number
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface FormColumn {
  field: string
  title: string
  type: 'input' | 'select' | 'cascader' | 'date' | 'upload' | 'richText' | 'radio' | 'checkbox' | 'switch' | 'rate' | 'slider'
  inputType?: 'text' | 'password' | 'email' | 'tel' | 'number' | 'textarea' | 'url'
  required?: boolean
  placeholder?: string
  defaultValue?: any
  disabled?: boolean
  hidden?: boolean
  hideInForm?: boolean
  hideInTable?: boolean
  width?: number
  rules?: FormRule[]
  linkage?: FormLinkage
  hiddenExpression?: string
  options?: SelectOption[]
  dateType?: 'date' | 'dateTime' | 'month' | 'quarter' | 'year' | 'week' | 'range' | 'dateRange' | 'dateTimeRange'
  format?: string
  uploadType?: 'image' | 'file' | 'video' | 'audio'
  maxCount?: number
  maxSize?: number
  accept?: string
  action?: string
  listType?: 'text' | 'picture' | 'picture-card'
  fieldNames?: {
    label: string
    value: string
    children: string
  }
  showAllLevels?: boolean
  rows?: number
}

export interface FormRule {
  required?: boolean
  pattern?: string
  message?: string
  min?: number
  max?: number
  type?: 'email' | 'url' | 'number' | 'integer' | 'float' | 'date' | 'boolean'
}

export interface FormLinkage {
  triggerField: string
  targetField: string
  type: 'cascade' | 'visibility' | 'value' | 'options'
  conditions?: FormLinkageCondition[]
}

export interface FormLinkageCondition {
  triggerValue: any
  targetValue?: any
  visible?: boolean
  options?: SelectOption[]
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
}

export interface FormConfigJson {
  formTitle: string
  formWidth?: number
  labelWidth?: number
  columns: FormColumn[]
  tableConfig?: TableConfig
  formConfig?: FormConfigDetail
}

export interface TableConfig {
  showIndex?: boolean
  showSelection?: boolean
  pagination?: boolean
  pageSize?: number
  searchFields?: string[]
}

export interface FormConfigDetail {
  submitText?: string
  resetText?: string
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelAlign?: 'left' | 'right'
}

export interface PageData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export const formConfigApi = {
  getByFormCode: (formCode: string): Promise<ApiResponse<FormConfig>> => {
    return request.get(`/form/config/${formCode}`)
  },
  
  getConfigJson: (formCode: string): Promise<ApiResponse<string>> => {
    return request.get(`/form/config/json/${formCode}`)
  },
  
  listAll: (): Promise<ApiResponse<FormConfig[]>> => {
    return request.get('/form/config/list')
  },
  
  getPage: (params: {
    pageNum?: number
    pageSize?: number
    formCode?: string
    formName?: string
  }): Promise<ApiResponse<PageData<FormConfig>>> => {
    return request.get('/form/config/page', { params })
  },
  
  create: (data: FormConfig): Promise<ApiResponse<boolean>> => {
    return request.post('/form/config/create', data)
  },
  
  saveOrUpdate: (data: FormConfig): Promise<ApiResponse<boolean>> => {
    return request.post('/form/config', data)
  },
  
  delete: (formCode: string): Promise<ApiResponse<boolean>> => {
    return request.delete(`/form/config/${formCode}`)
  }
}

export const dynamicDataApi = {
  getPage: (
    formCode: string,
    params: {
      pageNum?: number
      pageSize?: number
      [key: string]: any
    }
  ): Promise<ApiResponse<any[]>> => {
    const { pageNum = 1, pageSize = 10, ...queryParams } = params
    return request.get(`/dynamic/data/${formCode}/page`, {
      params: {
        pageNum,
        pageSize,
        ...queryParams
      }
    })
  },
  
  getById: (formCode: string, id: number): Promise<ApiResponse<any>> => {
    return request.get(`/dynamic/data/${formCode}/${id}`)
  },
  
  save: (formCode: string, data: any): Promise<ApiResponse<boolean>> => {
    return request.post(`/dynamic/data/${formCode}`, data)
  },
  
  update: (formCode: string, id: number, data: any): Promise<ApiResponse<boolean>> => {
    return request.put(`/dynamic/data/${formCode}/${id}`, data)
  },
  
  delete: (formCode: string, id: number): Promise<ApiResponse<boolean>> => {
    return request.delete(`/dynamic/data/${formCode}/${id}`)
  }
}

export const uploadApi = {
  upload: (file: File): Promise<ApiResponse<{ url: string; name: string; size: number; type: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  delete: (url: string): Promise<ApiResponse<boolean>> => {
    return request.delete('/upload', { params: { url } })
  }
}
