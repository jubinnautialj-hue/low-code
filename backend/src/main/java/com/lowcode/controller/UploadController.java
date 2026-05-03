package com.lowcode.controller;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.lowcode.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/upload")
@Tag(name = "文件上传", description = "文件上传相关接口")
public class UploadController {
    
    @Value("${upload.path:./uploads}")
    private String uploadPath;
    
    @Value("${upload.url-prefix:/api/uploads}")
    private String urlPrefix;
    
    @PostMapping
    @Operation(summary = "单文件上传", description = "上传单个文件，支持图片、文档等")
    public Result<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("开始上传文件: {}", file.getOriginalFilename());
        
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = FileUtil.extName(originalFilename);
            String fileName = IdUtil.simpleUUID() + "." + extension;
            
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String fullPath = uploadPath + File.separator + datePath;
            
            File dir = new File(fullPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            File destFile = new File(fullPath + File.separator + fileName);
            file.transferTo(destFile);
            
            String fileUrl = urlPrefix + "/" + datePath + "/" + fileName;
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("name", originalFilename);
            result.put("size", file.getSize());
            result.put("type", file.getContentType());
            
            log.info("文件上传成功: {}", fileUrl);
            return Result.success(result);
            
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
    
    @PostMapping("/batch")
    @Operation(summary = "多文件上传", description = "批量上传多个文件")
    public Result<List<Map<String, Object>>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        log.info("开始批量上传文件，数量: {}", files.length);
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            
            try {
                String originalFilename = file.getOriginalFilename();
                String extension = FileUtil.extName(originalFilename);
                String fileName = IdUtil.simpleUUID() + "." + extension;
                
                String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                String fullPath = uploadPath + File.separator + datePath;
                
                File dir = new File(fullPath);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                
                File destFile = new File(fullPath + File.separator + fileName);
                file.transferTo(destFile);
                
                String fileUrl = urlPrefix + "/" + datePath + "/" + fileName;
                
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("url", fileUrl);
                fileInfo.put("name", originalFilename);
                fileInfo.put("size", file.getSize());
                fileInfo.put("type", file.getContentType());
                
                results.add(fileInfo);
                log.info("文件上传成功: {}", fileUrl);
                
            } catch (IOException e) {
                log.error("文件上传失败: {}", file.getOriginalFilename(), e);
            }
        }
        
        return Result.success(results);
    }
    
    @DeleteMapping
    @Operation(summary = "删除文件", description = "根据文件URL删除服务器上的文件")
    public Result<Boolean> deleteFile(@RequestParam("url") String fileUrl) {
        log.info("删除文件: {}", fileUrl);
        
        if (StrUtil.isBlank(fileUrl)) {
            return Result.error("文件URL不能为空");
        }
        
        try {
            String relativePath = fileUrl.replace(urlPrefix + "/", "");
            String fullPath = uploadPath + File.separator + relativePath.replace("/", File.separator);
            
            File file = new File(fullPath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    log.info("文件删除成功: {}", fullPath);
                    return Result.success(true);
                } else {
                    return Result.error("文件删除失败");
                }
            } else {
                return Result.error("文件不存在");
            }
            
        } catch (Exception e) {
            log.error("删除文件失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
