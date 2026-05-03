package com.lowcode.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lowcode.common.Result;
import com.lowcode.entity.FormConfig;
import com.lowcode.service.FormConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/form/config")
@RequiredArgsConstructor
@Tag(name = "表单配置管理", description = "动态表单配置相关接口")
public class FormConfigController {
    
    private final FormConfigService formConfigService;
    
    @GetMapping("/{formCode}")
    @Operation(summary = "根据表单编码获取配置", description = "获取指定表单编码的完整配置信息，包括JSON配置")
    public Result<FormConfig> getByFormCode(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode) {
        log.info("获取表单配置: {}", formCode);
        FormConfig formConfig = formConfigService.getByFormCode(formCode);
        if (formConfig == null) {
            return Result.error("表单配置不存在: " + formCode);
        }
        return Result.success(formConfig);
    }
    
    @GetMapping("/json/{formCode}")
    @Operation(summary = "根据表单编码获取JSON配置", description = "直接返回表单配置的JSON字符串，供前端渲染使用")
    public Result<String> getConfigJsonByFormCode(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode) {
        log.info("获取表单JSON配置: {}", formCode);
        String configJson = formConfigService.getConfigJsonByFormCode(formCode);
        if (configJson == null) {
            return Result.error("表单配置不存在: " + formCode);
        }
        return Result.success(configJson);
    }
    
    @GetMapping("/list")
    @Operation(summary = "获取所有启用的表单列表", description = "获取所有状态为启用的表单配置列表")
    public Result<List<FormConfig>> listAll() {
        log.info("获取所有启用的表单列表");
        List<FormConfig> list = formConfigService.listAll();
        return Result.success(list);
    }
    
    @GetMapping("/page")
    @Operation(summary = "分页查询表单配置列表", description = "支持按表单编码和名称模糊查询")
    public Result<Page<FormConfig>> pageList(
            @Parameter(description = "页码", example = "1")
            @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数", example = "10")
            @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "表单编码（模糊查询）")
            @RequestParam(required = false) String formCode,
            @Parameter(description = "表单名称（模糊查询）")
            @RequestParam(required = false) String formName) {
        log.info("分页查询表单配置列表: pageNum={}, pageSize={}, formCode={}, formName={}", 
                pageNum, pageSize, formCode, formName);
        Page<FormConfig> page = formConfigService.pageList(pageNum, pageSize, formCode, formName);
        return Result.success(page);
    }
    
    @PostMapping("/create")
    @Operation(summary = "创建新表单（同时创建业务表）", description = "创建新的表单配置，并自动创建对应的业务表")
    public Result<Boolean> createForm(@RequestBody FormConfig formConfig) {
        log.info("创建新表单: formCode={}, businessTable={}", formConfig.getFormCode(), formConfig.getBusinessTable());
        try {
            formConfig.setStatus(1);
            formConfig.setVersion(1);
            boolean result = formConfigService.createFormWithTable(formConfig);
            return Result.success(result);
        } catch (Exception e) {
            log.error("创建表单失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }
    
    @PostMapping
    @Operation(summary = "保存或更新表单配置", description = "新增或修改表单配置信息")
    public Result<Boolean> saveOrUpdate(@RequestBody FormConfig formConfig) {
        log.info("保存或更新表单配置: {}", formConfig.getFormCode());
        try {
            boolean result = formConfigService.saveOrUpdateFormConfig(formConfig);
            return Result.success(result);
        } catch (Exception e) {
            log.error("保存表单配置失败", e);
            return Result.error("保存失败: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{formCode}")
    @Operation(summary = "删除表单配置", description = "根据表单编码逻辑删除表单配置")
    public Result<Boolean> deleteByFormCode(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode) {
        log.info("删除表单配置: {}", formCode);
        try {
            boolean result = formConfigService.deleteByFormCode(formCode);
            return Result.success(result);
        } catch (Exception e) {
            log.error("删除表单配置失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
