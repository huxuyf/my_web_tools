# 统一UI设计系统使用指南

## 📋 概述

本文档说明如何在各个Web工具应用中使用统一的UI设计系统，确保所有应用保持一致的视觉风格。

## 🎨 设计系统文件

- **统一样式文件**: `common-styles.css`
- **位置**: 项目根目录
- **版本**: 1.0

## 🔧 使用方法

### 方法一：直接引入（推荐）

在应用的 `<head>` 标签中引入统一样式文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>应用标题</title>
    <!-- 引入统一样式 -->
    <link rel="stylesheet" href="../common-styles.css">
    
    <!-- 应用特定样式（可选） -->
    <style>
        /* 在这里添加应用特定的样式覆盖 */
    </style>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

### 方法二：复制样式（离线使用）

对于需要完全离线的应用，可以将 `common-styles.css` 的内容复制到应用自己的 `<style>` 标签中。

## 📦 组件使用指南

### 1. 布局结构

#### 基础容器
```html
<body>
    <div class="container">
        <div class="header">
            <h1>应用标题</h1>
            <p>应用描述</p>
        </div>
        
        <div class="content">
            <!-- 主要内容 -->
        </div>
    </div>
</body>
```

#### 卡片布局
```html
<div class="card">
    <div class="card-header">
        <h2 class="card-title">卡片标题</h2>
        <p class="card-subtitle">卡片副标题</p>
    </div>
    <div class="card-body">
        <!-- 卡片内容 -->
    </div>
    <div class="card-footer">
        <!-- 卡片底部 -->
    </div>
</div>
```

#### 面板布局
```html
<div class="panel">
    <div class="panel-header">
        <span class="panel-title">面板标题</span>
        <div class="panel-actions">
            <button class="btn btn-sm btn-secondary">操作1</button>
            <button class="btn btn-sm btn-primary">操作2</button>
        </div>
    </div>
    <div class="panel-body">
        <!-- 面板内容 -->
    </div>
</div>
```

### 2. 按钮组件

#### 主按钮
```html
<button class="btn btn-primary">主按钮</button>
<button class="btn btn-primary btn-lg">大按钮</button>
<button class="btn btn-primary btn-sm">小按钮</button>
```

#### 次要按钮
```html
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-secondary btn-lg">大按钮</button>
<button class="btn btn-secondary btn-sm">小按钮</button>
```

#### 功能按钮
```html
<button class="btn btn-success">成功</button>
<button class="btn btn-warning">警告</button>
<button class="btn btn-danger">危险</button>
```

#### 按钮组
```html
<div class="flex gap-3">
    <button class="btn btn-primary">确定</button>
    <button class="btn btn-secondary">取消</button>
</div>
```

### 3. 输入框组件

#### 文本输入框
```html
<input type="text" class="input" placeholder="请输入文本">
```

#### 文本域
```html
<textarea class="textarea" rows="6" placeholder="请输入多行文本"></textarea>
```

#### 代码输入框
```html
<textarea class="textarea code" rows="10" placeholder="请输入代码"></textarea>
```

#### 下拉选择框
```html
<select class="input">
    <option value="">请选择</option>
    <option value="1">选项1</option>
    <option value="2">选项2</option>
</select>
```

### 4. 信息提示组件

#### 信息提示
```html
<div class="info-box info">
    <h3>提示信息</h3>
    <p>这是一条信息提示内容</p>
</div>
```

#### 警告提示
```html
<div class="info-box warning">
    <h3>警告信息</h3>
    <p>这是一条警告提示内容</p>
</div>
```

#### 错误提示
```html
<div class="info-box error">
    <h3>错误信息</h3>
    <p>这是一条错误提示内容</p>
</div>
```

#### 成功提示
```html
<div class="info-box success">
    <h3>成功信息</h3>
    <p>这是一条成功提示内容</p>
</div>
```

### 5. Toast 提示

#### HTML 结构
```html
<div id="toast" class="toast">提示信息</div>
```

#### JavaScript 调用
```javascript
// 显示 Toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type) {
        toast.classList.add(type);
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }, duration);
}

// 使用示例
showToast('操作成功！', 'success');
showToast('操作失败！', 'error');
showToast('请检查输入！', 'warning');
```

### 6. Modal 对话框

#### HTML 结构
```html
<!-- Modal 遮罩 -->
<div class="modal-overlay" id="modal">
    <div class="modal">
        <div class="modal-header">
            <h2>对话框标题</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <!-- 对话框内容 -->
            <p>这是对话框的内容</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="confirmModal()">确定</button>
        </div>
    </div>
</div>
```

#### JavaScript 调用
```javascript
// 打开 Modal
function openModal() {
    document.getElementById('modal').classList.add('active');
}

// 关闭 Modal
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// 确认操作
function confirmModal() {
    // 执行确认操作
    closeModal();
}
```

### 7. 加载状态

#### HTML 结构
```html
<div class="loading-container">
    <div class="loading-spinner"></div>
    <span>正在加载...</span>
</div>
```

## 🎯 设计规范详情

### 颜色系统

