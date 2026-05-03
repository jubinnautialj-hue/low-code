# 动态表单低代码系统

## 系统概述

这是一个基于 Spring Boot 3.2.x + Spring Security 6.2 + MyBatis Plus 3.5.x + React 18 + Ant Design 5.x + ProComponents 开发的动态表单低代码系统。

**核心设计理念**：一张业务表对应一个可配置的 CRUD 页面。通过配置 JSON 来定义表单字段、校验规则、联动规则和显隐规则，无需编写代码即可快速生成完整的增删改查页面。

## 技术栈

### 后端技术栈
- **框架**: Spring Boot 3.2.0
- **安全**: Spring Security 6.2
- **ORM**: MyBatis Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **API 文档**: Knife4j (OpenAPI 3)
- **工具库**: Hutool, FastJSON2, Lombok

### 前端技术栈
- **框架**: React 18
- **UI 组件库**: Ant Design 5.x
- **高级组件**: ProComponents
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **日期处理**: Day.js
- **构建工具**: Vite 5

## 项目结构

```
low-code/
├── backend/                          # 后端项目
│   ├── pom.xml                       # Maven 配置
│   └── src/
│       └── main/
│           ├── java/com/lowcode/
│           │   ├── config/           # 配置类
│           │   │   ├── RedisConfig.java
│           │   │   ├── SecurityConfig.java
│           │   │   ├── MybatisPlusConfig.java
│           │   │   └── ResourceConfig.java
│           │   ├── controller/       # 控制器
│           │   │   ├── FormConfigController.java
│           │   │   ├── DynamicDataController.java
│           │   │   └── UploadController.java
│           │   ├── entity/           # 实体类
│           │   │   └── FormConfig.java
│           │   ├── mapper/           # Mapper 接口
│           │   │   └── FormConfigMapper.java
│           │   ├── service/          # 服务层
│           │   │   ├── FormConfigService.java
│           │   │   └── impl/
│           │   │       └── FormConfigServiceImpl.java
│           │   ├── common/           # 公共类
│           │   │   ├── Result.java
│           │   │   └── GlobalExceptionHandler.java
│           │   └── DynamicFormSystemApplication.java
│           └── resources/
│               ├── application.yml    # 应用配置
│               └── mapper/           # MyBatis XML 映射文件
├── frontend/                         # 前端项目
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx                  # 入口文件
│       ├── App.tsx                   # 根组件
│       ├── index.css                 # 全局样式
│       ├── components/               # 组件
│       │   └── DynamicFormRenderer.tsx    # 动态表单渲染器
│       ├── pages/                    # 页面
│       │   └── DynamicCrudPage.tsx  # 动态 CRUD 页面
│       ├── services/                 # API 服务
│       │   └── api.ts
│       ├── utils/                    # 工具类
│       │   └── request.ts
│       ├── data/                     # 数据文件
│       │   └── region.ts             # 省市区数据
│       └── routes/                   # 路由配置
└── database/                         # 数据库脚本
    ├── schema.sql                    # 数据库 DDL 脚本
    └── form-config-schema.json       # 表单配置 JSON Schema
```

## 环境要求

### 必需环境
- **JDK**: 17+
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **Maven**: 3.8+

### 可选环境
- **Git**: 版本控制
- **Docker**: 容器化部署

## 快速开始

### 第一步：数据库初始化

1. 创建 MySQL 数据库
```sql
CREATE DATABASE lowcode_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行数据库脚本
```bash
# 进入 database 目录
cd database

# 使用 MySQL 命令行执行脚本
mysql -u root -p lowcode_db < schema.sql
```

脚本包含：
- `sys_form_config` 表：存储表单配置
- `biz_user` 表：示例业务表（用户表）
- `sys_operation_log` 表：操作日志表
- 初始数据：用户表单配置和 3 条示例用户数据

### 第二步：配置并启动后端

1. 修改数据库配置（可选）

编辑 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lowcode_db?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: root      # 修改为你的数据库用户名
    password: root      # 修改为你的数据库密码
  
  data:
    redis:
      host: localhost   # 修改为你的 Redis 地址
      port: 6379        # 修改为你的 Redis 端口
      password:         # 修改为你的 Redis 密码（如果有）
```

2. 启动后端服务

