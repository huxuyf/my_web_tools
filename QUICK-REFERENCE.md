# 统一UI设计系统 - 快速参考

## 🎨 CSS 变量速查

### 颜色
```css
--primary-color: #3b82f6;
--primary-hover: #2563eb;
--primary-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

--success-color: #10b981;
--warning-color: #f59e0b;
--error-color: #ef4444;
--info-color: #3b82f6;

--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;
--text-white: #ffffff;
```

### 字体
```css
--font-primary: 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-code: 'JetBrains Mono', 'Consolas', monospace;

--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 20px;
--font-size-3xl: 24px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 圆角
```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-full: 9999px;
```

### 阴影
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);
```

### 间距
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 40px;
```

### 动画
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

## 🧩 组件类名速查

### 布局
```
.container          - 主容器
.header             - 头部
.content            - 内容区
```

### 按钮
```
.btn                - 基础按钮
.btn-primary        - 主按钮（蓝色）
.btn-secondary      - 次要按钮（灰色）
.btn-success        - 成功按钮（绿色）
.btn-warning        - 警告按钮（橙色）
.btn-danger         - 危险按钮（红色）
.btn-sm             - 小按钮
.btn-lg             - 大按钮
```

### 输入框
```
.input              - 文本输入框
.textarea           - 文本域
.code               - 代码输入框
```

### 卡片
```
.card               - 卡片容器
.card-header        - 卡片头部
.card-title         - 卡片标题
.card-subtitle      - 卡片副标题
.card-body          - 卡片内容
.card-footer        - 卡片底部
```

### 面板
```
.panel              - 面板容器
.panel-header       - 面板头部
.panel-title        - 面板标题
.panel-actions      - 面板操作区
.panel-body         - 面板内容
```

### 信息提示
```
.info-box           - 信息提示容器
.info-box.info      - 信息提示（蓝色）
.info-box.success   - 成功提示（绿色）
.info-box.warning   - 警告提示（橙色）
.info-box.error     - 错误提示（红色）
```

### 交互组件
```
.toast              - Toast 提示
.toast.show         - 显示状态
.toast.fade-out     - 淡出状态

.modal-overlay      - Modal 遮罩
.modal-overlay.active - 显示状态
.modal              - Modal 容器
.modal-header       - Modal 头部
.modal-body         - Modal 内容
.modal-footer       - Modal 底部
.modal-close        - 关闭按钮

.loading-spinner    - 加载动画
.loading-container  - 加载容器
```

### 工具类
```
/* 文本对齐 */
.text-center        - 居中对齐
.text-left          - 左对齐
.text-right         - 右对齐

/* 文本颜色 */
.text-primary       - 主要文本
.text-secondary     - 次要文本
.text-tertiary      - 第三级文本
.text-white         - 白色文本
.text-success       - 成功文本
.text-warning       - 警告文本
.text-error         - 错误文本

/* 字重 */
.font-normal        - 正常 (400)
.font-medium        - 中等 (500)
.font-semibold      - 半粗 (600)
.font-bold          - 粗体 (700)

/* 间距 */
.mt-0 ~ mt-5        - 上边距
.mb-0 ~ mb-5        - 下边距

/* Flexbox */
.flex               - Flex 布局
.flex-col           - 列方向
.items-center       - 垂直居中
.justify-center     - 水平居中
.justify-between    - 两端对齐
.gap-2 ~ gap-4      - 间距

/* 显示 */
.hidden             - 隐藏
.block              - 块级显示
.inline-block       - 行内块
```

## 📝 常用代码片段

### 引入统一样式
```html
<link rel="stylesheet" href="../common-styles.css">
```

### 基础页面结构
```html
<div class="container">
    <div class="header">
        <h1>应用标题</h1>
        <p>应用描述</p>
    </div>
    <div class="content">
        <!-- 主要内容 -->
    </div>
</div>
```

### 按钮组
```html
<div class="flex gap-3">
    <button class="btn btn-primary">确定</button>
    <button class="btn btn-secondary">取消</button>
