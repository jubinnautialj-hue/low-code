package com.lowcode.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
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
    
    private static final String REDIS_PREFIX = "form:config:";
    private static final long REDIS_EXPIRE_TIME = 30;
    
    @Override
    public FormConfig getByFormCode(String formCode) {
        String redisKey = REDIS_PREFIX + formCode;
        Object cached = redisTemplate.opsForValue().get(redisKey);
        if (cached != null) {
            log.info("从Redis缓存获取表单配置: {}", formCode);
            return JSON.parseObject(JSON.toJSONString(cached), FormConfig.class);
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