| 用途 | CSS 变量 | 颜色值 |
|------|----------|--------|
| 主色 | `--primary-color` | #3b82f6 |
| 主色悬停 | `--primary-hover` | #2563eb |
| 主色渐变 | `--primary-gradient` | linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) |
| 成功色 | `--success-color` | #10b981 |
| 警告色 | `--warning-color` | #f59e0b |
| 错误色 | `--error-color` | #ef4444 |
| 信息色 | `--info-color` | #3b82f6 |

### 圆角规范

| 组件 | 圆角值 | CSS 变量 |
|------|--------|----------|
| 按钮 | 8px | `--radius-md` |
| 输入框 | 8px | `--radius-md` |
| 卡片 | 12px | `--radius-lg` |
| 小组件 | 6px | `--radius-sm` |

### 阴影规范

| 用途 | 阴影值 | CSS 变量 |
|------|--------|----------|
| 卡片 | 0 8px 24px rgba(0,0,0,0.12) | `--shadow-lg` |
| 按钮 | 0 4px 12px rgba(0,0,0,0.1) | `--shadow-md` |
| 小组件 | 0 2px 4px rgba(0,0,0,0.06) | `--shadow-sm` |

### 字体规范

| 用途 | 字号 | 字重 | CSS 变量 |
|------|------|------|----------|
| 大标题 | 24px | 600 | `--font-size-3xl`, `--font-weight-semibold` |
| 中标题 | 20px | 600 | `--font-size-2xl`, `--font-weight-semibold` |
| 小标题 | 16px | 600 | `--font-size-lg`, `--font-weight-semibold` |
| 正文 | 14px | 400 | `--font-size-base`, `--font-weight-normal` |
| 小字 | 12px | 400 | `--font-size-xs`, `--font-weight-normal` |

### 按钮规范

| 类型 | 尺寸 | 内边距 | 圆角 |
|------|------|--------|------|
| 主按钮 | 标准 | 12px 24px | 8px |
| 主按钮 | 大 | 16px 40px | 8px |
| 主按钮 | 小 | 8px 16px | 8px |
| 次要按钮 | 标准 | 12px 24px | 8px |

### 输入框规范

| 属性 | 值 |
|------|-----|
| 边框 | 1px solid #e5e7eb |
| 圆角 | 8px |
| 内边距 | 12px 16px |
| Focus边框 | #3b82f6 |
| Focus外发光 | 0 0 0 3px rgba(59, 130, 246, 0.1) |

### 响应式断点

| 设备类型 | 最大宽度 | 说明 |
|----------|----------|------|
| 移动设备 | 480px | 小屏手机 |
| 平板设备 | 768px | 平板电脑 |
| 桌面设备 | 1200px | 标准桌面 |

## 🔄 迁移步骤

### 步骤 1: 备份现有文件
```bash
# 备份应用的 index.html
cp app/index.html app/index.html.backup
```

### 步骤 2: 引入统一样式
在应用的 `<head>` 标签中添加：
```html
<link rel="stylesheet" href="../common-styles.css">
```

### 步骤 3: 更新 HTML 结构
将现有的 HTML 结构替换为统一的结构：
- 使用 `.container` 作为主容器
- 使用 `.header` 和 `.content` 布局
- 使用统一的组件类名

### 步骤 4: 移除自定义样式
删除应用中与统一样式冲突的自定义 CSS。

### 步骤 5: 保留特定样式
只保留应用特有的功能样式（如特定图表样式、甘特图样式等）。

### 步骤 6: 测试验证
- 测试所有功能是否正常
- 检查响应式布局
- 验证交互效果

## ⚠️ 注意事项

### 1. 样式优先级
```css
/* 统一样式优先级较低 */
.btn-primary { ... }

/* 应用特定样式优先级较高 */
.my-app .btn-primary { ... }
```

### 2. 样式覆盖
如需覆盖统一样式，使用更具体的选择器：
```css
/* 在应用特定样式中 */
.my-app .custom-button {
    background: custom-color;
}
```

### 3. JavaScript 兼容性
确保 JavaScript 代码中的类名与统一样式一致。

### 4. 第三方库样式
第三方库（如 ECharts、Mermaid、DHTMLX）的样式需要单独处理，不要覆盖。

## 📚 参考资源

- [CSS 变量文档](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Flexbox 布局](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [CSS Grid 布局](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [响应式设计](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## 🆘 常见问题

### Q1: 如何添加应用特定的样式？
A: 在引入 `common-styles.css` 之后，添加一个 `<style>` 标签，在其中编写应用特定的样式。

### Q2: 如何处理第三方库的样式冲突？
A: 第三方库的样式应该放在统一样式之前引入，或者使用命名空间来避免冲突。

### Q3: 如何自定义颜色？
A: 修改 `common-styles.css` 中的 CSS 变量定义，或者在应用特定样式中覆盖这些变量。

### Q4: 响应式布局不生效怎么办？
A: 确保在 `<head>` 中正确设置了 viewport meta 标签：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Q5: 如何添加新的组件？
A: 在 `common-styles.css` 中添加新的组件样式，遵循现有的命名规范和设计原则。

## 📞 技术支持

如有问题或建议，请联系开发团队。

---

**版本**: 1.0  
**最后更新**: 2026-04-01  
**维护者**: Web Tools Team