```bash
cd backend

# 使用 Maven 启动
mvn spring-boot:run

# 或者先编译再运行
mvn clean package -DskipTests
java -jar target/dynamic-form-system-1.0.0.jar
```

后端服务启动后，访问以下地址：
- API 地址：http://localhost:8080/api
- Swagger 文档：http://localhost:8080/api/doc.html
- Druid 监控：http://localhost:8080/api/druid (用户名: admin, 密码: admin123)

### 第三步：配置并启动前端

1. 安装依赖

```bash
cd frontend

# 使用 npm
npm install

# 或者使用 yarn
yarn install

# 或者使用 pnpm
pnpm install
```

2. 启动开发服务器

```bash
npm run dev
```

前端服务启动后，访问：
- 应用地址：http://localhost:3000
- 会自动重定向到：http://localhost:3000/dynamic/user_form

## 核心 API 接口

### 表单配置接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/form/config/{formCode} | 根据表单编码获取完整配置 |
| GET | /api/form/config/json/{formCode} | 根据表单编码获取 JSON 配置（供前端渲染） |
| GET | /api/form/config/page | 分页查询表单配置列表 |
| POST | /api/form/config | 保存或更新表单配置 |
| DELETE | /api/form/config/{formCode} | 删除表单配置 |

### 动态数据接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/dynamic/data/{formCode}/page | 分页查询业务表数据 |
| GET | /api/dynamic/data/{formCode}/{id} | 根据 ID 查询单条数据 |
| POST | /api/dynamic/data/{formCode} | 新增数据 |
| PUT | /api/dynamic/data/{formCode}/{id} | 更新数据 |
| DELETE | /api/dynamic/data/{formCode}/{id} | 删除数据 |

### 文件上传接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/upload | 单文件上传 |
| POST | /api/upload/batch | 多文件上传 |
| DELETE | /api/upload | 删除文件 |

## 表单配置详解

### 整体结构

表单配置存储在 `sys_form_config` 表的 `config_json` 字段中，JSON 结构如下：

```json
{
  "formTitle": "用户信息",
  "formWidth": 800,
  "labelWidth": 120,
  "columns": [
    // 字段配置数组
  ],
  "tableConfig": {
    // 列表页面配置
  },
  "formConfig": {
    // 表单页面配置
  }
}
```

### 字段配置 (columns)

每个字段支持以下属性：

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| field | string | 是 | 字段名，对应数据库字段 |
| title | string | 是 | 字段显示名称 |
| type | string | 是 | 字段类型（见下方字段类型列表） |
| required | boolean | 否 | 是否必填，默认 false |
| placeholder | string | 否 | 占位提示文字 |
| defaultValue | any | 否 | 默认值 |
| disabled | boolean | 否 | 是否禁用，默认 false |
| hidden | boolean | 否 | 是否完全隐藏（表单和列表都隐藏） |
| hideInForm | boolean | 否 | 是否在表单中隐藏 |
| hideInTable | boolean | 否 | 是否在列表中隐藏 |
| width | number | 否 | 列表列宽度（像素） |
| rules | array | 否 | 校验规则数组 |
| linkage | object | 否 | 联动规则配置 |
| hiddenExpression | string | 否 | 动态隐藏表达式 |
| options | array | 否 | 下拉选项（select/radio/checkbox） |

### 支持的字段类型

#### 1. input - 输入框

额外属性：
- `inputType`: 输入类型
  - `text`（默认）: 普通文本
  - `password`: 密码
  - `email`: 邮箱
  - `tel`: 电话
  - `number`: 数字
  - `textarea`: 文本域
  - `url`: URL
- `rows`: 文本域行数（inputType=textarea 时有效）

示例：
```json
{
  "field": "username",
  "title": "用户名",
  "type": "input",
  "required": true,
  "placeholder": "请输入用户名"
}
```

#### 2. select - 下拉选择

额外属性：
- `options`: 选项数组，每个选项包含 `label` 和 `value`

示例：
```json
{
  "field": "gender",
  "title": "性别",
  "type": "select",
  "options": [
    { "label": "未知", "value": 0 },
    { "label": "男", "value": 1 },
    { "label": "女", "value": 2 }
  ]
}
```

#### 3. cascader - 级联选择

额外属性：
- `options`: 级联选项树
- `fieldNames`: 自定义字段名映射
  - `label`: 显示文本字段名
  - `value`: 值字段名
  - `children`: 子级字段名
