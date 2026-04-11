// 最大行数限制
const MAX_LINES = 1000;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 监听文本输入变化，更新行数统计
    document.getElementById('textInput').addEventListener('input', updateLineCount);

    // 初始化行数统计
    updateLineCount();
});

// 更新行数统计
function updateLineCount() {
    const text = document.getElementById('textInput').value;
    const lines = text.split('\n');
    const lineCount = lines.length;

    const lineInfo = document.getElementById('lineInfo');

    if (lineCount > MAX_LINES) {
        lineInfo.innerHTML = `行数: ${lineCount} <span style="color: #dc3545;">(超过限制，仅处理前${MAX_LINES}行)</span>`;
    } else {
        lineInfo.textContent = `行数: ${lineCount}`;
    }
}

// 文本转表格核心函数
function convertToTable(text, columns) {
    // 1. 按行分割，保留空行
    const lines = text.split('\n');

    // 2. 限制最大行数
    const validLines = lines.slice(0, MAX_LINES);

    // 3. 验证列数
    if (columns < 2) {
        columns = 2;
    } else if (columns > 10) {
        columns = 10;
    }

    // 4. 按列数分组
    const rows = [];
    for (let i = 0; i < validLines.length; i += columns) {
        const rowCells = [];
        for (let j = 0; j < columns; j++) {
            const index = i + j;
            rowCells.push(index < validLines.length ? validLines[index] : '');
        }
        rows.push(rowCells.join('\t'));
    }

    // 5. 返回结果
    return rows.join('\n');
}

// 转换按钮点击事件
function convertText() {
    const inputText = document.getElementById('textInput').value;

    // 检查输入是否为空
    if (!inputText.trim()) {
        showToast('请输入文本内容');
        return;
    }

    // 获取列数
    let columnCount = parseInt(document.getElementById('columnCount').value);

    // 验证列数
    if (isNaN(columnCount) || columnCount < 2) {
        columnCount = 2;
        document.getElementById('columnCount').value = 2;
    } else if (columnCount > 10) {
        columnCount = 10;
        document.getElementById('columnCount').value = 10;
    }

    // 检查行数是否超过限制
    const lines = inputText.split('\n');
    if (lines.length > MAX_LINES) {
        showToast(`输入超过${MAX_LINES}行，仅处理前${MAX_LINES}行`);
    }

    // 执行转换
    try {
        const result = convertToTable(inputText, columnCount);

        // 更新文本框内容
        document.getElementById('textInput').value = result;

        // 更新行数统计
        updateLineCount();

        // 显示成功提示
        showToast('转换成功');
    } catch (error) {
        console.error('转换失败:', error);
        showToast('转换失败，请检查输入内容');
    }
}

// 复制结果到剪贴板
async function copyResult() {
    const text = document.getElementById('textInput').value;

    if (!text.trim()) {
        showToast('没有内容可复制');
        return;
    }

    try {
        // 使用现代API复制
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('已复制到剪贴板');
        } else {
            // 降级方案：使用document.execCommand
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('已复制到剪贴板');
            } catch (err) {
                console.error('复制失败:', err);
                showToast('复制失败，请手动复制');
            }
            document.body.removeChild(textarea);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    }
}

// 清空所有内容
function clearAll() {
    // 清空文本框
    document.getElementById('textInput').value = '';

    // 重置列数为默认值2
    document.getElementById('columnCount').value = 2;

    // 更新行数统计
    updateLineCount();

    // 显示提示
    showToast('已清空所有内容');
}

// 显示提示信息
function showToast(message) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 2秒后自动消失
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// 支持Ctrl+Enter快捷键转换
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        convertText();
    }
});


// 显示Toast提示
        function showToast(message, duration = 2000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.display = 'block';
            toast.classList.remove('fade-out');

            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 300);
            }, duration);
        }

        // 清空所有内容
        function clearAll() {
            document.getElementById('textInput').value = '';
            updateLineCount();
            showToast('已清空所有内容');
        }

        // 复制结果
        function copyResult() {
            const textarea = document.getElementById('textInput');
            textarea.select();
            textarea.setSelectionRange(0, 99999); // 兼容移动端

            try {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    showToast('已复制到剪贴板！');
                }).catch(() => {
                    // 降级方案
                    document.execCommand('copy');
                    showToast('已复制到剪贴板！');
                });
            } catch (err) {
                showToast('复制失败，请手动复制');
            }
        }

        // 转换文本
        function convertText() {
            const text = document.getElementById('textInput').value;
            const columns = parseInt(document.getElementById('columnCount').value) || 2;

            if (!text.trim()) {
                showToast('请输入文本内容');
                return;
            }

            const result = convertToTable(text, columns);
            document.getElementById('textInput').value = result;
            updateLineCount();
            showToast(`转换完成！共${result.split('\n').length}行`);
        }