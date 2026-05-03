-- 动态表单低代码系统数据库脚本
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci

-- 创建数据库
CREATE DATABASE IF NOT EXISTS lowcode_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lowcode_db;

-- ============================================
-- 1. 表单配置表 (sys_form_config)
-- 存储所有动态表单的配置信息
-- ============================================
CREATE TABLE IF NOT EXISTS sys_form_config (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    form_code VARCHAR(100) NOT NULL COMMENT '表单编码，唯一标识',
    form_name VARCHAR(200) NOT NULL COMMENT '表单名称',
    form_description VARCHAR(500) COMMENT '表单描述',
    business_table VARCHAR(100) NOT NULL COMMENT '对应的业务表名',
    config_json JSON NOT NULL COMMENT '表单配置JSON，包含字段信息、校验规则、联动规则等',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    version INT DEFAULT 1 COMMENT '版本号',
    create_by VARCHAR(100) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(100) COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_form_code (form_code),
    KEY idx_business_table (business_table),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单配置表';

-- ============================================
-- 2. 示例业务表：用户表 (biz_user)
-- 用于演示动态表单的使用
-- ============================================
CREATE TABLE IF NOT EXISTS biz_user (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    real_name VARCHAR(100) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(500) COMMENT '头像URL',
    gender TINYINT COMMENT '性别：0-未知，1-男，2-女',
    birthday DATE COMMENT '生日',
    province VARCHAR(100) COMMENT '省份',
    city VARCHAR(100) COMMENT '城市',
    district VARCHAR(100) COMMENT '区县',
    address VARCHAR(500) COMMENT '详细地址',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    KEY idx_email (email),
    KEY idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户业务表';

-- ============================================
-- 3. 操作日志表 (sys_operation_log)
-- 记录系统操作日志
-- ============================================
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation VARCHAR(100) COMMENT '操作类型',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    time BIGINT COMMENT '执行时长（毫秒）',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 4. 插入初始数据：用户表单配置
-- ============================================
INSERT INTO sys_form_config (form_code, form_name, form_description, business_table, config_json, status, version, create_by) 
VALUES (
    'user_form',
    '用户管理表单',
    '用于管理系统用户信息的动态表单，包含省市联动和头像上传功能',
    'biz_user',
    JSON_OBJECT(
        'formTitle', '用户信息',
        'formWidth', 800,
        'labelWidth', 120,
        'columns', JSON_ARRAY(
            JSON_OBJECT(
                'field', 'id',
                'title', 'ID',
                'type', 'input',
                'hidden', TRUE,
                'hideInForm', TRUE,
                'hideInTable', FALSE,
                'width', 80
            ),
            JSON_OBJECT(
                'field', 'username',
                'title', '用户名',
                'type', 'input',
                'required', TRUE,
                'placeholder', '请输入用户名',
                'rules', JSON_ARRAY(
                    JSON_OBJECT(
                        'pattern', '^[a-zA-Z0-9_]{3,20}$',
                        'message', '用户名必须是3-20位的字母、数字或下划线'
                    )
                ),
                'hideInTable', FALSE,
                'width', 150
            ),
            JSON_OBJECT(
                'field', 'real_name',
                'title', '真实姓名',
                'type', 'input',
                'required', FALSE,
                'placeholder', '请输入真实姓名',
                'hideInTable', FALSE,
                'width', 120
            ),
            JSON_OBJECT(
                'field', 'password',
                'title', '密码',
                'type', 'input',
                'inputType', 'password',
                'required', TRUE,
                'placeholder', '请输入密码',
                'rules', JSON_ARRAY(
                    JSON_OBJECT(
                        'min', 6,
                        'message', '密码长度不能少于6位'
                    )
                ),
                'hideInTable', TRUE
            ),
            JSON_OBJECT(
                'field', 'email',
                'title', '邮箱',
                'type', 'input',
                'inputType', 'email',
                'required', FALSE,
                'placeholder', '请输入邮箱地址',
                'rules', JSON_ARRAY(
                    JSON_OBJECT(
                        'type', 'email',
                        'message', '请输入有效的邮箱地址'
                    )
                ),
                'hideInTable', FALSE,
                'width', 180
            ),
            JSON_OBJECT(
                'field', 'phone',
                'title', '手机号',
                'type', 'input',
                'inputType', 'tel',
                'required', FALSE,
                'placeholder', '请输入手机号',
                'rules', JSON_ARRAY(
                    JSON_OBJECT(
                        'pattern', '^1[3-9][0-9]{9}$',
                        'message', '请输入有效的手机号'
                    )
                ),
                'hideInTable', FALSE,
                'width', 130
            ),
            JSON_OBJECT(
                'field', 'avatar',
                'title', '头像',
                'type', 'upload',
                'required', FALSE,
                'uploadType', 'image',
                'maxCount', 1,
                'maxSize', 2,
                'accept', '.jpg,.jpeg,.png,.gif',
                'action', '/api/upload',
                'listType', 'picture-card',
                'hideInTable', TRUE
            ),
            JSON_OBJECT(
                'field', 'gender',
                'title', '性别',
                'type', 'select',
                'required', FALSE,
                'placeholder', '请选择性别',
                'options', JSON_ARRAY(
                    JSON_OBJECT('label', '未知', 'value', 0),
                    JSON_OBJECT('label', '男', 'value', 1),
                    JSON_OBJECT('label', '女', 'value', 2)
                ),
                'hideInTable', FALSE,
                'width', 80
            ),
            JSON_OBJECT(
                'field', 'birthday',
                'title', '生日',
                'type', 'date',
                'dateType', 'date',
                'required', FALSE,
                'placeholder', '请选择生日',
                'format', 'YYYY-MM-DD',
                'hideInTable', FALSE,
                'width', 120
            ),
            JSON_OBJECT(
                'field', 'region',
                'title', '所在地区',
                'type', 'cascader',
                'required', FALSE,
                'placeholder', '请选择省市区',
                'showAllLevels', TRUE,
                'fieldNames', JSON_OBJECT(
                    'label', 'label',
                    'value', 'value',
                    'children', 'children'
                ),
                'hideInTable', TRUE
            ),
            JSON_OBJECT(
                'field', 'province',
                'title', '省份',
                'type', 'select',
                'required', FALSE,
                'placeholder', '请选择省份',
                'hideInTable', FALSE,
                'width', 100,
                'linkage', JSON_OBJECT(
                    'triggerField', 'province',
                    'targetField', 'city',
                    'type', 'cascade'
                )
            ),
            JSON_OBJECT(
                'field', 'city',
                'title', '城市',
                'type', 'select',
                'required', FALSE,
                'placeholder', '请选择城市',
                'hideInTable', FALSE,
                'width', 100,
                'hiddenExpression', '!province'
            ),
            JSON_OBJECT(
                'field', 'district',
                'title', '区县',
                'type', 'select',
                'required', FALSE,
                'placeholder', '请选择区县',
                'hideInTable', FALSE,
                'width', 100,
                'hiddenExpression', '!city'
            ),
            JSON_OBJECT(
                'field', 'address',
                'title', '详细地址',
                'type', 'input',
                'inputType', 'textarea',
                'required', FALSE,
                'placeholder', '请输入详细地址',
                'rows', 3,
                'hideInTable', TRUE
            ),
            JSON_OBJECT(
                'field', 'status',
                'title', '状态',
                'type', 'select',
                'required', TRUE,
                'placeholder', '请选择状态',
                'options', JSON_ARRAY(
                    JSON_OBJECT('label', '禁用', 'value', 0),
                    JSON_OBJECT('label', '启用', 'value', 1)
                ),
                'defaultValue', 1,
                'hideInTable', FALSE,
                'width', 80
            ),
            JSON_OBJECT(
                'field', 'create_time',
                'title', '创建时间',
                'type', 'date',
                'dateType', 'dateTime',
                'hideInForm', TRUE,
                'hideInTable', FALSE,
                'width', 180
            ),
            JSON_OBJECT(
                'field', 'update_time',
                'title', '更新时间',
                'type', 'date',
                'dateType', 'dateTime',
                'hideInForm', TRUE,
                'hideInTable', FALSE,
                'width', 180
            )
        ),
        'tableConfig', JSON_OBJECT(
            'showIndex', TRUE,
            'showSelection', TRUE,
            'pagination', TRUE,
            'pageSize', 10,
            'searchFields', JSON_ARRAY('username', 'real_name', 'email', 'phone', 'status')
        ),
        'formConfig', JSON_OBJECT(
            'submitText', '提交',
            'resetText', '重置',
            'layout', 'horizontal',
            'labelAlign', 'right'
        )
    ),
    1,
    1,
    'system'
);

-- ============================================
-- 5. 插入初始用户数据
-- ============================================
INSERT INTO biz_user (username, password, real_name, email, phone, gender, birthday, province, city, district, address, status) 
VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', 'admin@example.com', '13800138000', 1, '1990-01-01', '北京市', '北京市', '东城区', '北京市东城区某某街道123号', 1),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张三', 'zhangsan@example.com', '13800138001', 1, '1992-05-15', '上海市', '上海市', '浦东新区', '上海市浦东新区某某路456号', 1),
('user2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李四', 'lisi@example.com', '13800138002', 2, '1995-08-20', '广东省', '广州市', '天河区', '广州市天河区某某大厦789号', 1);