- `showAllLevels`: 是否显示完整路径，默认 true

示例：
```json
{
  "field": "region",
  "title": "所在地区",
  "type": "cascader",
  "showAllLevels": true,
  "options": [
    {
      "label": "北京市",
      "value": "北京市",
      "children": [
        {
          "label": "北京市",
          "value": "北京市",
          "children": [
            { "label": "东城区", "value": "东城区" },
            { "label": "西城区", "value": "西城区" }
          ]
        }
      ]
    }
  ]
}
```

#### 4. date - 日期选择

额外属性：
- `dateType`: 日期类型
  - `date`（默认）: 日期
  - `dateTime`: 日期时间
  - `month`: 月份
  - `year`: 年份
  - `dateRange`: 日期范围
  - `dateTimeRange`: 日期时间范围
- `format`: 日期格式，如 "YYYY-MM-DD"

示例：
```json
{
  "field": "birthday",
  "title": "生日",
  "type": "date",
  "dateType": "date",
  "format": "YYYY-MM-DD"
}
```

#### 5. upload - 文件上传

额外属性：
- `uploadType`: 上传类型
  - `image`: 图片
  - `file`: 文件
  - `video`: 视频
  - `audio`: 音频
- `maxCount`: 最大上传数量
- `maxSize`: 最大文件大小（MB）
- `accept`: 接受的文件类型，如 ".jpg,.jpeg,.png"
- `action`: 上传接口地址
- `listType`: 文件列表样式
  - `text`（默认）: 文本
  - `picture`: 图片
  - `picture-card`: 卡片式图片

示例：
```json
{
  "field": "avatar",
  "title": "头像",
  "type": "upload",
  "uploadType": "image",
  "maxCount": 1,
  "maxSize": 2,
  "accept": ".jpg,.jpeg,.png,.gif",
  "listType": "picture-card"
}
```

#### 6. radio - 单选框

额外属性：
- `options`: 选项数组

示例：
```json
{
  "field": "status",
  "title": "状态",
  "type": "radio",
  "options": [
    { "label": "禁用", "value": 0 },
    { "label": "启用", "value": 1 }
  ]
}
```

#### 7. checkbox - 多选框

额外属性：
- `options`: 选项数组

示例：
```json
{
  "field": "roles",
  "title": "角色",
  "type": "checkbox",
  "options": [
    { "label": "管理员", "value": "admin" },
    { "label": "普通用户", "value": "user" },
    { "label": "访客", "value": "guest" }
  ]
}
```

#### 8. switch - 开关

示例：
```json
{
  "field": "enabled",
  "title": "是否启用",
  "type": "switch",
  "defaultValue": true
}
```

#### 9. rate - 评分

示例：
```json
{
  "field": "rating",
  "title": "评分",
  "type": "rate",
  "defaultValue": 3
}
```

#### 10. slider - 滑块

示例：
```json
{
  "field": "progress",
  "title": "进度",
  "type": "slider",
  "defaultValue": 50
}
```

### 校验规则 (rules)

支持以下校验规则：

| 属性 | 类型 | 描述 |
|------|------|------|
| required | boolean | 是否必填 |
| pattern | string | 正则表达式 |
| message | string | 校验失败提示信息 |
| min | number | 最小长度/最小值 |
| max | number | 最大长度/最大值 |
| type | string | 内置校验类型 |

内置校验类型：
- `email`: 邮箱
- `url`: URL
- `number`: 数字
- `integer`: 整数
- `float`: 浮点数
- `date`: 日期
- `boolean`: 布尔值

示例：
```json
{
  "field": "username",
  "title": "用户名",
  "type": "input",
  "required": true,
  "rules": [
    {
      "pattern": "^[a-zA-Z0-9_]{3,20}$",
      "message": "用户名必须是3-20位的字母、数字或下划线"
    }
  ]
}
```

### 动态隐藏表达式 (hiddenExpression)

使用 JavaScript 表达式动态控制字段显示/隐藏。表达式会在当前表单值的上下文中执行。

示例：
```json
{
  "field": "city",
  "title": "城市",
  "type": "select",
  "hiddenExpression": "!province"
}
```

这个配置表示：当 `province` 字段没有值时，`city` 字段隐藏。

