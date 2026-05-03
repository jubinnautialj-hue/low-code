package com.lowcode.service.impl;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lowcode.entity.FormConfig;
import com.lowcode.mapper.FormConfigMapper;
import com.lowcode.service.FormConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormConfigServiceImpl extends ServiceImpl<FormConfigMapper, FormConfig> implements FormConfigService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String REDIS_PREFIX = "form:config:";
    private static final long REDIS_EXPIRE_TIME = 30;
    
    private static final java.util.Set<String> EXCLUDED_PARAMS = java.util.Set.of(
        "pageNum", "pageSize", "current", "size", "sort", "filter", 
        "pageNum_old", "pageSize_old", "order", "asc", "desc"
    );
    
    @Override
    public FormConfig getByFormCode(String formCode) {
        String redisKey = REDIS_PREFIX + formCode;
        Object cached = redisTemplate.opsForValue().get(redisKey);
        if (cached != null) {
            log.info("从Redis缓存获取表单配置: {}", formCode);
            return convertToFormConfig(cached);
        }
        
        LambdaQueryWrapper<FormConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FormConfig::getFormCode, formCode)
               .eq(FormConfig::getStatus, 1)
               .eq(FormConfig::getDeleted, 0);
        
        FormConfig formConfig = this.getOne(wrapper);
        
        if (formConfig != null) {
            redisTemplate.opsForValue().set(redisKey, formConfig, REDIS_EXPIRE_TIME, TimeUnit.MINUTES);
            log.info("缓存表单配置到Redis: {}", formCode);
        }
        
        return formConfig;
    }
    
    private FormConfig convertToFormConfig(Object cached) {
        if (cached instanceof FormConfig) {
            return (FormConfig) cached;
        }
        try {
            return objectMapper.convertValue(cached, FormConfig.class);
        } catch (Exception e) {
            log.warn("Redis缓存类型转换失败，返回null: {}", e.getMessage());
            return null;
        }
    }
    
    @Override
    public String getConfigJsonByFormCode(String formCode) {
        FormConfig formConfig = getByFormCode(formCode);
        return formConfig != null ? formConfig.getConfigJson() : null;
    }
    
    @Override
    public Page<FormConfig> pageList(Integer pageNum, Integer pageSize, String formCode, String formName) {
        Page<FormConfig> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<FormConfig> wrapper = new LambdaQueryWrapper<>();
        
        if (StrUtil.isNotBlank(formCode)) {
            wrapper.like(FormConfig::getFormCode, formCode);
        }
        if (StrUtil.isNotBlank(formName)) {
            wrapper.like(FormConfig::getFormName, formName);
        }
        
        wrapper.eq(FormConfig::getDeleted, 0)
               .orderByDesc(FormConfig::getCreateTime);
        
        return this.page(page, wrapper);
    }
    
    @Override
    public List<FormConfig> listAll() {
        LambdaQueryWrapper<FormConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FormConfig::getStatus, 1)
               .eq(FormConfig::getDeleted, 0)
               .orderByDesc(FormConfig::getCreateTime);
        return this.list(wrapper);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveOrUpdateFormConfig(FormConfig formConfig) {
        boolean result = this.saveOrUpdate(formConfig);
        
        if (result) {
            String redisKey = REDIS_PREFIX + formConfig.getFormCode();
            redisTemplate.delete(redisKey);
            log.info("清除Redis缓存: {}", formConfig.getFormCode());
        }
        
        return result;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createFormWithTable(FormConfig formConfig) {
        String tableName = formConfig.getBusinessTable();
        String configJson = formConfig.getConfigJson();
        
        if (StrUtil.isBlank(tableName)) {
            throw new RuntimeException("业务表名不能为空");
        }
        
        if (StrUtil.isBlank(configJson)) {
            throw new RuntimeException("表单配置不能为空");
        }
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(configJson, Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> columns = (List<Map<String, Object>>) config.get("columns");
            
            if (columns == null || columns.isEmpty()) {
                throw new RuntimeException("表单字段配置不能为空");
            }
            
            createBusinessTable(tableName, columns);
            
            boolean result = this.save(formConfig);
            
            if (result) {
                log.info("创建表单和业务表成功: formCode={}, tableName={}", formConfig.getFormCode(), tableName);
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("创建表单和业务表失败", e);
            throw new RuntimeException("创建表单失败: " + e.getMessage());
        }
    }
    
    private void createBusinessTable(String tableName, List<Map<String, Object>> columns) {
        StringBuilder sql = new StringBuilder("CREATE TABLE IF NOT EXISTS ");
        sql.append(tableName).append(" (");
        sql.append(" id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',");
        
        java.util.Set<String> usedFields = new java.util.HashSet<>();
        usedFields.add("id");
        
        for (Map<String, Object> column : columns) {
            String field = (String) column.get("field");
            String title = (String) column.get("title");
            String type = (String) column.get("type");
            
            if ("id".equals(field) || usedFields.contains(field)) {
                continue;
            }
            
            usedFields.add(field);
            String sqlType = getSqlType(type, column);
            String comment = title != null ? title : field;
            
            sql.append(" ").append(field).append(" ").append(sqlType);
            sql.append(" COMMENT '").append(comment).append("',");
        }
        
        if (!usedFields.contains("status")) {
            sql.append(" status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',");
            usedFields.add("status");
        }
        
        if (!usedFields.contains("create_time")) {
            sql.append(" create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',");
            usedFields.add("create_time");
        }
        
        if (!usedFields.contains("update_time")) {
            sql.append(" update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',");
            usedFields.add("update_time");
        }
        
        if (!usedFields.contains("deleted")) {
            sql.append(" deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',");
            usedFields.add("deleted");
        }
        
        sql.append(" PRIMARY KEY (id)");
        sql.append(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态业务表'");
        
        log.info("创建业务表 SQL: {}", sql);
        jdbcTemplate.execute(sql.toString());
    }
    
    private String getSqlType(String type, Map<String, Object> column) {
        if (type == null) {
            return "VARCHAR(255)";
        }
        
        switch (type) {
            case "input":
                String inputType = (String) column.get("inputType");
                if ("textarea".equals(inputType)) {
                    return "TEXT";
                }
                return "VARCHAR(255)";
            
            case "select":
            case "radio":
            case "checkbox":
                return "VARCHAR(100)";
            
            case "cascader":
                return "VARCHAR(500)";
            
            case "date":
                String dateType = (String) column.get("dateType");
                if ("dateTime".equals(dateType)) {
                    return "DATETIME";
                }
                return "DATE";
            
            case "upload":
                return "TEXT";
            
            case "richText":
                return "TEXT";
            
            case "switch":
                return "TINYINT";
            
            case "rate":
            case "slider":
                Integer max = (Integer) column.get("max");
                if (max != null && max > 10) {
                    return "INT";
                }
                return "TINYINT";
            
            default:
                return "VARCHAR(255)";
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteByFormCode(String formCode) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            return false;
        }
        
        boolean result = this.removeById(formConfig.getId());
        
        if (result) {
            String redisKey = REDIS_PREFIX + formCode;
            redisTemplate.delete(redisKey);
            log.info("清除Redis缓存并删除表单配置: {}", formCode);
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> getDynamicData(String formCode, Integer pageNum, Integer pageSize, Map<String, Object> params) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            throw new RuntimeException("表单配置不存在: " + formCode);
        }
        
        String businessTable = formConfig.getBusinessTable();
        if (StrUtil.isBlank(businessTable)) {
            throw new RuntimeException("业务表未配置: " + formCode);
        }
        
        StringBuilder countSql = new StringBuilder("SELECT COUNT(*) FROM " + businessTable + " WHERE deleted = 0 ");
        StringBuilder querySql = new StringBuilder("SELECT * FROM " + businessTable + " WHERE deleted = 0 ");
        
        Map<String, Object> paramMap = new HashMap<>();
        StringBuilder whereClause = new StringBuilder();
        
        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                
                if (EXCLUDED_PARAMS.contains(key)) {
                    continue;
                }
                
                if (value != null && StrUtil.isNotBlank(value.toString())) {
                    whereClause.append(" AND ").append(key).append(" LIKE :").append(key);
                    paramMap.put(key, "%" + value + "%");
                }
            }
        }
        
        countSql.append(whereClause);
        querySql.append(whereClause).append(" ORDER BY create_time DESC LIMIT :offset, :limit");
        
        Long total = namedParameterJdbcTemplate.queryForObject(countSql.toString(), paramMap, Long.class);
        
        int offset = (pageNum - 1) * pageSize;
        paramMap.put("offset", offset);
        paramMap.put("limit", pageSize);
        
        List<Map<String, Object>> records = namedParameterJdbcTemplate.queryForList(querySql.toString(), paramMap);
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", total);
        result.put("current", pageNum);
        result.put("size", pageSize);
        result.put("pages", (total + pageSize - 1) / pageSize);
        
        return result;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveDynamicData(String formCode, Map<String, Object> data) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            throw new RuntimeException("表单配置不存在: " + formCode);
        }
        
        String businessTable = formConfig.getBusinessTable();
        if (StrUtil.isBlank(businessTable)) {
            throw new RuntimeException("业务表未配置: " + formCode);
        }
        
        data.remove("id");
        data.remove("createTime");
        data.remove("updateTime");
        data.remove("deleted");
        
        if (data.isEmpty()) {
            throw new RuntimeException("没有可插入的数据");
        }
        
        StringBuilder columns = new StringBuilder();
        StringBuilder values = new StringBuilder();
        Map<String, Object> paramMap = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            if (columns.length() > 0) {
                columns.append(", ");
                values.append(", ");
            }
            
            columns.append(key);
            values.append(":").append(key);
            paramMap.put(key, value);
        }
        
        String sql = "INSERT INTO " + businessTable + " (" + columns + ") VALUES (" + values + ")";
        
        int rows = namedParameterJdbcTemplate.update(sql, paramMap);
        return rows > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateDynamicData(String formCode, Long id, Map<String, Object> data) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            throw new RuntimeException("表单配置不存在: " + formCode);
        }
        
        String businessTable = formConfig.getBusinessTable();
        if (StrUtil.isBlank(businessTable)) {
            throw new RuntimeException("业务表未配置: " + formCode);
        }
        
        data.remove("id");
        data.remove("createTime");
        data.remove("updateTime");
        data.remove("deleted");
        
        if (data.isEmpty()) {
            throw new RuntimeException("没有可更新的数据");
        }
        
        StringBuilder setClause = new StringBuilder();
        Map<String, Object> paramMap = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            if (setClause.length() > 0) {
                setClause.append(", ");
            }
            
            setClause.append(key).append(" = :").append(key);
            paramMap.put(key, value);
        }
        
        paramMap.put("id", id);
        
        String sql = "UPDATE " + businessTable + " SET " + setClause + " WHERE id = :id AND deleted = 0";
        
        int rows = namedParameterJdbcTemplate.update(sql, paramMap);
        return rows > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteDynamicData(String formCode, Long id) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            throw new RuntimeException("表单配置不存在: " + formCode);
        }
        
        String businessTable = formConfig.getBusinessTable();
        if (StrUtil.isBlank(businessTable)) {
            throw new RuntimeException("业务表未配置: " + formCode);
        }
        
        String sql = "UPDATE " + businessTable + " SET deleted = 1 WHERE id = ? AND deleted = 0";
        
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }
    
    @Override
    public Map<String, Object> getDynamicDataById(String formCode, Long id) {
        FormConfig formConfig = getByFormCode(formCode);
        if (formConfig == null) {
            throw new RuntimeException("表单配置不存在: " + formCode);
        }
        
        String businessTable = formConfig.getBusinessTable();
        if (StrUtil.isBlank(businessTable)) {
            throw new RuntimeException("业务表未配置: " + formCode);
        }
        
        String sql = "SELECT * FROM " + businessTable + " WHERE id = ? AND deleted = 0";
        
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, id);
        
        return results.isEmpty() ? null : results.get(0);
    }
}
