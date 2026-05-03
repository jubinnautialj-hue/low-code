package com.lowcode.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.lowcode.entity.FormConfig;

import java.util.List;
import java.util.Map;

public interface FormConfigService extends IService<FormConfig> {
    
    FormConfig getByFormCode(String formCode);
    
    String getConfigJsonByFormCode(String formCode);
    
    Page<FormConfig> pageList(Integer pageNum, Integer pageSize, String formCode, String formName);
    
    List<FormConfig> listAll();
    
    boolean saveOrUpdateFormConfig(FormConfig formConfig);
    
    boolean createFormWithTable(FormConfig formConfig);
    
    boolean deleteByFormCode(String formCode);
    
    Map<String, Object> getDynamicData(String formCode, Integer pageNum, Integer pageSize, Map<String, Object> params);
    
    boolean saveDynamicData(String formCode, Map<String, Object> data);
    
    boolean updateDynamicData(String formCode, Long id, Map<String, Object> data);
    
    boolean deleteDynamicData(String formCode, Long id);
    
    Map<String, Object> getDynamicDataById(String formCode, Long id);
}