更多示例：
- `"age < 18"`: 年龄小于 18 时隐藏
- `"status === 1 && type === 'vip'"`: 状态为 1 且类型为 vip 时隐藏
- `"!email || email.indexOf('@') === -1"`: 邮箱为空或格式不正确时隐藏

### 联动规则 (linkage)

**注意**：当前版本中，省市联动已内置实现。对于其他联动场景，可以通过扩展来支持。

内置的省市联动逻辑：
- 当字段名为 `province` 时，自动加载省份选项
- 当字段名为 `city` 且 `province` 有值时，自动加载对应省份的城市选项
- 当字段名为 `district` 且 `province` 和 `city` 都有值时，自动加载对应城市的区县选项
- 选择省份后，自动清空城市和区县的值
- 选择城市后，自动清空区县的值

### 列表配置 (tableConfig)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| showIndex | boolean | true | 是否显示序号列 |
| showSelection | boolean | true | 是否显示选择列 |
| pagination | boolean | true | 是否显示分页 |
| pageSize | number | 10 | 每页显示条数 |
| searchFields | array | - | 搜索字段数组 |

示例：
```json
{
  "tableConfig": {
    "showIndex": true,
    "showSelection": true,
    "pagination": true,
    "pageSize": 10,
    "searchFields": ["username", "real_name", "email", "phone", "status"]
  }
}
```

### 表单配置 (formConfig)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| submitText | string | "提交" | 提交按钮文字 |
| resetText | string | "重置" | 重置按钮文字 |
| layout | string | "horizontal" | 表单布局：horizontal/vertical/inline |
| labelAlign | string | "right" | 标签对齐方式：left/right |

示例：
```json
{
  "formConfig": {
    "submitText": "提交",
    "resetText": "重置",
    "layout": "horizontal",
    "labelAlign": "right"
  }
}
```

## 使用指南

### 如何创建新的动态表单

#### 步骤 1：创建业务表

首先在 MySQL 中创建你的业务表。表需要包含以下字段：

```sql
CREATE TABLE biz_xxx (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    -- 你的业务字段
    field1 VARCHAR(100),
    field2 INT,
    field3 DATE,
    -- 系统字段（必需）
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**注意**：系统字段 `status`、`create_time`、`update_time`、`deleted` 是必需的，用于支持状态管理、时间记录和逻辑删除。

#### 步骤 2：插入表单配置

向 `sys_form_config` 表插入表单配置记录：

```sql
INSERT INTO sys_form_config (
    form_code, 
    form_name, 
    form_description, 
    business_table, 
    config_json, 
    status, 
    version, 
    create_by
) VALUES (
    'xxx_form',                    -- 表单编码（唯一）
    'XXX管理表单',                   -- 表单名称
    '用于管理XXX数据的动态表单',      -- 表单描述
    'biz_xxx',                      -- 对应的业务表名
    '{                             -- 表单配置 JSON
        "formTitle": "XXX信息",
        "columns": [
            {
                "field": "id",
                "title": "ID",
                "type": "input",
                "hidden": true,
                "hideInForm": true,
                "hideInTable": false
            },
            {
                "field": "field1",
                "title": "字段1",
                "type": "input",
                "required": true,
                "placeholder": "请输入字段1"
            },
            {
                "field": "field2",
                "title": "字段2",
                "type": "select",
                "options": [
                    { "label": "选项1", "value": 1 },
                    { "label": "选项2", "value": 2 }
                ]
            },
            {
                "field": "field3",
                "title": "字段3",
                "type": "date",
                "dateType": "date"
            },
            {
                "field": "status",
                "title": "状态",
                "type": "select",
                "required": true,
                "options": [
                    { "label": "禁用", "value": 0 },
                    { "label": "启用", "value": 1 }
                ],
                "defaultValue": 1
            },
            {
                "field": "create_time",
                "title": "创建时间",
                "type": "date",
                "dateType": "dateTime",
                "hideInForm": true
            },
            {
                "field": "update_time",
                "title": "更新时间",
                "type": "date",
                "dateType": "dateTime",
                "hideInForm": true
            }
        ],
        "tableConfig": {
            "showIndex": true,
            "showSelection": true,
            "pagination": true,
            "pageSize": 10,
            "searchFields": ["field1", "status"]
        },
        "formConfig": {
            "submitText": "提交",
            "resetText": "重置",
            "layout": "horizontal"
        }
    }',
    1,                              -- 状态：1-启用
    1,                              -- 版本号
    'system'                        -- 创建人
);
```

#### 步骤 3：访问动态页面

启动前后端服务后，访问以下地址：

```
http://localhost:3000/dynamic/xxx_form
```

其中 `xxx_form` 是你在 `form_code` 字段中配置的值。

### 完整示例：用户表单

系统已内置用户表单示例，配置在 `sys_form_config` 表中，`form_code` 为 `user_form`。

访问地址：
```
http://localhost:3000/dynamic/user_form
```

这个示例表单包含：
- 基本信息：用户名、真实姓名、密码、邮箱、手机号
- 头像上传（picture-card 样式）
- 性别选择
- 生日选择
- 省市联动：省份 → 城市 → 区县
- 详细地址
- 状态选择

## 扩展方式

### 如何添加新的字段类型

#### 后端不需要修改

后端使用动态 SQL 操作业务表，不关心具体的字段类型，因此添加新的字段类型不需要修改后端代码。

#### 前端修改步骤

1. 打开 `src/components/DynamicFormRenderer.tsx`

2. 在 `renderFormItem` 函数的 `switch` 语句中添加新的 `case`：

```typescript
case 'newType':  // 新的字段类型
  return (
    <YourNewComponent
      key={index}
      {...commonProps}
      // 组件的其他属性
    />
  )