</div>
```

### 表单输入
```html
<div class="flex flex-col gap-3">
    <input type="text" class="input" placeholder="请输入">
    <textarea class="textarea" rows="4" placeholder="请输入"></textarea>
    <button class="btn btn-primary">提交</button>
</div>
```

### 卡片布局
```html
<div class="card">
    <div class="card-header">
        <h2 class="card-title">标题</h2>
        <p class="card-subtitle">副标题</p>
    </div>
    <div class="card-body">
        <p>内容</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">操作</button>
    </div>
</div>
```

### Toast 提示
```javascript
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type) toast.classList.add(type);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }, duration);
}
```

### Modal 对话框
```html
<div class="modal-overlay" id="modal">
    <div class="modal">
        <div class="modal-header">
            <h2>标题</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p>内容</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="confirmModal()">确定</button>
        </div>
    </div>
</div>
```

```javascript
function openModal() {
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}
```

### 信息提示
```html
<div class="info-box info">
    <h3>提示</h3>
    <p>信息内容</p>
</div>

<div class="info-box success">
    <h3>成功</h3>
    <p>成功内容</p>
</div>

<div class="info-box warning">
    <h3>警告</h3>
    <p>警告内容</p>
</div>

<div class="info-box error">
    <h3>错误</h3>
    <p>错误内容</p>
</div>
```

## 🎯 设计规范速查

| 组件 | 属性 | 值 |
|------|------|-----|
| 按钮 | 圆角 | 8px |
| 按钮 | 内边距（标准） | 12px 24px |
| 按钮 | 内边距（大） | 16px 40px |
| 按钮 | 内边距（小） | 8px 16px |
| 输入框 | 圆角 | 8px |
| 输入框 | 边框 | 1px solid #e5e7eb |
| 输入框 | 内边距 | 12px 16px |
| 输入框 | Focus边框 | #3b82f6 |
| 输入框 | Focus外发光 | 0 0 0 3px rgba(59, 130, 246, 0.1) |
| 卡片 | 圆角 | 12px |
| 卡片 | 阴影 | 0 8px 24px rgba(0,0,0,0.12) |
| 按钮 | 阴影 | 0 4px 12px rgba(0,0,0,0.1) |
| 大标题 | 字号 | 24px |
| 中标题 | 字号 | 20px |
| 小标题 | 字号 | 16px |
| 正文 | 字号 | 14px |
| 小字 | 字号 | 12px/13px |

## 📱 响应式断点

```css
/* 移动设备 */
@media (max-width: 480px) { }

/* 平板设备 */
@media (max-width: 768px) { }

/* 桌面设备 */
@media (max-width: 1200px) { }
```

## 🔧 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ 移动端浏览器

## 📚 相关文档

- 📖 [完整使用指南](./UNIFIED-UI-GUIDE.md)
- ✅ [迁移检查清单](./MIGRATION-CHECKLIST.md)
- 🎨 [示例应用](./example-unified/index.html)
- 💻 [统一样式文件](./common-styles.css)

## 💡 快速提示

1. **优先使用 CSS 变量**而不是硬编码值
2. **使用组件类名**而不是自定义类名
3. **遵循响应式设计**原则
4. **保持一致的间距**和圆角
5. **测试不同浏览器**和设备
6. **保持代码简洁**和可维护

## 🆘 常见问题

**Q: 如何自定义颜色？**
```css
/* 在应用特定样式中 */
:root {
    --primary-color: #your-color;
}
```

**Q: 如何覆盖样式？**
```css
/* 使用更具体的选择器 */
.my-app .btn-primary {
    background: custom-color;
}
```

**Q: 如何添加新组件？**
```css
/* 在 common-styles.css 中添加 */
.my-component {
    /* 样式定义 */
}
```

---

**版本**: 1.0  
**最后更新**: 2026-04-01  
**维护者**: Web Tools Team
