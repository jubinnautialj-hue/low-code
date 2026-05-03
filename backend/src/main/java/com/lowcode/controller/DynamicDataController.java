package com.lowcode.controller;

import com.lowcode.common.Result;
import com.lowcode.service.FormConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/dynamic/data")
@RequiredArgsConstructor
@Tag(name = "动态数据管理", description = "基于表单配置的动态数据增删改查接口")
public class DynamicDataController {
    
    private final FormConfigService formConfigService;
    
    @GetMapping("/{formCode}/page")
    @Operation(summary = "分页查询动态数据", description = "根据表单编码分页查询对应的业务表数据")
    public Result<Map<String, Object>> getDynamicDataPage(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode,
            @Parameter(description = "页码", example = "1")
            @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数", example = "10")
            @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "查询参数（JSON格式）")
            @RequestParam(required = false) Map<String, Object> params) {
        log.info("分页查询动态数据: formCode={}, pageNum={}, pageSize={}", formCode, pageNum, pageSize);
        try {
            Map<String, Object> result = formConfigService.getDynamicData(formCode, pageNum, pageSize, params);
            return Result.success((Map<String, Object>) result.get("records"), (Long) result.get("total"));
        } catch (Exception e) {
            log.error("查询动态数据失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    @GetMapping("/{formCode}/{id}")
    @Operation(summary = "根据ID查询动态数据", description = "根据表单编码和ID查询单条数据")
    public Result<Map<String, Object>> getDynamicDataById(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode,
            @Parameter(description = "数据ID", required = true)
            @PathVariable Long id) {
        log.info("根据ID查询动态数据: formCode={}, id={}", formCode, id);
        try {
            Map<String, Object> data = formConfigService.getDynamicDataById(formCode, id);
            if (data == null) {
                return Result.error("数据不存在");
            }
            return Result.success(data);
        } catch (Exception e) {
            log.error("查询动态数据失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    @PostMapping("/{formCode}")
    @Operation(summary = "保存动态数据", description = "根据表单编码向对应的业务表插入数据")
    public Result<Boolean> saveDynamicData(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode,
            @RequestBody Map<String, Object> data) {
        log.info("保存动态数据: formCode={}", formCode);
        try {
            boolean result = formConfigService.saveDynamicData(formCode, data);
            return Result.success(result);
        } catch (Exception e) {
            log.error("保存动态数据失败", e);
            return Result.error("保存失败: " + e.getMessage());
        }
    }
    
    @PutMapping("/{formCode}/{id}")
    @Operation(summary = "更新动态数据", description = "根据表单编码和ID更新业务表数据")
    public Result<Boolean> updateDynamicData(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode,
            @Parameter(description = "数据ID", required = true)
            @PathVariable Long id,
            @RequestBody Map<String, Object> data) {
        log.info("更新动态数据: formCode={}, id={}", formCode, id);
        try {
            boolean result = formConfigService.updateDynamicData(formCode, id, data);
            return Result.success(result);
        } catch (Exception e) {
            log.error("更新动态数据失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{formCode}/{id}")
    @Operation(summary = "删除动态数据", description = "根据表单编码和ID逻辑删除业务表数据")
    public Result<Boolean> deleteDynamicData(
            @Parameter(description = "表单编码", required = true)
            @PathVariable String formCode,
            @Parameter(description = "数据ID", required = true)
            @PathVariable Long id) {
        log.info("删除动态数据: formCode={}, id={}", formCode, id);
        try {
            boolean result = formConfigService.deleteDynamicData(formCode, id);
            return Result.success(result);
        } catch (Exception e) {
            log.error("删除动态数据失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