```

3. 在 `src/services/api.ts` 的 `FormColumn` 接口中添加新类型支持（可选）：

```typescript
type: 'input' | 'select' | 'cascader' | 'date' | 'upload' | 'richText' | 
      'radio' | 'checkbox' | 'switch' | 'rate' | 'slider' | 'newType'  // 添加新类型
```

### 如何自定义校验规则

#### 前端修改

校验规则在 `DynamicFormRenderer.tsx` 的 `convertRules` 函数中处理：

```typescript
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
      
      // 在这里添加自定义校验规则处理
      if (rule.type === 'custom') {
        convertedRule.validator = (rule, value) => {
          // 自定义校验逻辑
          return Promise.resolve()
        }
      }
      
      rules.push(convertedRule)
    })
  }
  
  return rules
}
```

### 如何扩展联动规则

#### 前端修改

当前省市联动逻辑在 `DynamicFormRenderer.tsx` 的 `handleValuesChange` 和 `renderFormItem` 函数中。

要扩展其他联动场景，可以：

1. 在 `renderFormItem` 函数中添加新的联动条件：

```typescript
case 'select':
  let selectOptions = column.options || []
  
  // 现有的省市联动
  if (column.field === 'province') {
    selectOptions = provinceOptions
  } else if (column.field === 'city' && formValues.province) {
    selectOptions = getCityOptions(formValues.province)
  } else if (column.field === 'district' && formValues.province && formValues.city) {
    selectOptions = getDistrictOptions(formValues.province, formValues.city)
  }
  
  // 添加新的联动逻辑
  if (column.field === 'customField' && formValues.anotherField) {
    // 根据 anotherField 的值加载 customField 的选项
    selectOptions = getCustomOptions(formValues.anotherField)
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
```

2. 在 `handleValuesChange` 函数中添加值联动：

```typescript
const handleValuesChange = (changedValues: Record<string, any>, allValues: Record<string, any>) => {
  setFormValues(allValues)
  
  // 现有的省市联动
  if (changedValues.province) {
    activeForm.setFieldValue('city', undefined)
    activeForm.setFieldValue('district', undefined)
  }
  if (changedValues.city) {
    activeForm.setFieldValue('district', undefined)
  }
  
  // 添加新的值联动
  if (changedValues.triggerField) {
    activeForm.setFieldValue('targetField', undefined)
    // 或者设置默认值
    // activeForm.setFieldValue('targetField', defaultValue)
  }
  
  onValuesChange?.(changedValues, allValues)
}
```

### 如何添加新的 API 接口

#### 后端修改

1. 在 `controller` 目录下创建新的 Controller 或修改现有 Controller

2. 添加新的接口方法：

```java
@RestController
@RequestMapping("/custom")
@RequiredArgsConstructor
public class CustomController {
    
    private final CustomService customService;
    
    @GetMapping("/data")
    public Result<List<CustomData>> getCustomData() {
        List<CustomData> data = customService.getCustomData();
        return Result.success(data);
    }
}
```

3. 如果需要在 Security 中放行接口，修改 `SecurityConfig.java`：

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
        // 现有的放行路径
        "/form/config/**",
        "/dynamic/data/**",
        "/upload/**",
        "/uploads/**",
        // 添加新的放行路径
        "/custom/**",
        // ...
    ).permitAll()
    .anyRequest().authenticated()
)
```

#### 前端修改

1. 在 `src/services/api.ts` 中添加新的 API 服务：

```typescript
export const customApi = {
  getCustomData: (): Promise<ApiResponse<CustomData[]>> => {
    return request.get('/custom/data')
  },
  
  saveCustomData: (data: CustomData): Promise<ApiResponse<boolean>> => {
    return request.post('/custom/data', data)
  }
}
```

2. 在组件中使用：

```typescript
import { customApi } from '@/services/api'

// 调用 API
const loadData = async () => {
  const res = await customApi.getCustomData()
  if (res.code === 200) {
    setData(res.data)
  }
}
```

### 如何扩展缓存策略

后端的 Redis 缓存配置在 `FormConfigServiceImpl.java` 中：

```java
private static final String REDIS_PREFIX = "form:config:";
private static final long REDIS_EXPIRE_TIME = 30; // 30 分钟

@Override
public FormConfig getByFormCode(String formCode) {
    String redisKey = REDIS_PREFIX + formCode;
    Object cached = redisTemplate.opsForValue().get(redisKey);
    if (cached != null) {
        log.info("从Redis缓存获取表单配置: {}", formCode);
        return JSON.parseObject(JSON.toJSONString(cached), FormConfig.class);
    }
    
    // 查询数据库
    FormConfig formConfig = this.getOne(wrapper);
    
    if (formConfig != null) {
        redisTemplate.opsForValue().set(redisKey, formConfig, REDIS_EXPIRE_TIME, TimeUnit.MINUTES);
        log.info("缓存表单配置到Redis: {}", formCode);
    }
    
    return formConfig;
}
```

要扩展缓存策略，可以：

1. **修改缓存时间**：修改 `REDIS_EXPIRE_TIME` 常量
2. **添加缓存更新**：在 `saveOrUpdateFormConfig` 和 `deleteByFormCode` 方法中已实现缓存清除
3. **扩展缓存键**：可以添加更多缓存前缀，如 `form:data:` 用于缓存业务数据

### 如何添加权限控制

当前 Security 配置允许所有 API 接口匿名访问。要添加权限控制：

1. 修改 `SecurityConfig.java`：

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
        "/form/config/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/doc.html",
        "/webjars/**",
        "/swagger-resources/**",
        "/druid/**",
        "/error"
    ).permitAll()
    .requestMatchers("/dynamic/data/**").hasAnyRole("USER", "ADMIN")
    .requestMatchers("/upload/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

2. 添加用户认证逻辑（JWT）：

可以参考现有的 JWT 配置，添加登录接口和 JWT 过滤器。

## 故障排查

### 常见问题

#### 1. 后端启动失败

**错误信息**：`Failed to configure a DataSource: 'url' attribute is not specified...`

**原因**：数据库连接配置错误

**解决**：
- 检查 `application.yml` 中的数据库配置
- 确认 MySQL 服务已启动
- 确认数据库已创建

#### 2. 前端页面空白

**错误信息**：控制台显示 404 或 500 错误

**原因**：
- 后端服务未启动
- 表单配置不存在

**解决**：
- 确认后端服务已启动（端口 8080）
- 确认 `sys_form_config` 表中存在对应 `form_code` 的记录
- 检查浏览器控制台的网络请求

#### 3. 省市联动不生效

**原因**：
- 字段名不是 `province`、`city`、`district`
- 省市区数据不完整

**解决**：
- 确认字段名与内置联动逻辑匹配
- 检查 `src/data/region.ts` 中的数据
- 或者根据实际字段名修改联动逻辑

#### 4. 文件上传失败

**错误信息**：上传图片时显示失败

**原因**：
- 上传接口未正确配置
- 文件大小超过限制
- 上传目录权限不足

**解决**：
- 检查后端 `UploadController` 是否正常
- 检查 `application.yml` 中的 `spring.servlet.multipart` 配置
- 确认上传目录（默认 `./uploads`）有写入权限

#### 5. Redis 连接失败

**错误信息**：`Unable to connect to Redis`

**原因**：
- Redis 服务未启动
- Redis 配置错误

**解决**：
- 确认 Redis 服务已启动
- 检查 `application.yml` 中的 Redis 配置
- 如果不需要 Redis，可以临时移除 Redis 依赖和配置

### 调试技巧

#### 后端调试

1. 查看控制台日志：MyBatis Plus 会打印 SQL 语句
2. 访问 Druid 监控：http://localhost:8080/api/druid
3. 访问 Swagger 文档：http://localhost:8080/api/doc.html 进行接口测试

#### 前端调试

1. 使用浏览器开发者工具：
   - Network 面板查看 API 请求
   - Console 面板查看日志
2. React DevTools：查看组件状态和 Props
3. 在代码中添加 `console.log` 输出调试信息

## 部署说明

### 后端部署

#### 方式 1：JAR 包部署

1. 编译打包：
```bash
cd backend
mvn clean package -DskipTests
```

2. 运行 JAR 包：
```bash
java -jar target/dynamic-form-system-1.0.0.jar
```

3. 指定配置文件运行：
```bash
java -jar target/dynamic-form-system-1.0.0.jar --spring.profiles.active=prod
```

#### 方式 2：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/dynamic-form-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建并运行：
```bash
docker build -t dynamic-form-system .
docker run -p 8080:8080 --name dynamic-form dynamic-form-system
```

### 前端部署

#### 方式 1：静态文件部署

1. 构建生产版本：
```bash
cd frontend
npm run build
```

2. 将 `dist` 目录部署到 Nginx 或其他 Web 服务器

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态资源
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 方式 2：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 性能优化建议

### 后端优化

1. **数据库优化**：
   - 为业务表的查询字段添加索引
   - 使用读写分离（如果需要）
   - 定期清理历史数据

2. **Redis 缓存**：
   - 增加表单配置的缓存时间
   - 考虑缓存热点业务数据
   - 使用 Redis 集群（高并发场景）

3. **连接池优化**：
   - 调整 Druid 连接池参数
   - 根据实际并发量设置 `max-active`
   - 监控连接池使用情况

### 前端优化

1. **代码分割**：
   - Vite 已配置手动分块
   - 考虑使用 React.lazy 进行路由级别的代码分割

2. **资源优化**：
   - 图片压缩和懒加载
   - 使用 CDN 加载第三方库
   - 开启 Gzip 压缩

3. **缓存策略**：
   - 合理使用 React.memo、useMemo、useCallback
   - 避免不必要的重渲染
   - 使用 SWR 或 React Query 进行数据缓存

## 安全建议

1. **生产环境安全配置**：
   - 修改默认数据库密码
   - 修改 Redis 密码
   - 修改 Druid 监控密码
   - 禁用 Swagger 文档或添加访问控制

2. **输入验证**：
   - 后端已使用 Spring Validation
   - 前端已配置表单校验
   - 建议添加 SQL 注入防护（当前使用 PreparedStatement）

3. **文件上传安全**：
   - 限制上传文件类型
   - 限制上传文件大小
   - 对上传文件进行病毒扫描（生产环境）

4. **添加认证授权**：
   - 实现 JWT 登录认证
   - 添加角色权限控制
   - 配置接口权限校验

## 后续扩展方向

1. **表单设计器**：
   - 可视化拖拽配置表单
   - 实时预览功能
   - 表单模板管理

2. **工作流集成**：
   - 集成 Flowable 或 Activiti
   - 表单数据提交触发流程
   - 流程审批界面

3. **报表功能**：
   - 基于表单数据生成报表
   - 图表可视化
   - 数据导出（Excel/PDF）

4. **多租户支持**：
   - 租户隔离
   - 数据源动态切换
   - 租户管理界面

5. **移动端适配**：
   - 响应式设计优化
   - 小程序版本
   - App 版本

## 技术支持

如有问题，请检查：
1. 环境版本是否符合要求
2. 配置文件是否正确
3. 数据库脚本是否已执行
4. 控制台是否有错误日志

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现动态表单渲染
- 实现省市联动
- 实现文件上传
- 实现动态 CRUD 页面
- 集成 Redis 缓存
- 集成 Spring Security
